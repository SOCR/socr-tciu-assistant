import supabase
import json
import os
import time
import random
from openai import OpenAI
from openai._exceptions import RateLimitError
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def create_embeddings(text: str):
    # Handle potential empty strings
    if not text or not text.strip():
        # Return a zero vector or handle as appropriate
        # Using a zero vector of the expected dimension (1536 for text-embedding-3-small)
        print("Warning: Empty string encountered for embedding. Returning zero vector.")
        return [0.0] * 1536
    try:
        return client.embeddings.create(input=[text.strip()], model="text-embedding-3-small").data[0].embedding
    except Exception as e:
        print(f"Error creating embedding for text: '{text[:100]}...': {e}")
        # Decide how to handle errors, e.g., return zero vector or skip
        return [0.0] * 1536

def create_content_summary(content: str, content_type: str = "section", title: str = ""):
    system_prompt = ""
    if content_type == "section":
        system_prompt = """You are an expert academic summarizer. Create a concise, information-dense summary of this textbook section (100-150 words). 
Focus on: 
- Key concepts and their definitions
- Main techniques or methodologies described
- Important relationships or principles
- Core takeaways readers should understand
Avoid filler phrases and maintain academic tone. Your summary should serve as an accurate, searchable reference."""
        
    elif content_type == "table":
        system_prompt = """Summarize this table in 3-4 concise sentences (60-80 words total). Describe:
- What data/information the table presents
- Key patterns or findings visible in the data
- The table's significance or purpose
- Any unusual or notable values
Use precise, technical language appropriate for data science contexts."""
        
    elif content_type == "r_code":
        system_prompt = """Create a concise technical description of this R code snippet (50-80 words).
Focus on:
- The code's primary purpose/functionality
- Key functions or methods used
- Input data requirements and output produced
- Any algorithms or statistical techniques implemented
Use precise programming terminology. The summary should help users understand what the code does without excessive detail."""

    user_prompt = f"Title: {title}\n\nContent: {content}"
    
    # Implement exponential backoff for rate limiting
    max_retries = 5
    retry_delay = 10  # Start with 2 seconds
    
    for retry in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            # print("summary for: ", title)
            # print(response.choices[0].message.content)
            # Add a small delay between API calls to avoid hitting rate limits
            time.sleep(1 + random.random())  # 1-2 second delay
            return response.choices[0].message.content
            
        except RateLimitError as e:
            wait_time = retry_delay * (2 ** retry) + random.random()
            print(f"Rate limit hit. Waiting {wait_time:.2f} seconds before retry {retry+1}/{max_retries}")
            time.sleep(wait_time)
            if retry == max_retries - 1:
                print(f"Failed after {max_retries} retries. Error: {e}")
                # Return a basic summary if we can't get one from the API
                return f"Summary of {title} (failed to generate due to rate limits)"
        except Exception as e:
            print(f"Error generating summary for {title}: {e}")
            return f"Summary of {title} (error during generation)"

def process_batch(batch_items, content_type, chapter_name):
    results = []
    
    for item in tqdm(batch_items, desc=f"Processing {content_type}"):
        if content_type == "section":
            title = item.get("title", "").strip()
            content = item.get("content", "").strip()
        elif content_type == "table":
            title = item.get("section", "").strip()
            content = item.get("content", "").strip()
        elif content_type == "r_code":
            title = item.get("section", "").strip()
            content = item.get("code", "").strip()
        else:
            continue
            
        if title and content:
            # Add delay between chunks to manage rate limits
            time.sleep(0.5)  # Small delay between each item
            
            summary = create_content_summary(content, content_type, title)
            embedding = create_embeddings(summary)
            
            results.append({
                "title": title,
                "content": content,
                "summary": summary,
                "type": content_type,
                "chapter": chapter_name,
                "embedding": embedding,
            })
            
    return results

def main():
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    supabase_client = supabase.create_client(supabase_url, supabase_key)

    source_dir = "TCIU_parsed_docs/"
    try:
        files_to_extract = [f for f in os.listdir(source_dir) if f.endswith(".json")]
    except FileNotFoundError:
        print(f"Error: Directory '{source_dir}' not found.")
        return

    if not files_to_extract:
        print(f"No JSON files found in '{source_dir}'.")
        return

    print(f"Found {len(files_to_extract)} JSON files to process.")

    for file in tqdm(files_to_extract, desc="Processing files"):
        file_path = os.path.join(source_dir, file)
        # Extract chapter name from filename (e.g., "05_SupervisedClassification_parsed.json" -> "05_SupervisedClassification")
        chapter_name = file.removesuffix('_parsed.json') # More robust than replace

        try:
            with open(file_path, 'r', encoding='utf-8') as f: # Specify encoding
                data = json.load(f)
        except json.JSONDecodeError:
            print(f"Error decoding JSON from file: {file_path}. Skipping.")
            continue
        except Exception as e:
            print(f"Error reading file {file_path}: {e}. Skipping.")
            continue

        batch_inserts = [] # Initialize batch list for this file

        # Process sections
        sections = process_batch(data.get("sections", []), "section", chapter_name)
        batch_inserts.extend(sections)
        
        # Add a longer delay between different content types
        time.sleep(3)
        
        # Process tables
        tables = process_batch(data.get("tables", []), "table", chapter_name)
        batch_inserts.extend(tables)
        
        time.sleep(3)
        
        # Process R code
        r_code = process_batch(data.get("r_code", []), "r_code", chapter_name)
        batch_inserts.extend(r_code)

        # Insert the batch for the current file if not empty
        if batch_inserts:
            try:
                # Split into smaller batches for insertion to avoid timeouts
                batch_size = 10
                for i in range(0, len(batch_inserts), batch_size):
                    current_batch = batch_inserts[i:i + batch_size]
                    supabase_client.table("tciu_docs").insert(current_batch).execute()
                    print(f"Inserted batch {i//batch_size + 1}/{(len(batch_inserts)-1)//batch_size + 1}")
                    # Add a small delay between batch inserts
                    time.sleep(1)
            except Exception as e:
                print(f"Error inserting batch for file {file}: {e}")
                # Save failed batches to disk for retry later
                error_file = f"error_{chapter_name}.json"
                with open(error_file, 'w', encoding='utf-8') as f:
                    json.dump(batch_inserts, f, ensure_ascii=False, indent=2)
                print(f"Failed batch saved to {error_file} for later retry")

if __name__ == "__main__":
    main()



