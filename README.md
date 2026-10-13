# IssueLens 👁️
### See the Issue. Report the Problem.

IssueLens is an AI-powered civic issue reporting assistant that helps citizens turn everyday complaints into clear, structured, and actionable reports.

By combining natural-language processing with optional image analysis, IssueLens aims to make civic issue reporting simpler, more accessible, and easier to understand.

## 🎯 Problem Statement

Citizens often encounter civic problems such as garbage accumulation, potholes, damaged roads, and drainage issues. However, preparing a clear complaint, identifying the appropriate category, and finding the correct reporting channel can be confusing and time-consuming.

IssueLens helps bridge this gap by assisting citizens in understanding, documenting, and preparing reports about civic issues.

## 💡 Our Solution

IssueLens provides a guided workflow that allows citizens to:

- Describe a civic issue in their own words.
- Enter the issue location.
- Optionally upload an image as supporting evidence.
- Receive an AI-generated issue category and priority suggestion.
- Understand why the issue may require attention.
- Generate an editable complaint title and description.
- Find relevant official reporting options.
- Copy the prepared complaint for submission through an appropriate channel.

## ✨ Key Features

### 1. AI-Powered Issue Analysis
Uses Gemma 3 to analyze complaint descriptions and generate structured information, including the detected issue, category, suggested priority, reasoning, and recommended action.

### 2. Optional Image Analysis
Designed to support image-assisted identification of visible civic problems, subject to successful implementation and testing.

### 3. Automatic Complaint Drafting
Transforms informal descriptions into clearer, more organized complaint drafts that citizens can review and edit.

### 4. Priority Suggestions
Suggests an urgency level based on the reported circumstances and explains the reasoning. These are AI-generated recommendations, not official decisions.

### 5. Guided Reporting Workflow
Provides a step-by-step interface: Report an Issue → Review AI Analysis → Report Ready.

### 6. Accessible User Interface
Aims to make civic reporting straightforward through a clean, mobile-friendly interface.

## 🔄 How It Works

1. **Report:** The citizen enters the issue description and location and may upload an image.
2. **Validate:** The Python backend checks the submitted information.
3. **Analyze:** Gemma 3 processes the complaint and generates structured AI output.
4. **Review:** The citizen reviews and edits the generated complaint.
5. **Prepare:** IssueLens provides a copyable complaint and relevant reporting options.

> IssueLens assists with preparing civic complaints. Unless an official integration is implemented, it does not automatically submit complaints to government authorities or guarantee resolution.

## 🛠️ Technology Stack

- **Frontend:** HTML, CSS, JavaScript (as implemented by the frontend team)
- **Backend:** Python, Flask
- **AI Model:** Gemma 3 4B
- **Local Model Runtime:** Ollama
- **Communication:** Ollama local HTTP API
- **Version Control:** Git and GitHub

## 🧠 AI Integration

IssueLens uses Gemma 3 through Ollama to generate structured analysis from citizen complaints.

Example input:

"There is a large pothole near a school and two bikes nearly fell."

Example output:

```json
{
  "category": "Road Maintenance",
  "priority": "High",
  "reason": "Safety hazard near school",
  "department": "Public Works",
  "recommended_action": "Repair pothole immediately"
}
```

This is an illustrative output from an initial model test. AI-generated results may be inaccurate and should be reviewed before use.

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or a compatible version
- Git
- Ollama
- Gemma 3 4B model
- A code editor such as Visual Studio Code

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

Replace the placeholders with your actual GitHub repository URL and folder name.

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

### 3. Install dependencies

```bash
python -m pip install flask requests
```

Additional dependencies may be required as the project develops.

### 4. Install and start the AI model

Install Ollama from its official website:

https://ollama.com/

Download the model:

```bash
ollama pull gemma3:4b
```

Confirm the model is available:

```bash
ollama list
```

Ollama must be running for local AI requests to work.

### 5. Test the AI integration

If `testgemma.py` is included in your repository:

```bash
python testgemma.py
```

This test sends a sample complaint to the local Ollama API and prints the structured AI analysis.

### 6. Run the Flask application

Once the Flask backend is implemented:

```bash
python app.py
```

Open the local address shown in the terminal, typically `http://127.0.0.1:5000/`.

**Note:** The final startup and frontend connection instructions may change as the backend and frontend are integrated.

## 📁 Project Structure

```text
IssueLens/
├── app.py              # Flask backend
├── testgemma.py        # AI integration test
├── analysis.py         # Complaint analysis logic, if separate
├── requirements.txt    # Python dependencies
├── .gitignore          # Files excluded from Git
├── README.md           # Project documentation
└── frontend/           # Frontend files, if organized separately
```

Adjust the structure to match the actual repository. Do not create duplicate analysis files if the logic already lives inside another file.

## 🔐 Responsible AI

- AI-generated categories and priorities are suggestions, not verified facts.
- Citizens should be able to review and edit complaint drafts.
- Images and location data should be handled responsibly.
- The system should communicate uncertainty when evidence is insufficient.
- Official submission, complaint tracking, and resolution should only be claimed when those capabilities are actually integrated.

## 🌱 Future Scope

- Duplicate complaint detection.
- Multilingual complaint generation.
- Improved image-based issue identification.
- Integration with official civic grievance portals where supported.
- Complaint status tracking through authorized integrations.
- Geographic analysis of recurring civic problems.
- Analytics to help identify common issue patterns.

## 👥 Team

Developed as a hackathon project focused on using AI to simplify civic issue reporting.

## 📜 License

A license has not yet been specified. Add an appropriate open-source license if you intend to publish and distribute the project under one.
