import requests
import json
from ollama.ollama_client import OllamaClient

def verify_and_load_model(model_name: str, client: OllamaClient) -> bool:
    """Verifies if the model exists in Ollama. If not, requests a pull."""
    models = client.list_local_models()
    model_names = [m.get("name") for m in models]
    
    # Also check if it matches without tag (e.g. llama3 vs llama3:latest)
    matches = [name for name in model_names if name.startswith(model_name)]
    if matches:
        print(f"Model '{model_name}' is verified and loaded.")
        return True
        
    print(f"Model '{model_name}' not found locally. Attempting to pull...")
    url = f"{client.base_url}/api/pull"
    try:
        response = requests.post(url, json={"name": model_name, "stream": False}, timeout=120)
        if response.status_code == 200:
            print(f"Successfully pulled '{model_name}'.")
            return True
    except Exception as e:
        print(f"Failed to pull model '{model_name}': {e}")
    return False
