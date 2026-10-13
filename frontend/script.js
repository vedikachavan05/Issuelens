
const STORAGE_KEY = "issueLensData";
const USER_KEY = "issueLensDemoUser";


// LOGIN: Frontend demonstration only
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const savedUser = JSON.parse(localStorage.getItem(USER_KEY) || "null");
        const message = document.getElementById("loginMessage");

        if (!savedUser || savedUser.email !== email) {
            message.textContent = " register this email first.";
            return;
        }

        if (!password) {
            message.textContent = "Please enter your password.";
            return;
        }

        // This is not real password authentication.
        message.textContent = " login successful!";
        window.location.href = "index.html";
    });

    const googleButton = document.getElementById("googleButton");

    if (googleButton) {
        googleButton.addEventListener("click", function () {
            alert("Google login requires real authentication setup.");
        });
    }
}


// REGISTRATION: Demo only; no password is stored
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("fullName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const message = document.getElementById("registerMessage");

        if (password.length < 8) {
            message.textContent = "Password must contain at least 8 characters.";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            return;
        }

        localStorage.setItem(USER_KEY, JSON.stringify({
            name: name,
            email: email
        }));

        message.textContent = "registration successful! Opening login...";

        setTimeout(function () {
            window.location.href = "login.html";
        }, 800);
    });
}


// PAGE 1: Report an issue and call the Flask backend
const issueForm = document.getElementById("issueForm");

if (issueForm) {
    issueForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const description = document.getElementById("description").value.trim();
        const location = document.getElementById("location").value.trim();
        const issueMessage = document.getElementById("issueMessage");
        const photoInput = document.getElementById("photo");

        if (!description || !location) {
            issueMessage.textContent =
                "Please enter both description and location.";
            return;
        }

        // Preserve the optional image if the user selected one.
        let imageData = null;

        if (photoInput && photoInput.files.length > 0) {
            const file = photoInput.files[0];

            if (!file.type.startsWith("image/")) {
                issueMessage.textContent = "Please select a valid image.";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                issueMessage.textContent =
                    "Image size must be 5 MB or less.";
                return;
            }

            try {
                imageData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(reader.error);

                    reader.readAsDataURL(file);
                });
            } catch (error) {
                issueMessage.textContent = "Unable to read the selected image.";
                return;
            }
        }

        issueMessage.textContent = "Sending issue to IssueLens...";

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/analyze",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        description: description,
                        location: location
                    })
                    ,body: JSON.stringify({
                        description: description,
                         location: location,
                         image: imageData
                        })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                issueMessage.textContent =
                    data.message || "Unable to analyze the issue.";
                return;
            }

            // Save the real AI result for the analysis page.
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                description: data.description,
                location: data.location,
                image: imageData,
                analysis: data.analysis,
                complaint: ""
            }));

            window.location.href = "analysis.html";

        } catch (error) {
            console.error("IssueLens error:", error);

            issueMessage.textContent =
                "Cannot connect to the backend. Check Flask and Ollama.";
        }
    });
}


// PAGE 2: Display real Gemma AI analysis
const loadingState = document.getElementById("loadingState");

if (loadingState) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    if (!data) {
        alert("Please describe an issue first.");
        window.location.href = "index.html";
    } else {
        const analysisContent =
            document.getElementById("analysisContent");

        const analysis = data.analysis || {};

        // Display the analysis section.
        loadingState.classList.add("hidden");
        analysisContent.classList.remove("hidden");

        // Display the AI-generated results in separate cards.
        document.getElementById("issueType").textContent =
            analysis.category || "Reported civic issue";

        document.getElementById("issueLocation").textContent =
            data.location || "Not available";

        document.getElementById("issuePriority").textContent =
            analysis.priority || "Not specified";

        document.getElementById("issueReason").textContent =
            analysis.reason || "Not provided";

        document.getElementById("issueDepartment").textContent =
            analysis.department || "Not specified";

        document.getElementById("issueAction").textContent =
            analysis.recommended_action || "Not provided";

        // Display the optional uploaded image.
        const analysisImage =
            document.getElementById("analysisImage");

        if (analysisImage) {
            if (data.image) {
                analysisImage.src = data.image;
                analysisImage.classList.remove("hidden");
            } else {
                analysisImage.removeAttribute("src");
                analysisImage.classList.add("hidden");
            }
        }

        // Generate an editable complaint draft.
        data.complaint =
            "Subject: " +
            (analysis.category || "Civic issue") +
            " at " + data.location +
            "\n\nI would like to report the following civic issue: " +
            data.description +
            "\n\nLocation: " + data.location +
            "\n\nPriority: " + (analysis.priority || "Not specified") +
            "\n\nSuggested department: " +
            (analysis.department || "Relevant civic department") +
            "\n\nRecommended action: " +
            (analysis.recommended_action || "Please inspect the reported issue.") +
            "\n\nKindly inspect the area and take appropriate action. Thank you.";

        document.getElementById("complaintPreview").value =
            data.complaint;

        document.getElementById("reviewButton").addEventListener(
            "click", function () {
                data.complaint =
                    document.getElementById("complaintPreview").value.trim();

                if (!data.complaint) {
                    alert("Please enter a complaint before continuing.");
                    return;
                }

                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                window.location.href = "report.html";
            }
        );
    }
}


// PAGE 3: Edit and copy the final complaint
const finalComplaint = document.getElementById("finalComplaint");

if (finalComplaint) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    if (!data) {
        alert("Please start by reporting an issue.");
        window.location.href = "index.html";
    } else {
        document.getElementById("reportTitle").value =
            "Request regarding issue at " + data.location;

        finalComplaint.value = data.complaint || "";

        document.getElementById("reportLocation").textContent =
            "Issue location: " + data.location;
    }

    document.getElementById("copyButton").addEventListener(
        "click", async function () {
            const title = document.getElementById("reportTitle").value.trim();
            const description = finalComplaint.value.trim();
            const message = document.getElementById("copyMessage");

            if (!title || !description) {
                message.textContent =
                    "Please enter both the complaint title and description.";
                return;
            }

            const fullComplaint =
                "Subject: " + title + "\n\n" + description;

            try {
                await navigator.clipboard.writeText(fullComplaint);
                message.textContent = "✓ Complaint copied to clipboard!";
            } catch (error) {
                const temporary = document.createElement("textarea");
                temporary.value = fullComplaint;
                temporary.style.position = "fixed";
                temporary.style.opacity = "0";

                document.body.appendChild(temporary);
                temporary.select();

                const copied = document.execCommand("copy");
                temporary.remove();

                message.textContent = copied
                    ? "✓ Complaint copied to clipboard!"
                    : "Copy failed. Please select and copy the complaint manually.";
            }
        }
    );

    document.getElementById("newReportButton").addEventListener(
        "click", function () {
            localStorage.removeItem(STORAGE_KEY);
            window.location.href = "index.html";
        }
    );
}

const locationButton = document.getElementById("currentLocationButton");

if (locationButton) {
    locationButton.addEventListener("click", function () {
        const locationInput = document.getElementById("location");
        const message = document.getElementById("locationMessage");

        if (!navigator.geolocation) {
            message.textContent = "Location is not supported by this browser.";
            return;
        }

        message.textContent = "Detecting your location...";
        locationButton.disabled = true;

        navigator.geolocation.getCurrentPosition(
            async function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                    );

                    if (!response.ok) {
                        throw new Error("Address lookup failed");
                    }

                    const result = await response.json();

                    locationInput.value =
                        result.display_name ||
                        `${latitude}, ${longitude}`;

                    message.textContent =
                        "✓ Location detected successfully!";
                } catch (error) {
                    locationInput.value =
                        `${latitude}, ${longitude}`;

                    message.textContent =
                        "Coordinates detected. Address lookup failed.";
                }

                locationButton.disabled = false;
            },
            function (error) {
                message.textContent =
                    error.code === 1
                        ? "Please allow location access in your browser."
                        : "Unable to detect location. Please try again.";

                locationButton.disabled = false;
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
            }
        );
    });
}
