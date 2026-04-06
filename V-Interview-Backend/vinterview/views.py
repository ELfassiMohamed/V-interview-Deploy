from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from .serializers import UserSignUpSerializer, UserSignInSerializer, UserProfileSerializer
from .models import User, InterviewEntries, Question, Answer, InterviewResult
from .services.gemini_service import GeminiService
import logging

@api_view(['POST'])
@permission_classes([AllowAny])
def sign_up(request):
    """
    User registration endpoint
    """
    serializer = UserSignUpSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            },
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def sign_in(request):
    """
    User login endpoint
    """
    serializer = UserSignInSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        login(request, user)
        
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            },
            'token': token.key
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sign_out(request):
    """
    User logout endpoint
    """
    try:
        # Delete the user's token
        request.user.auth_token.delete()
        logout(request)
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Something went wrong during logout'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Get user profile endpoint
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update user profile endpoint
    """
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile(request):
    """
    Delete user profile endpoint
    """
    user = request.user
    user.delete()
    return Response({
        'message': 'Profile deleted successfully'
    }, status=status.HTTP_200_OK)
    
# THE INTERVIEW SIMULATION PART : Questions

logger = logging.getLogger(__name__)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def generate_interview_questions(request):
    try:
        # 1. Validate required fields
        required_fields = ['jobTitle', 'experienceLevel', 'industry', 'language', 'positionType']
        for field in required_fields:
            if not request.data.get(field):
                return Response({
                    'success': False,
                    'error': f'{field} is required'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Prepare and save interview entries
        entries_data = {
            'job_title': request.data.get('jobTitle'),
            'experience_level': request.data.get('experienceLevel'),
            'skills': request.data.get('skills', []),
            'industry': request.data.get('industry'),
            'language': request.data.get('language'),
            'position_type': request.data.get('positionType'),
            'certifications': request.data.get('certifications', []),
            'preferred_technologies': request.data.get('preferredTechnologies', []),
            'soft_skills': request.data.get('softSkills', [])
        }
        
        # Create entry for the authenticated user
        interview_entries = InterviewEntries.objects.create(
            user=request.user,
            **entries_data
        )
        
        logger.info(f"Created interview entries for user {request.user.id}")
        
        # 3. Generate questions using Gemini
        gemini_service = GeminiService()
        questions_data = gemini_service.generate_questions(interview_entries)
        
        # 4. Save questions to database
        questions = []
        for i, q_data in enumerate(questions_data):
            question = Question.objects.create(
                interview_entries=interview_entries,
                question_text=q_data['question'],
                difficulty=q_data['difficulty'],
                question_order=i + 1
            )
            questions.append({
                'questionID': question.question_id,
                'questionText': question.question_text,
                'difficulty': question.difficulty,
                'order': question.question_order
            })
        
        logger.info(f"Generated {len(questions)} questions for entry {interview_entries.entry_id}")
        
        # 5. Return response
        return Response({
            'success': True,
            'entryID': interview_entries.entry_id,
            'questionsGenerated': len(questions),
            'questions': questions
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error in generate_interview_questions: {str(e)}")
        return Response({
            'success': False,
            'error': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user_entries(request):
    """Get all interview entries for the authenticated user"""
    try:
        entries = InterviewEntries.objects.filter(user=request.user).order_by('-created_at')
        entries_data = []
        
        for entry in entries:
            entries_data.append({
                'entryID': entry.entry_id,
                'jobTitle': entry.job_title,
                'experienceLevel': entry.experience_level,
                'industry': entry.industry,
                'createdAt': entry.created_at,
                'questionCount': entry.question_set.count()
            })
        
        return Response({
            'success': True,
            'entries': entries_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# THE INTERVIEW SIMULATION PART : Answers

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def submit_answers(request, entry_id):
    """
    Submit answers for evaluation
    Expected data format:
    {
        "answers": [
            {
                "questionID": 1,
                "answerText": "My answer here...",
                "timeSpent": 120
            }
        ]
    }
    """
    try:
        # 1. Validate entry exists and belongs to user
        try:
            interview_entry = InterviewEntries.objects.get(
                entry_id=entry_id, 
                user=request.user
            )
        except InterviewEntries.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Interview entry not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # 2. Check if answers already submitted
        if hasattr(interview_entry, 'interviewresult'):
            return Response({
                'success': False,
                'error': 'Answers already submitted for this interview'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Validate answers data
        answers_data = request.data.get('answers', [])
        if not answers_data:
            return Response({
                'success': False,
                'error': 'No answers provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 4. Get all questions for this interview
        questions = Question.objects.filter(interview_entries=interview_entry).order_by('question_order')
        
        if len(answers_data) != questions.count():
            return Response({
                'success': False,
                'error': f'Expected {questions.count()} answers, got {len(answers_data)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 5. Save answers to database
        saved_answers = []
        for answer_data in answers_data:
            try:
                question = questions.get(question_id=answer_data['questionID'])
                answer = Answer.objects.create(
                    question=question,
                    interview_entries=interview_entry,
                    answer_text=answer_data.get('answerText', ''),
                    time_spent=answer_data.get('timeSpent')
                )
                saved_answers.append(answer)
            except Question.DoesNotExist:
                # Clean up any created answers if there's an error
                Answer.objects.filter(interview_entries=interview_entry).delete()
                return Response({
                    'success': False,
                    'error': f'Question with ID {answer_data["questionID"]} not found'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # 6. Prepare data for AI evaluation
        qa_pairs = []
        for question in questions:
            answer = Answer.objects.get(question=question, interview_entries=interview_entry)
            qa_pairs.append({
                'question': question.question_text,
                'answer': answer.answer_text,
                'difficulty': question.difficulty
            })
        
        # 7. Prepare candidate profile
        candidate_profile = {
            'job_title': interview_entry.job_title,
            'experience_level': interview_entry.experience_level,
            'skills': interview_entry.skills,
            'industry': interview_entry.industry,
            'preferred_technologies': interview_entry.preferred_technologies,
            'soft_skills': interview_entry.soft_skills
        }
        
        # 8. Call AI service for evaluation
        gemini_service = GeminiService()
        evaluation = gemini_service.evaluate_answers(qa_pairs, candidate_profile)
        
        # 9. Save evaluation results
        interview_result = InterviewResult.objects.create(
            interview_entries=interview_entry,
            overall_score=evaluation['overall_score'],
            feedback=evaluation['feedback'],
            strengths=evaluation['strengths'],
            improvements=evaluation['improvements'],
            recommendations=evaluation['recommendations'],
            question_scores=evaluation['question_scores']
        )
        
        logger.info(f"Interview evaluation completed for entry {entry_id}, score: {evaluation['overall_score']}")
        
        # 10. Return success response
        return Response({
            'success': True,
            'message': 'Answers submitted and evaluated successfully',
            'resultID': interview_result.result_id,
            'overallScore': evaluation['overall_score']
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error in submit_answers: {str(e)}")
        # Clean up any partial data
        Answer.objects.filter(interview_entries_id=entry_id).delete()
        return Response({
            'success': False,
            'error': f'An error occurred while processing your answers: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_interview_results(request, entry_id):
    """
    Get interview results for a specific entry
    """
    try:
        # 1. Validate entry exists and belongs to user
        try:
            interview_entry = InterviewEntries.objects.get(
                entry_id=entry_id, 
                user=request.user
            )
        except InterviewEntries.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Interview entry not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # 2. Get interview results
        try:
            result = InterviewResult.objects.get(interview_entries=interview_entry)
        except InterviewResult.DoesNotExist:
            return Response({
                'success': False,
                'error': 'No results found. Please submit your answers first.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # 3. Get questions and answers for detailed view
        questions_with_answers = []
        questions = Question.objects.filter(interview_entries=interview_entry).order_by('question_order')
        
        for question in questions:
            try:
                answer = Answer.objects.get(question=question, interview_entries=interview_entry)
                questions_with_answers.append({
                    'questionID': question.question_id,
                    'questionText': question.question_text,
                    'difficulty': question.difficulty,
                    'answerText': answer.answer_text,
                    'timeSpent': answer.time_spent
                })
            except Answer.DoesNotExist:
                questions_with_answers.append({
                    'questionID': question.question_id,
                    'questionText': question.question_text,
                    'difficulty': question.difficulty,
                    'answerText': '',
                    'timeSpent': None
                })
        
        # 4. Return comprehensive results
        return Response({
            'success': True,
            'interview': {
                'entryID': interview_entry.entry_id,
                'jobTitle': interview_entry.job_title,
                'experienceLevel': interview_entry.experience_level,
                'completedAt': result.created_at
            },
            'results': {
                'overallScore': result.overall_score,
                'feedback': result.feedback,
                'strengths': result.strengths,
                'improvements': result.improvements,
                'recommendations': result.recommendations,
                'questionScores': result.question_scores
            },
            'questionsAndAnswers': questions_with_answers
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in get_interview_results: {str(e)}")
        return Response({
            'success': False,
            'error': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user_interview_history(request):
    """
    Get all interview history for the authenticated user with results
    """
    try:
        entries = InterviewEntries.objects.filter(user=request.user).order_by('-created_at')
        history = []
        
        for entry in entries:
            entry_data = {
                'entryID': entry.entry_id,
                'jobTitle': entry.job_title,
                'experienceLevel': entry.experience_level,
                'industry': entry.industry,
                'createdAt': entry.created_at,
                'questionCount': entry.question_set.count(),
                'status': 'completed' if hasattr(entry, 'interviewresult') else 'pending'
            }
            
            # Add results if available
            if hasattr(entry, 'interviewresult'):
                result = entry.interviewresult
                entry_data['results'] = {
                    'overallScore': result.overall_score,
                    'completedAt': result.created_at
                }
            
            history.append(entry_data)
        
        return Response({
            'success': True,
            'history': history
        })
        
    except Exception as e:
        logger.error(f"Error in get_user_interview_history: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)