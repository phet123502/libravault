from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/signin/', views.signin),
    path('auth/signup/', views.signup),
    path('auth/verify-email/', views.verify_email),
    path('auth/reset-password/', views.reset_password),
    # Books
    path('books/', views.books),
    path('books/<int:book_id>/', views.book_detail),
    # Users
    path('users/', views.users),
    path('users/<int:user_id>/', views.user_detail),
    # Issues
    path('issues/', views.issues),
    path('issues/<int:issue_id>/return/', views.return_book),
    path('issues/<int:issue_id>/delete/', views.delete_issue),
    # Dashboards
    path('dashboard/admin/', views.admin_dashboard),
    path('dashboard/user/<int:user_id>/', views.user_dashboard),
]
