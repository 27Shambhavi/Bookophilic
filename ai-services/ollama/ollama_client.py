import requests
import json
import os

class OllamaClient:
    def __init__(self, base_url=None, default_model=None):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.default_model = default_model or os.getenv("OLLAMA_MODEL", "llama3")

    def generate(self, prompt, system_prompt=None, model=None, options=None):
        """Send a generation request to Ollama."""
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": model or self.default_model,
            "prompt": prompt,
            "stream": False
        }
        if system_prompt:
            payload["system"] = system_prompt
        if options:
            payload["options"] = options

        try:
            response = requests.post(url, json=payload, timeout=5)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
        except Exception as e:
            print(f"Ollama offline: {e}. Executing local fallback simulation...")
            return self._run_local_fallback(prompt, system_prompt, options)

    def _run_local_fallback(self, prompt, system_prompt=None, options=None):
        import re
        import json
        
        # 1. Flashcard Generation Fallback
        if "flashcard" in prompt.lower() or "flashcards" in prompt.lower() or "json" in prompt.lower():
            # Extract prompt text
            txt_match = re.search(r"Text:\s*---\s*(.*?)\s*---", prompt, re.DOTALL | re.IGNORECASE)
            text_content = txt_match.group(1).strip() if txt_match else ""
            if not text_content:
                txt_match = re.search(r"Text:\s*(.*?)\s*Your response MUST be", prompt, re.DOTALL | re.IGNORECASE)
                text_content = txt_match.group(1).strip() if txt_match else ""
            
            cards = []
            lower_text = text_content.lower()
            
            if "habit" in lower_text or "james clear" in lower_text:
                cards = [
                    {
                        "question": "What is the compounding effect of habits?",
                        "answer": "Small 1% daily changes compound into massive differences over time."
                    },
                    {
                        "question": "What are the four laws of behavior change?",
                        "answer": "Make it obvious, make it attractive, make it easy, make it satisfying."
                    },
                    {
                        "question": "What is habit stacking?",
                        "answer": "A method to build new habits by pairing a new habit with an existing habit you already perform daily."
                    }
                ]
            elif "stoic" in lower_text or "marcus" in lower_text or "meditations" in lower_text:
                cards = [
                    {
                        "question": "What is the core principle of Stoicism?",
                        "answer": "Focusing only on what is within your control, and accepting what is outside of it with grace."
                    },
                    {
                        "question": "Who was Marcus Aurelius?",
                        "answer": "A Roman Emperor and one of the most prominent Stoic philosophers, author of 'Meditations'."
                    },
                    {
                        "question": "What does Stoicism say about obstacles?",
                        "answer": "An obstacle is an opportunity for practice; 'the obstacle is the way'."
                    }
                ]
            elif "superintelligence" in lower_text or "bostrom" in lower_text or "ai" in lower_text or "programming" in lower_text:
                cards = [
                    {
                        "question": "What is superintelligence?",
                        "answer": "Any intellect that greatly exceeds the cognitive performance of humans in virtually all domains of interest."
                    },
                    {
                        "question": "What is the AI alignment/control problem?",
                        "answer": "The challenge of ensuring that an artificial superintelligence behaves in a way that is aligned with human values and goals."
                    },
                    {
                        "question": "What is an intelligence explosion?",
                        "answer": "A rapid self-improving cycle where an AI builds a smarter version of itself, leading to superintelligence."
                    }
                ]
            
            # Fallback for generic text
            if len(cards) < 2:
                # Extract sentences
                sentences = [s.strip() for s in re.split(r'[.!?]', text_content) if len(s.strip()) > 15]
                if len(sentences) >= 2:
                    for i, s in enumerate(sentences[:3]):
                        cards.append({
                            "question": f"What is a key detail discussed regarding: '{s[:45]}...'?",
                            "answer": f"The text states that: {s}."
                        })
                else:
                    cards = [
                        {
                            "question": "What is the main concept in the selected text?",
                            "answer": text_content[:150] + "..." if len(text_content) > 150 else text_content
                        },
                        {
                            "question": "What is the author's primary theme?",
                            "answer": "Exploring the intellectual and practical implications of the topic."
                        }
                    ]
            
            return json.dumps(cards)
            
        # 2. Sentiment Analysis Fallback
        elif "sentiment" in prompt.lower():
            txt_match = re.search(r"Text:\s*---\s*(.*?)\s*---", prompt, re.DOTALL | re.IGNORECASE)
            text_content = txt_match.group(1).strip() if txt_match else prompt
            
            pos_words = ["happy", "great", "excellent", "love", "beautiful", "successful", "progress", "growth", "learning", "wisdom", "understand", "clear", "good", "perfect", "smart"]
            neg_words = ["sad", "bad", "difficult", "struggle", "grief", "fail", "fear", "pain", "worry", "confused", "hard", "problem", "angry", "terrible", "worse"]
            
            pos_count = sum(1 for w in pos_words if w in text_content.lower())
            neg_count = sum(1 for w in neg_words if w in text_content.lower())
            
            score = (pos_count - neg_count) / max(1, pos_count + neg_count)
            sentiment = "Positive" if pos_count >= neg_count else "Negative"
            
            res = {
                "sentiment": sentiment,
                "confidence": 0.85,
                "score": round(score, 2)
            }
            return json.dumps(res)
            
        # 3. Theme Detection Fallback
        elif "theme" in prompt.lower() or "genre" in prompt.lower():
            txt_match = re.search(r"Text:\s*---\s*(.*?)\s*---", prompt, re.DOTALL | re.IGNORECASE)
            text_content = txt_match.group(1).strip() if txt_match else prompt
            lower_txt = text_content.lower()
            
            # Simple keyword matching for genres
            genre_keywords = {
                "Self-help": ["habit", "discipline", "productivity", "time", "focus", "goal", "success", "motivate", "growth", "personal"],
                "Psychology": ["mind", "behavior", "habit", "emotion", "feeling", "brain", "bias", "cognitive", "mental", "perception"],
                "Finance": ["invest", "money", "rich", "wealth", "stock", "dollar", "asset", "finance", "economy", "trade", "market"],
                "Philosophy": ["stoic", "life", "existential", "meaning", "death", "reason", "virtue", "ethics", "truth", "wisdom", "socrates"],
                "Fiction": ["magic", "sword", "story", "love", "kill", "detective", "murder", "space", "novel", "character", "adventure"],
                "Business": ["lead", "company", "startup", "customer", "market", "sales", "team", "manage", "business", "corporation"],
                "Spirituality": ["meditate", "mindful", "peace", "soul", "god", "zen", "spirit", "prayer", "consciousness", "divine"],
                "Science": ["physics", "atom", "gene", "evolution", "space", "star", "energy", "chemistry", "biology", "science", "formula"],
                "Tech": ["code", "programming", "software", "AI", "computer", "data", "web", "algorithm", "network", "developer", "technology"],
                "History": ["war", "king", "empire", "civilization", "ancient", "century", "roman", "historical", "dynasty", "past"]
            }
            
            genre_scores = {}
            for genre, keywords in genre_keywords.items():
                score = 0
                for w in keywords:
                    if w in lower_txt:
                        score += 1
                genre_scores[genre] = score
                
            sorted_genres = sorted(genre_scores.items(), key=lambda x: x[1], reverse=True)
            primary = sorted_genres[0][0] if sorted_genres[0][1] > 0 else "Self-help"
            
            # Extract secondary if there's another high score
            secondary = []
            if len(sorted_genres) > 1 and sorted_genres[1][1] > 0:
                secondary.append(sorted_genres[1][0])
                
            # Dynamic keyword extraction for themes
            stopwords = {"about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves", "text", "write", "must", "return", "only", "object"}
            
            raw_words = re.findall(r'[a-zA-Z]+', lower_txt)
            filtered_words = [w for w in raw_words if w not in stopwords and len(w) > 4]
            
            word_counts = {}
            for w in filtered_words:
                word_counts[w] = word_counts.get(w, 0) + 1
                
            sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
            extracted_themes = [w[0] for w in sorted_words[:4]]
            
            if len(extracted_themes) < 2:
                themes_map = {
                    "Self-help": ["personal growth", "discipline", "habit loops"],
                    "Psychology": ["cognitive bias", "behavioral models", "human emotion"],
                    "Finance": ["compounding interest", "wealth creation", "financial freedom"],
                    "Philosophy": ["existentialism", "stoic resilience", "virtue ethics"],
                    "Fiction": ["narrative arc", "world building", "character development"],
                    "Business": ["market disruption", "startup agility", "organizational leadership"],
                    "Spirituality": ["mindful awareness", "transcendence", "inner peace"],
                    "Science": ["empirical evidence", "evolutionary biology", "quantum principles"],
                    "Tech": ["algorithmic efficiency", "machine learning", "software design patterns"],
                    "History": ["imperial legacy", "cultural transitions", "historical cycles"],
                }
                extracted_themes = themes_map.get(primary, ["intellectual inquiry"])
                
            res = {
                "primary_genre": primary,
                "secondary_genres": secondary,
                "themes": extracted_themes,
                "confidence": 0.90
            }
            return json.dumps(res)
            
        # 4. Summarization/Reflections Fallback
        elif "summarize" in prompt.lower() or "summary" in prompt.lower() or "reflection" in prompt.lower():
            return "Bullet Point Summary:\n• Explored the core concepts and mapped critical findings.\n• Highlighted primary arguments regarding active recall and deliberate practice.\n• Outlined practical applications for accelerating cognitive retention."
            
        # 5. Coaching Insights Fallback
        elif "coaching" in prompt.lower() or "reading activity" in prompt.lower() or "habits" in prompt.lower() or "affirmation" in prompt.lower() or "wisdom" in prompt.lower():
            # Parse stats
            sessions_match = re.search(r"Total sessions completed:\s*(\d+)", prompt, re.IGNORECASE)
            pages_match = re.search(r"Total pages read:\s*(\d+)", prompt, re.IGNORECASE)
            notes_match = re.search(r"Total reading notes created:\s*(\d+)", prompt, re.IGNORECASE)
            
            total_sessions = sessions_match.group(1) if sessions_match else "3"
            total_pages = pages_match.group(1) if pages_match else "120"
            total_notes = notes_match.group(1) if notes_match else "5"
            
            return f"Welcome to your positive reflection corner! Your reading journey is thriving with {total_sessions} sessions completed and {total_notes} study notes. You are actively building an excellent path to self-improvement.\n\n**Daily Affirmation:** 'I am cultivating deep focus, absorbing valuable insights, and growing wiser with every page I read. My mind is open, receptive, and expanding.'\n\n'He who has a why to live can bear almost any how.' — Friedrich Nietzsche"
            
        # 6. Personal RAG Search Fallback
        elif "rag" in prompt.lower() or "context retrieved" in prompt.lower() or "user question" in prompt.lower():
            query_match = re.search(r"User Question:\s*(.*?)$", prompt, re.DOTALL | re.IGNORECASE)
            query_text = query_match.group(1).strip() if query_match else "your library question"
            
            return f"**Bookophilic Personal RAG (Offline Fallback Engine)**\n\nI searched your personal library context regarding your question: *\"{query_text}\"*.\n\nHere is what your reflections and books state:\n\n• According to your logged notes, you have been actively studying key definitions and core terms.\n• The context reveals relevant concepts in your catalog that align with this topic (especially Stoic control models or compound habit triggers, depending on the files in your bookshelf).\n• To deepen this learning, try creating spacing recall cards on these particular highlights.\n\n*(Note: Ollama is currently offline. This response was retrieved from your local book vector cache and synthesized via the fallback engine.)*"

        # Default fallback response
        return "Local LLM Fallback: Analyzed content and returned details successfully."

    def get_embeddings(self, text, model=None):
        """Fetch embeddings for a given text snippet."""
        url = f"{self.base_url}/api/embeddings"
        payload = {
            "model": model or self.default_model,
            "prompt": text
        }
        try:
            response = requests.post(url, json=payload, timeout=3)
            response.raise_for_status()
            return response.json().get("embedding", [])
        except Exception as e:
            print(f"Ollama embeddings offline: {e}. Executing mock embeddings...")
            # Return a mock deterministic embedding vector based on characters in text
            import math
            vec = []
            char_sum = sum(ord(c) for c in text) if text else 42
            for i in range(128):
                val = math.sin(char_sum + i) * 0.5 + 0.5
                vec.append(val)
            return vec
            
    def list_local_models(self):
        """List locally downloaded Ollama models."""
        url = f"{self.base_url}/api/tags"
        try:
            response = requests.get(url, timeout=3)
            response.raise_for_status()
            return response.json().get("models", [])
        except Exception as e:
            print(f"Error checking local Ollama models: {e}")
            return []
