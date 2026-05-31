from openai import OpenAI
from django.conf import settings
import json
import re

from .base_service import BaseAIService


DEEPSEEK_MODEL = "deepseek/deepseek-chat"


class DeepSeekService(BaseAIService):
    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
        )
        self.model_name = DEEPSEEK_MODEL

    def generate_questions(self, interview_entries):
        prompt = self._build_prompt(interview_entries)

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
            )
            questions = self._parse_questions(response.choices[0].message.content)
            return questions
        except Exception as e:
            raise Exception(f"Error generating questions with DeepSeek: {str(e)}")

    def evaluate_answers(self, qa_pairs, candidate_profile):
        prompt = self._build_evaluation_prompt(qa_pairs, candidate_profile)

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
            )
            evaluation = self._parse_evaluation(response.choices[0].message.content)
            return evaluation
        except Exception as e:
            raise Exception(f"Error evaluating answers with DeepSeek: {str(e)}")

    def _build_prompt(self, entries):
        skills_str = ', '.join(entries.skills) if entries.skills else 'General'
        certs_str = ', '.join(entries.certifications) if entries.certifications else 'None'
        tech_str = ', '.join(entries.preferred_technologies) if entries.preferred_technologies else 'General'

        job_desc_str = f"\n        Job Description: {entries.job_description}" if getattr(entries, 'job_description', None) else ""

        prompt = f"""
        Generate exactly 10 technical interview questions for the following profile:

        Job Title: {entries.job_title}
        Experience Level: {entries.experience_level}
        Skills: {skills_str}
        Industry: {entries.industry}
        Language: {entries.language}
        Position Type: {entries.position_type}
        Certifications: {certs_str}
        Preferred Technologies: {tech_str}{job_desc_str}

        Requirements:
        1. Generate exactly 10 questions
        2. Mix of technical and behavioral questions
        3. Appropriate difficulty for {entries.experience_level} level
        4. Return ONLY a JSON array in this exact format:

        [
            {{"question": "What is your experience with Python?", "difficulty": "Easy"}},
            {{"question": "Explain the concept of REST APIs", "difficulty": "Medium"}},
            ...
        ]

        Difficulty levels: Easy, Medium, Hard
        Do not include any other text, only the JSON array.
        """
        return prompt

    def _build_evaluation_prompt(self, qa_pairs, profile):
        qa_text = ""
        for i, qa in enumerate(qa_pairs, 1):
            qa_text += f"""
            Question {i} ({qa['difficulty']}): {qa['question']}
            Answer: {qa['answer']}

            """

        prompt = f"""
        You are an expert technical interviewer. Evaluate this candidate's interview performance.

        CANDIDATE PROFILE:
        - Job Title: {profile['job_title']}
        - Experience Level: {profile['experience_level']}
        - Skills: {', '.join(profile.get('skills', []))}
        - Industry: {profile['industry']}
        - Preferred Technologies: {', '.join(profile.get('preferred_technologies', []))}

        QUESTIONS AND ANSWERS:
        {qa_text}

        EVALUATION CRITERIA:
        1. Technical accuracy and depth
        2. Communication clarity
        3. Problem-solving approach
        4. Relevance to experience level
        5. Completeness of answers

        Provide a comprehensive evaluation in this EXACT JSON format:
        {{
            "overall_score": 75,
            "feedback": "Overall performance summary here...",
            "question_scores": [
                {{
                    "question_number": 1,
                    "score": 8,
                    "feedback": "Specific feedback for this question..."
                }}
            ],
            "strengths": ["Technical knowledge", "Problem-solving"],
            "improvements": ["Communication", "Detail"],
            "recommendations": [
                "Practice explaining concepts with examples",
                "Work on structuring answers more clearly"
            ]
        }}

        SCORING GUIDELINES:
        - Overall Score: 0-100 (0-40: Poor, 41-60: Below Average, 61-75: Average, 76-85: Good, 86-100: Excellent)
        - Question Scores: 1-10 scale
        - Be constructive but honest in feedback
        - Consider the candidate's stated experience level

        Return ONLY the JSON object, no other text.
        """
        return prompt

    def _parse_questions(self, response_text):
        try:
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                questions = json.loads(json_str)

                if len(questions) > 10:
                    questions = questions[:10]

                return questions
            else:
                raise Exception("No valid JSON found in response")

        except json.JSONDecodeError:
            return self._create_fallback_questions()

    def _parse_evaluation(self, response_text):
        try:
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                evaluation = json.loads(json_str)

                required_fields = ['overall_score', 'feedback', 'question_scores', 'strengths', 'improvements', 'recommendations']
                for field in required_fields:
                    if field not in evaluation:
                        evaluation[field] = self._get_default_value(field)

                return evaluation
            else:
                raise Exception("No valid JSON found in evaluation response")

        except json.JSONDecodeError:
            return self._create_fallback_evaluation()

    def _get_default_value(self, field):
        defaults = {
            'overall_score': 50,
            'feedback': 'Unable to provide detailed feedback at this time.',
            'question_scores': [],
            'strengths': ['Participation'],
            'improvements': ['Technical depth'],
            'recommendations': ['Continue practicing interview skills']
        }
        return defaults.get(field, '')

    def _create_fallback_questions(self):
        return [
            {"question": "Tell me about yourself and your experience.", "difficulty": "Easy"},
            {"question": "What are your greatest strengths?", "difficulty": "Easy"},
            {"question": "Where do you see yourself in 5 years?", "difficulty": "Medium"},
            {"question": "Describe a challenging project you worked on.", "difficulty": "Medium"},
            {"question": "How do you handle working under pressure?", "difficulty": "Medium"},
            {"question": "What motivates you in your work?", "difficulty": "Easy"},
            {"question": "Describe your ideal work environment.", "difficulty": "Easy"},
            {"question": "How do you prioritize multiple tasks?", "difficulty": "Medium"},
            {"question": "What are your salary expectations?", "difficulty": "Hard"},
            {"question": "Do you have any questions for us?", "difficulty": "Easy"}
        ]

    def _create_fallback_evaluation(self):
        return {
            "overall_score": 50,
            "feedback": "Thank you for completing the interview. Due to technical limitations, we cannot provide detailed feedback at this time.",
            "question_scores": [],
            "strengths": ["Interview participation"],
            "improvements": ["Continue developing skills"],
            "recommendations": ["Keep practicing and learning"]
        }
