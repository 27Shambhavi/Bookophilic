# Bookophilic 🏛️

**Live Project:** [https://bookophilic.vercel.app/](https://bookophilic.vercel.app/)

**Bookophilic** is a premium, AI-driven reading companion and study room designed to optimize learning retention and book annotations. Built on a relaxing Cosmic Sapphire/Ocean Blue dark theme, it replaces generic gamified streak counters with dedicated academic and professional workflows.

---

## 🚀 Key Features

* **Ask My Library (Personalized RAG)**: Upload PDF textbooks or manuals to extract text and query your books directly. Computes dense semantic embeddings using sentence-transformers and does offline vector search via Cosine Similarity.
* **Spaced Repetition Study Room**: schedules reviews using the **SM-2 Memory Optimizer** algorithm based on cognitive active recall.
* **NLP Flashcard Generator**: Automatically generates Q&A study cards directly from your uploaded books, notes, and highlights.
* **AI Book Matchmaker**: Suggests non-redundant, high-quality matches using **Jaccard Overlap** on preferred genres and embedding comparisons.
* **Shelved Library & Highlight Highlights**: Sorts books into **Professional Shelf** (Self-help, Business, Finance, Philosophy, Spirituality) and **Academic Desk** (Science, Tech, History, Psychology, Fiction) with automatic key takeaways.
* **Wisdom & Philosophy Widget**: Philosophical reflection, daily affirmations, and logic debates led by **Marcus Aurelius**.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), TailwindCSS, Vanilla CSS, Axios, Lucide Icons
* **Backend**: FastAPI, SQLAlchemy ORM, SQLite
* **AI/ML Layer**: sentence-transformers, local Ollama integration, offline keyword extractors

---

## ⚙️ Local Setup

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Initialize virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run uvicorn server:
   ```bash
   python -m uvicorn app.main:app --port 8000 --reload
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Production Deployment

### 1. Frontend (Vercel)
* **Root Directory**: `frontend`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Environment Variables**:
  * Set `VITE_API_URL` to your backend production URL (e.g. `https://your-backend.onrender.com/api`).

### 2. Backend (Render)
* **Root Directory**: `backend`
* **Environment**: `Python`
* **Build Command**: `pip install -r requirements.txt`
* **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
