♟️ Chess Board Recognition

A full-stack web app that analyzes chessboard images and returns live positions in FEN format.
Built with React, Node.js, FastAPI, TensorFlow, and OpenCV, featuring secure JWT authentication and a MongoDB backend.

🌐 Live Demo

The project is hosted and live here:\n
👉 https://online-chess-image-analysis.netlify.app/

🚀 Overview

Detects chess pieces and reconstructs the board from an image in ~1.3 seconds.

Users can sign up / log in securely with JWT-based authentication.

Game history and user data are stored in MongoDB.

The backend uses Node.js + Express as an API gateway and FastAPI for TensorFlow inference.

Fully containerized for scalability with Docker.

⚙️ Tech Stack

Frontend: React, TailwindCSS.
Backend: Node.js, Express, JWT, MongoDB.
Inference Service: FastAPI, TensorFlow, OpenCV.
Deployment: Docker, Netlify.

🧠 How It Works

User uploads a chessboard image.

The API preprocesses the image and divides the board into 64 squares with OpenCV and sends it to the FastAPI model service.

The model predicts the piece that occupies each square and returns a FEN string.

The result is stored in MongoDB and displayed to the user.

🧰 Example Output

FEN: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR

