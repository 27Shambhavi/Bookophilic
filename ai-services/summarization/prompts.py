SUMMARIZE_BOOK_PROMPT = """
Summarize the following book content:
Title: {title}
Author: {author}
Content snippet:
{content}

Provide:
1. Executive summary (max 3 sentences)
2. Key takeaways (bullet points)
3. Main themes or concepts explored
"""

SUMMARIZE_NOTES_PROMPT = """
Synthesize and summarize the following reading notes written by a user:
{notes_text}

Provide:
1. Structured summary of the user's thoughts.
2. Major insights and topics the user focused on.
3. Recommendations for related themes to investigate next.
"""
