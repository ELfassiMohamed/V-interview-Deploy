from abc import ABC, abstractmethod


class BaseAIService(ABC):
    @abstractmethod
    def generate_questions(self, interview_entries):
        pass

    @abstractmethod
    def evaluate_answers(self, qa_pairs, candidate_profile):
        pass
