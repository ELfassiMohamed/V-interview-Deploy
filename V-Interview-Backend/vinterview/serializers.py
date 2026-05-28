from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserSignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class UserSignInSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password')

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')
        read_only_fields = ('id', 'date_joined')

# ==========================================
# NEW SCHEMAS FOR SWAGGER DOCUMENTATION
# ==========================================

class AuthUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()

class AuthResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    user = AuthUserSerializer()
    token = serializers.CharField()

class MessageResponseSerializer(serializers.Serializer):
    message = serializers.CharField()

class InterviewEntryCreateSerializer(serializers.Serializer):
    jobTitle = serializers.CharField(required=True, help_text="The target job title for the interview.")
    experienceLevel = serializers.CharField(required=True, help_text="E.g., Junior, Mid-Level, Senior.")
    industry = serializers.CharField(required=True, help_text="The field of business or industry.")
    language = serializers.CharField(required=True, help_text="Language the interview will be conducted in.")
    positionType = serializers.CharField(required=True, help_text="E.g., Remote, Hybrid, On-site.")
    skills = serializers.ListField(child=serializers.CharField(), required=False, default=list, help_text="List of candidate skills.")
    certifications = serializers.ListField(child=serializers.CharField(), required=False, default=list, help_text="List of candidate certifications.")
    preferredTechnologies = serializers.ListField(child=serializers.CharField(), required=False, default=list, help_text="Technologies preferred by the candidate.")
    softSkills = serializers.ListField(child=serializers.CharField(), required=False, default=list, help_text="Candidate soft skills.")
    jobDescription = serializers.CharField(required=False, allow_null=True, allow_blank=True, help_text="Paste a full job description for custom question tailoring.")

class QuestionResponseSerializer(serializers.Serializer):
    questionID = serializers.IntegerField()
    questionText = serializers.CharField()
    difficulty = serializers.CharField()
    order = serializers.IntegerField()

class InterviewEntryCreateResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    entryID = serializers.IntegerField()
    questionsGenerated = serializers.IntegerField()
    questions = QuestionResponseSerializer(many=True)

class InterviewEntryItemSerializer(serializers.Serializer):
    entryID = serializers.IntegerField()
    jobTitle = serializers.CharField()
    experienceLevel = serializers.CharField()
    industry = serializers.CharField()
    jobDescription = serializers.CharField(allow_null=True)
    createdAt = serializers.DateTimeField()
    questionCount = serializers.IntegerField()

class InterviewEntryListResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    entries = InterviewEntryItemSerializer(many=True)

class SubmitAnswerItemSerializer(serializers.Serializer):
    questionID = serializers.IntegerField(help_text="ID of the question being answered.")
    answerText = serializers.CharField(help_text="The candidate's text answer.")
    timeSpent = serializers.IntegerField(required=False, allow_null=True, help_text="Time spent on the question in seconds.")

class SubmitAnswersRequestSerializer(serializers.Serializer):
    answers = SubmitAnswerItemSerializer(many=True, help_text="Array of answers to be evaluated.")

class SubmitAnswersResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    resultID = serializers.IntegerField()
    overallScore = serializers.FloatField()

class QuestionScoreSerializer(serializers.Serializer):
    question_number = serializers.IntegerField()
    score = serializers.FloatField()
    feedback = serializers.CharField()

class InterviewResultInfoSerializer(serializers.Serializer):
    entryID = serializers.IntegerField()
    jobTitle = serializers.CharField()
    experienceLevel = serializers.CharField()
    completedAt = serializers.DateTimeField()

class ResultsSummarySerializer(serializers.Serializer):
    overallScore = serializers.FloatField()
    feedback = serializers.CharField()
    strengths = serializers.ListField(child=serializers.CharField())
    improvements = serializers.ListField(child=serializers.CharField())
    recommendations = serializers.ListField(child=serializers.CharField())
    questionScores = QuestionScoreSerializer(many=True)

class QuestionAndAnswerSerializer(serializers.Serializer):
    questionID = serializers.IntegerField()
    questionText = serializers.CharField()
    difficulty = serializers.CharField()
    answerText = serializers.CharField(allow_blank=True)
    timeSpent = serializers.IntegerField(allow_null=True)

class GetInterviewResultsResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    interview = InterviewResultInfoSerializer()
    results = ResultsSummarySerializer()
    questionsAndAnswers = QuestionAndAnswerSerializer(many=True)

class InterviewHistoryResultSerializer(serializers.Serializer):
    overallScore = serializers.FloatField()
    completedAt = serializers.DateTimeField()

class InterviewHistoryItemSerializer(serializers.Serializer):
    entryID = serializers.IntegerField()
    jobTitle = serializers.CharField()
    experienceLevel = serializers.CharField()
    industry = serializers.CharField()
    createdAt = serializers.DateTimeField()
    questionCount = serializers.IntegerField()
    status = serializers.CharField()  # 'completed' or 'pending'
    results = InterviewHistoryResultSerializer(required=False)

class GetInterviewHistoryResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    history = InterviewHistoryItemSerializer(many=True)