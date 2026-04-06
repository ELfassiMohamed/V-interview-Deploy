from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    email = models.EmailField(unique=True)
    
    # Use email as the unique identifier for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
    
class InterviewEntries(models.Model):
    entry_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job_title = models.CharField(max_length=200)
    experience_level = models.CharField(max_length=50)
    skills = models.JSONField(default=list)
    industry = models.CharField(max_length=100)
    language = models.CharField(max_length=50)
    position_type = models.CharField(max_length=50)
    certifications = models.JSONField(default=list)
    preferred_technologies = models.JSONField(default=list)
    soft_skills = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'interview_entries'
        verbose_name_plural = "Interview Entries"

class Question(models.Model):
    question_id = models.AutoField(primary_key=True)
    interview_entries = models.ForeignKey(InterviewEntries, on_delete=models.CASCADE)
    question_text = models.TextField()
    difficulty = models.CharField(max_length=20)
    question_order = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'questions'
        ordering = ['question_order']
        
# NEW MODELS FOR ANSWER EVALUATION
class Answer(models.Model):
    answer_id = models.AutoField(primary_key=True)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    interview_entries = models.ForeignKey(InterviewEntries, on_delete=models.CASCADE)
    answer_text = models.TextField()
    time_spent = models.IntegerField(null=True, blank=True)  # seconds
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'answers'
        unique_together = ['question', 'interview_entries']  # One answer per question per interview

class InterviewResult(models.Model):
    result_id = models.AutoField(primary_key=True)
    interview_entries = models.OneToOneField(InterviewEntries, on_delete=models.CASCADE)
    overall_score = models.FloatField()
    feedback = models.TextField()
    strengths = models.JSONField(default=list)
    improvements = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    question_scores = models.JSONField(default=list)  # Individual question scores
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'interview_results'