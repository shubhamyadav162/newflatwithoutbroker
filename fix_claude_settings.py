import json
import os

# Path to settings.json
claude_dir = os.path.join(os.path.expanduser("~"), ".claude")
settings_path = os.path.join(claude_dir, "settings.json")

# Ensure directory exists
os.makedirs(claude_dir, exist_ok=True)

# Configuration for GLM-4.7
settings = {
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH",
        "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
        "API_TIMEOUT_MS": "3000000"
    }
}

# Write with proper JSON formatting
with open(settings_path, 'w', encoding='utf-8') as f:
    json.dump(settings, f, indent=2)

print(f"Settings file created at: {settings_path}")
print("\nContents:")
with open(settings_path, 'r', encoding='utf-8') as f:
    print(f.read())
