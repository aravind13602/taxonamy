import json
import requests
import os
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry  # Fixed import

# Photon API URL (use local instance for self-hosting)
PHOTON_API_URL = "https://photon.komoot.io/api"

# Configure session retries with increased backoff factor
session = requests.Session()
retry_strategy = Retry(
    total=5,
    backoff_factor=2,  # Increased backoff factor
    status_forcelist=[429, 500, 502, 503, 504]
)
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("https://", adapter)

# Function to fetch state for a city
def fetch_state_for_city(city_name):
    try:
        params = {"q": city_name, "limit": 1}
        response = session.get(PHOTON_API_URL, params=params, timeout=30)  # Increased timeout to 30 seconds
        response.raise_for_status()
        data = response.json()
        if data.get("features"):
            properties = data["features"][0]["properties"]
            return properties.get("state", "Unknown")
        return "Unknown"
    except requests.exceptions.RequestException as e:
        print(f"Error fetching state for '{city_name}': {e}")
        return "Unknown"

# Normalize city names
def normalize_city_name(city_name):
    return city_name.lower().strip()

# Function to process a single city
def process_single_entry(entry):
    city_name = normalize_city_name(entry.get("district"))
    state = fetch_state_for_city(city_name)
    entry["state"] = state
    return entry

# Function to split and process data in chunks
def update_states_in_chunks(input_file, output_dir, chunk_size=5000):
    with open(input_file, 'r') as file:
        cities_data = json.load(file)

    chunks = [cities_data[i:i + chunk_size] for i in range(0, len(cities_data), chunk_size)]

    # Ensure output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for idx, chunk in enumerate(chunks, start=1):
        print(f"Processing chunk {idx}/{len(chunks)} with {len(chunk)} entries...")
        processed_chunk = []
        for entry in chunk:
            processed_entry = process_single_entry(entry)
            processed_chunk.append(processed_entry)
        
        output_file = f"{output_dir}/output_part_{idx}.json"
        with open(output_file, 'w') as outfile:
            json.dump(processed_chunk, outfile, indent=4)
        print(f"Saved chunk {idx} to {output_file}")

# File paths
input_file = r'C:\Users\aravi\OneDrive\Desktop\taxonamy\tested-cities.json'
output_dir = r'C:\Users\aravi\OneDrive\Desktop\taxonamy'

# Run the script
update_states_in_chunks(input_file, output_dir)
