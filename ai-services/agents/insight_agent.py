from ollama.ollama_client import OllamaClient
from shared.constants import INSIGHT_SYSTEM_PROMPT
from typing import List, Dict, Any

class InsightAgent:
    def __init__(self, ollama_client: OllamaClient = None):
        self.client = ollama_client or OllamaClient()

    def generate_reading_insights(self, tracker_logs: List[Dict[str, Any]], user_name: str) -> str:
        """
        Analyze tracker logs and generate a short personalized coaching report.
        tracker_logs elements: {'book_title': str, 'pages_read': int, 'notes_taken': int, 'minutes': int}
        """
        if not tracker_logs:
            return "Welcome to your reflection space! Log reading sessions to unlock personalized wisdom quotes and positive affirmations tailored to your progress."
            
        total_pages = sum(log.get("pages_read", 0) for log in tracker_logs)
        total_notes = sum(log.get("notes_taken", 0) for log in tracker_logs)
        total_sessions = len(tracker_logs)
        
        summary_info = f"""
Reading session details for user {user_name}:
- Total sessions completed: {total_sessions}
- Total pages read: {total_pages}
- Total reading notes created: {total_notes}
- Logs: {tracker_logs}
"""

        prompt = f"""
Here is a summary of the user's reading activity:
{summary_info}

Based on this, generate a highly encouraging, positive reflection and affirmation report.
Do NOT write a dry statistics or technical habit analysis. Instead, write a 3-paragraph inspiring letter:
1. Praise their progress and dedication to learning, highlighting how reading shapes a positive mindset.
2. Share a beautiful, uplifting positive affirmation related to continuous self-improvement and wisdom.
3. Offer an inspiring quote from the selected mentor that motivates curiosity and persistent learning.
"""
        return self.client.generate(prompt, system_prompt=INSIGHT_SYSTEM_PROMPT)
