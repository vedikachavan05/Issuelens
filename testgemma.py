
import requests
import json

url = "http://localhost:11434/api/chat"

prompt = """
Analyze this citizen complaint:
"There is a large pothole near a school and two bikes nearly fell."

Return a JSON object with these keys:
- category
- priority (High, Medium, or Low)
- reason
- department
- recommended_action

Keep every value concise.
Only suggest a department; do not claim the complaint was actually forwarded.
"""

response = requests.post(
    url,
    json={
        "model": "gemma3:4b",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "format": "json",
        "stream": False
    },
    timeout=180
)

response.raise_for_status()

result = response.json()
ai_text = result["message"]["content"]

print("\n--- IssueLens AI Analysis ---")
print(json.dumps(json.loads(ai_text), indent=4))
