import supabase
import os
from openai import OpenAI
from dotenv import load_dotenv
import json # Added for potentially printing results nicely

# --- Initialization ---
load_dotenv()

# Initialize OpenAI client (used for embedding the query)
# Ensure OPENAI_API_KEY is set in your .env file
try:
    embedder = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    if not embedder.api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables.")
except Exception as e:
    print(f"Error initializing OpenAI client: {e}")
    exit() # Exit if OpenAI client can't be initialized

# Initialize Supabase client
# Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_url or not supabase_key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in environment variables.")
    exit() # Exit if Supabase config is missing

try:
    supabase_client = supabase.create_client(supabase_url, supabase_key)
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
    exit()

# --- Embedding Function (copied/adapted from vectorize_upload_to_supabase.py) ---
def create_query_embedding(text: str):
    """Generates an embedding for the given text using OpenAI."""
    if not text or not text.strip():
        print("Error: Query text cannot be empty.")
        return None
    try:
        response = embedder.embeddings.create(
            input=[text.strip()],
            model="text-embedding-3-small" # Make sure this matches the model used for stored embeddings
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error creating embedding for query: '{text[:100]}...': {e}")
        return None

# --- RPC Call Function ---
def get_relevant_docs(query_text: str, num_docs_to_fetch: int = 5):
    """
    Embeds a query and retrieves relevant documents from Supabase
    using the 'retrieve_docs' RPC function.
    """
    print(f"\nSearching for {num_docs_to_fetch} documents related to: '{query_text}'")

    # 1. Create embedding for the query text
    query_embedding = create_query_embedding(query_text)
    if query_embedding is None:
        print("Failed to create query embedding. Aborting search.")
        return None # Indicate failure

    # 2. Call the Supabase RPC function
    try:
        params = {
            'query_embedding': query_embedding,
            'num_docs': num_docs_to_fetch
        }
        response = supabase_client.rpc('retrieve_docs', params).execute()

        # Check for data in the response
        if response.data:
            print(f"Successfully retrieved {len(response.data)} documents:")
            # Print results nicely
            for i, doc in enumerate(response.data):
                print(f"  {i+1}. Title: {doc.get('title')}")
                print(f"     Type: {doc.get('type')}")
                print(f"     Content: {doc.get('content', '')[:150]}...") # Optionally print content snippet
                print(f"     Similarity: {doc.get('similarity'):.4f}")
                # print(f"     Content: {doc.get('content', '')[:150]}...") # Optionally print content snippet
                print("-" * 10)
            return response.data # Return the list of document dictionaries
        else:
            print("No relevant documents found.")
            return [] # Return empty list if no docs found

    except Exception as e:
        # Catch potential errors during the RPC call (e.g., network issues, DB errors)
        print(f"Error calling Supabase RPC 'retrieve_docs': {e}")
        # Check if the error message indicates the function doesn't exist
        if "function retrieve_docs" in str(e) and "does not exist" in str(e):
             print("Hint: Make sure you have executed the SQL to create the 'retrieve_docs' function in your Supabase database.")
        return None # Indicate failure


# --- Example Usage ---
if __name__ == "__main__":
    test_query = "How do I perform principal component analysis in R?"
    retrieved_documents = get_relevant_docs(test_query, num_docs_to_fetch=3)

    # You can now use the 'retrieved_documents' list if needed
    # if retrieved_documents:
    #    print("\nRetrieved documents (raw):")
    #    print(json.dumps(retrieved_documents, indent=2))

    print("\nAnother test:")
    test_query_2 = "What is tidyverse?"
    get_relevant_docs(test_query_2, num_docs_to_fetch=5)
