FLASHCARD_GENERATION_PROMPT = """
You are a study assistant. Generate exactly {num_cards} flashcards based on the following text content.
Source Text:
{text}

Each flashcard MUST consist of a direct Question and a clear Answer based strictly on the text.
Your response MUST be a valid JSON list of objects containing "question" and "answer" keys.
Do not write any commentary or preamble. Output ONLY the JSON.

Example output format:
[
  {{"question": "What is the primary theme of the snippet?", "answer": "The snippet focuses on the relationship between theory and practice."}}
]
"""
