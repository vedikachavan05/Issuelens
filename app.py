
from flask import Flask, request, jsonify
import requests
import json

app = Flask(__name__)


# Allow the frontend to communicate with Flask during development
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/")
def home():
    return "IssueLens backend connected successfully!"


@app.route("/api/analyze", methods=["POST"])
def analyze_issue():
    issue = request.get_json(silent=True) or {}

    description = str(issue.get("description", "")).strip()
    location = str(issue.get("location", "")).strip()

    # Step 1: Validate the input
    if not description and not location:
        return jsonify({
            "success": False,
            "message": "Please enter the description and location."
        }), 400

    if not description:
        return jsonify({
            "success": False,
            "message": "Please enter the description."
        }), 400

    if not location:
        return jsonify({
            "success": False,
            "message": "Please enter the location."
        }), 400

    # Step 2: Prepare the AI prompt
    prompt = f"""
Analyze this citizen complaint.

Description: {description}
Location: {location}

Return a JSON object with these keys:
- category
- priority (High, Medium, or Low)
- reason
- department
- recommended_action

Keep every value concise.
Suggest a department; do not claim the complaint was forwarded.
Use only the information provided. Do not invent facts.
"""

    # Step 3: Send the issue to Gemma 3 through Ollama
    try:
        response = requests.post(
            "http://localhost:11434/api/chat",
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
        ai_result = json.loads(ai_text)

        # Step 4: Return the result to the frontend
        return jsonify({
            "success": True,
            "description": description,
            "location": location,
            "analysis": ai_result
        })

    except requests.RequestException:
        return jsonify({
            "success": False,
            "message": "Could not connect to the AI service. Check whether Ollama is running."
        }), 503

    except (ValueError, KeyError, TypeError):
        return jsonify({
            "success": False,
            "message": "The AI returned an invalid response. Please try again."
        }), 502


if __name__ == "__main__":
    app.run(debug=True)
