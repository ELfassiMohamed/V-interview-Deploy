from django.urls import path
from . import views

urlpatterns = [
    # URLs for auth/profile
    path('auth/signup/', views.sign_up, name='signup'),
    path('auth/signin/', views.sign_in, name='signin'),
    path('auth/signout/', views.sign_out, name='signout'),
    path('auth/profile/', views.get_profile, name='get_profile'),
    path('auth/profile/update/', views.update_profile, name='update_profile'),
    path('auth/profile/delete/', views.delete_profile, name='delete_profile'),
    
    # URLs for questions
    path('ai/generate-questions/', views.generate_interview_questions, name='generate_questions'),
    path('ai/user-entries/', views.get_user_entries, name='user_entries'),
    
    # URLs for answer evaluation
    path('ai/interviews/<int:entry_id>/submit-answers/', views.submit_answers, name='submit_answers'),
    path('ai/interviews/<int:entry_id>/results/', views.get_interview_results, name='interview_results'),
    path('ai/interview-history/', views.get_user_interview_history, name='interview_history'),
]