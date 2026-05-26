import datetime
from typing import Dict, Any

class RevisionAgent:
    """
    Coordinates flashcard revision schedules using the SuperMemo-2 (SM-2) algorithm.
    Ratings:
    0: "Total blackout", complete failure to recall
    1: "Incorrect response", but upon seeing correct answer, it felt familiar
    2: "Incorrect response", but easily remembered once corrected
    3: "Correct response", recalled with serious difficulty
    4: "Correct response", recalled after a hesitation
    5: "Perfect response", immediate and complete recall
    """
    
    @staticmethod
    def calculate_next_review(
        rating: int, 
        current_repetitions: int, 
        current_interval: int, 
        current_ease_factor: float
    ) -> Dict[str, Any]:
        """
        Runs the SM-2 algorithm to compute the next revision parameters.
        Returns:
            {
                "next_review": datetime,
                "interval_days": int,
                "ease_factor": float,
                "repetitions": int
            }
        """
        # Constrain rating to 0-5
        rating = max(0, min(5, rating))
        
        # Adjust ease factor
        # EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        new_ef = current_ease_factor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
        new_ef = max(1.3, new_ef)  # SM-2 mandates EF does not go below 1.3
        
        if rating >= 3:
            # Correct recall
            if current_repetitions == 0:
                new_interval = 1
            elif current_repetitions == 1:
                new_interval = 6
            else:
                new_interval = int(round(current_interval * new_ef))
            new_repetitions = current_repetitions + 1
        else:
            # Incorrect recall - reset repetition count, interval back to 1
            new_interval = 1
            new_repetitions = 0
            
        next_review_date = datetime.datetime.utcnow() + datetime.timedelta(days=new_interval)
        
        return {
            "next_review": next_review_date,
            "interval_days": new_interval,
            "ease_factor": round(new_ef, 3),
            "repetitions": new_repetitions
        }
