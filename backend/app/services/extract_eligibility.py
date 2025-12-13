import requests
from bs4 import BeautifulSoup
import time
from urllib.parse import urlparse

def scrape_url(url, timeout=10):
    """Scrape text content from a single URL."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Clean up text - remove extra whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return text
    except Exception as e:
        return f"Error scraping {url}: {str(e)}"

def scrape_urls_from_file(input_file, output_file, delay=1):
    """Read URLs from file and scrape all of them."""
    
    # Read URLs from input file
    with open(input_file, 'r', encoding='utf-8') as f:
        urls = [line.strip() for line in f if line.strip()]
    
    total_urls = len(urls)
    print(f"Found {total_urls} URLs to scrape")
    
    # Open output file
    with open(output_file, 'w', encoding='utf-8') as f:
        for idx, url in enumerate(urls, 1):
            print(f"Processing {idx}/{total_urls}: {url}")
            
            # Write separator and URL
            f.write(f"\n{'='*80}\n")
            f.write(f"URL {idx}: {url}\n")
            f.write(f"{'='*80}\n\n")
            
            # Scrape and write content
            content = scrape_url(url)
            f.write(content)
            f.write("\n\n")
            
            # Flush to disk periodically
            if idx % 10 == 0:
                f.flush()
            
            # Be polite - add delay between requests
            if idx < total_urls:
                time.sleep(delay)
    
    print(f"\nCompleted! Scraped {total_urls} URLs.")
    print(f"Output saved to: {output_file}")

if __name__ == "__main__":
    # Configuration
    INPUT_FILE = "../data/sources.txt"  # Your input file
    OUTPUT_FILE = "../data/scraped_content.txt"  # Output file
    DELAY_SECONDS = 1  # Delay between requests (be respectful to servers)
    
    print("Starting web scraping...")
    print(f"Input file: {INPUT_FILE}")
    print(f"Output file: {OUTPUT_FILE}")
    print(f"Delay between requests: {DELAY_SECONDS} seconds\n")
    
    scrape_urls_from_file("C:/Users/nilss/AppData/Local/Programs/Microsoft VS Code/document_links.txt", "C:/Users/nilss/AppData/Local/Programs/Microsoft VS Code/document_links_output2.txt", delay=0)