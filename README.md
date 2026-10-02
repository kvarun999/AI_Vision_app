# AI Vision App

AI Vision App is a full-stack web application where users can upload images, analyze them using AI, and generate new images from text prompts.

## 🏗 High-Level Architecture

The application follows a modern decoupled architecture:

* **Frontend (Client):** Built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**. It handles user interactions, displays image galleries, and manages state for upload/generation forms.
* **Backend (API):** A **FastAPI** (Python) service that acts as the orchestrator. It exposes REST endpoints for uploading files, triggering AI tasks, and retrieving results.
* **Database:** **PostgreSQL** (via **SQLAlchemy**) stores metadata about media assets (S3 URLs, content types) and logs analysis/generation results.
* **Storage:** **AWS S3** is used to store raw uploaded images and generated image files.
* **AI Services:**
    * **Vision:** **OpenAI GPT-4o-mini** is used for image captioning, Visual Question Answering (VQA), and OCR.
    * **Generation:** **Hugging Face Inference API** (Stability AI models) is used for Text-to-Image and Image-to-Image variations.
    * **Background jobs:** Celery workers backed by Redis run long-running generation jobs outside the API process.

---

## 🚀 Setup Instructions

### Prerequisites
* Node.js (v18+) and npm/yarn
* Python (v3.9+)
* PostgreSQL database (local or cloud like Supabase/Neon)
* AWS S3 Bucket
* API Keys for OpenAI and Hugging Face

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```

3.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configuration**: Create a `.env` file in the `backend/` directory with the following keys:
    ```ini
    # Database (PostgreSQL)
    DATABASE_URL=postgresql://user:password@localhost:5432/vision_db

    # AWS S3 Storage
    AWS_ACCESS_KEY_ID=your_aws_access_key
    AWS_SECRET_ACCESS_KEY=your_aws_secret_key
    AWS_REGION=us-east-1
    AWS_BUCKET_NAME=your_bucket_name

    # AI Services
    OPENAI_API_KEY=sk-...
    HUGGINGFACE_API_TOKEN=hf_...
    ```

5.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

### Docker Compose

Copy `.env.example` to `.env`, fill in the required API keys, and run:

```bash
docker compose up --build
```

This starts PostgreSQL, Redis, FastAPI, a Celery generation worker, and Next.js. Generation requests return a job ID immediately; poll `GET /api/generate/jobs/{job_id}` for the result.

---

## 🛠 API Usage Examples

You can interact with the API via the automatic Swagger docs at `http://localhost:8000/docs`.

* **Upload Image:** `POST /api/upload/` (Form Data: file)
* **Analyze (Caption):** `POST /api/analyze/caption` (JSON: `{ "asset_id": "..." }`)
* **Analyze (vqa):** `POST /api/analyze/vqa` (JSON: `{ "asset_id": "..."  , "prompt:"..."}`)
* **Analyze (ocr):** `POST /api/analyze/caption` (JSON: `{ "asset_id": "..." }`)
* **Analyze (result):** `GET /api/analyze/result` (JSON: `{ "asset_id": "...","feature_type":"(Caption/vqa/ocr)" }`)
* **Queue Image Generation:** `POST /api/generate/text-to-image` (Query param: `?prompt=a futuristic city`)
* **Queue Variation:** `POST /api/generate/variation` (Query params: `?prompt=a futuristic city&image_url=...`)
* **Generation Status:** `GET /api/generate/jobs/{job_id}`

## 📜 Tech Stack Detail
* **Frontend:** Next.js, React 19, Tailwind CSS, Lucide React
* **Backend:** FastAPI, SQLAlchemy, Pydantic
* **Infrastructure:** AWS S3, PostgreSQL
* **AI Models:** GPT-4o-mini, Stable Diffusion XL