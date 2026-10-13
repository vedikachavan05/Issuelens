
from flask import Flask, request, jsonify
import requests
import json
import base64

app = Flask(__name__)


# Allow frontend to communicate with Flask
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
    image_data = issue.get("image")

    # Validate required fields
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

    # Validate and extract Base64 image data
    if image_data:
        if not isinstance(image_data, str):
            return jsonify({
                "success": False,
                "message": "Invalid image data."
            }), 400

        if image_data.startswith("data:"):
            if "," not in image_data:
                return jsonify({
                    "success": False,
                    "message": "Invalid image format."
                }), 400

            header, image_data = image_data.split(",", 1)

            if ";base64" not in header:
                return jsonify({
                    "success": False,
                    "message": "Image must use Base64 encoding."
                }), 400

        try:
            base64.b64decode(image_data, validate=True)
        except (ValueError, base64.binascii.Error):
            return jsonify({
                "success": False,
                "message": "Invalid image encoding."
            }), 400

    # Prepare the AI prompt
    prompt = f"""
You are IssueLens, an assistant for civic issue reporting.

Analyze the civic issue using the description, location,
and uploaded image when available.

Description: {description}
Location: {location}

Return valid JSON with exactly these fields:
- category
- priority
- reason
- department
- recommended_action

Priority must be High, Medium, or Low.

Priority guidance:
- High: clear evidence of serious danger, major road
  obstruction, exposed electrical hazards, or similar risks.
- Medium: significant civic problems needing timely action.
- Low: minor issues without clear immediate danger.

Use the description and image as evidence.
Do not increase priority merely because an image is attached.
Do not invent hazards that cannot be established.
If the image is unclear, mention the uncertainty.
Do not claim the complaint has been submitted.
"""

    # Prepare the message for Gemma 3
    message = {
        "role": "user",
        "content": prompt
    }
    if image_data:
    # Remove any data URL prefix if one is present
      if image_data.startswith("data:"):
        image_data = image_data.split(",", 1)[1]

    # Decode and validate the image bytes
    try:
        image_bytes = base64.b64decode(image_data, validate=True)

        if not image_bytes:
            raise ValueError("Empty image")

        # Check for common supported image formats
        is_jpeg = image_bytes.startswith(b"\xff\xd8\xff")
        is_png = image_bytes.startswith(b"\x89PNG\r\n\x1a\n")
        is_webp = (
            image_bytes.startswith(b"RIFF")
            and image_bytes[8:12] == b"WEBP"
        )

        if not (is_jpeg or is_png or is_webp):
            return jsonify({
                "success": False,
                "message": "Please upload a valid JPEG, PNG, or WebP image."
            }), 400

        message["images"] = [
            base64.b64encode(image_bytes).decode("utf-8")
        ]

    except (ValueError, base64.binascii.Error):
        return jsonify({
            "success": False,
            "message": "The uploaded image is invalid. Please try another image."
        }), 400

    try:
        # Send request to Ollama
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "gemma3:4b",
                "messages": [message],
                "format": "json",
                "stream": False
            },
            timeout=180
        )

        response.raise_for_status()

        result = response.json()
        ai_text = result["message"]["content"]
        ai_result = json.loads(ai_text)

        # Validate the AI response
        required_fields = [
            "category",
            "priority",
            "reason",
            "department",
            "recommended_action"
        ]

        for field in required_fields:
            if field not in ai_result:
                raise ValueError(f"Missing AI field: {field}")

        if ai_result["priority"] not in ["High", "Medium", "Low"]:
            ai_result["priority"] = "Medium"

        # Return analysis to the frontend
        return jsonify({
            "success": True,
            "description": description,
            "location": location,
            "analysis": ai_result
        })

    except requests.HTTPError as error:
        print("Ollama HTTP status:", error.response.status_code)
        print("Ollama response:", error.response.text)

        return jsonify({
            "success": False,
            "message": "Ollama rejected the request. Check the Flask terminal."
        }), 502

    except requests.RequestException as error:
        print("Ollama connection error:", repr(error))

        return jsonify({
            "success": False,
            "message": "Could not connect to Ollama. Check whether Ollama is running."
        }), 503

    except (ValueError, KeyError, TypeError) as error:
        print("AI response error:", repr(error))

        return jsonify({
            "success": False,
            "message": "The AI returned an invalid response. Please try again."
        }), 502


if __name__ == "__main__":
    app.run(debug=True)
