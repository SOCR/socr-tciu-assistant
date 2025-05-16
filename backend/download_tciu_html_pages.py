import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def download_files_from_url(url, download_folder="socr_downloaded_tciu_files"):
    """
    Downloads all files listed on a given URL's directory page.

    Args:
        url (str): The URL of the directory listing page.
        download_folder (str): The name of the folder to save downloaded files.
                               Defaults to "socr_downloaded_files".
    """
    print(f"Starting download process from: {url}")
    print(f"Files will be saved to: {download_folder}")

    # Create the download folder if it doesn't exist
    if not os.path.exists(download_folder):
        os.makedirs(download_folder)
        print(f"Created directory: {download_folder}")

    try:
        # Send a GET request to the URL
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors (4xx or 5xx)
        print("Successfully fetched the directory page.")

        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')

        # Find all anchor (<a>) tags, which usually contain links
        links = soup.find_all('a')
        for link in links:
            print(link.get('href'))
        
        # if not links:
        #     print("No links found on the page.")
        #     return

        # downloaded_count = 0
        # skipped_count = 0

        # print(f"\nFound {len(links)} links. Processing...")

        # for link in links:
        #     href = link.get('href')

        #     if href:
        #         # Basic filtering:
        #         # - Skip links that are likely directory navigation or sorting parameters
        #         if href.startswith('?') or href.startswith('/') or href == '../' or href.endswith('/'):
        #             print(f"Skipping: {href} (likely a directory, parent link, or sorting parameter)")
        #             skipped_count += 1
        #             continue

        #         # Construct the full URL for the file
        #         file_url = urljoin(url, href)
                
        #         # Extract filename from href
        #         filename = os.path.basename(href)
                
        #         # Define the local path to save the file
        #         local_filepath = os.path.join(download_folder, filename)

        #         print(f"Attempting to download: {filename} from {file_url}")
                
        #         try:
        #             # Download the file
        #             file_response = requests.get(file_url, stream=True)
        #             file_response.raise_for_status()

        #             # Save the file
        #             with open(local_filepath, 'wb') as f:
        #                 for chunk in file_response.iter_content(chunk_size=8192):
        #                     f.write(chunk)
                    
        #             print(f"Successfully downloaded: {filename}")
        #             downloaded_count += 1
                
        #         except requests.exceptions.RequestException as e:
        #             print(f"Error downloading {filename}: {e}")
        #             skipped_count += 1
        #         except IOError as e:
        #             print(f"Error saving {filename}: {e}")
        #             skipped_count += 1
        #     else:
        #         print("Found a link tag without an href attribute.")
        #         skipped_count += 1
        
        # print("\n--- Download Summary ---")
        # print(f"Total files downloaded: {downloaded_count}")
        # print(f"Total links skipped/failed: {skipped_count}")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching the main URL {url}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    # The URL from which to download files
    target_url = "https://www.socr.umich.edu/TCIU/HTMLs/"
    
    # (Optional) Specify a different download folder name
    # custom_download_folder = "my_downloaded_htmls"
    # download_files_from_url(target_url, download_folder=custom_download_folder)
    
    download_files_from_url(target_url)
    print("\nScript finished.")
