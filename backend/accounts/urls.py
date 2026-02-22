from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('refresh/', views.refresh, name='refresh'),
    path('me/', views.me, name='me'),
    path('me/update/', views.update_me, name='update_me'),
    path('avatar/<int:user_id>/', views.avatar_media, name='avatar_media'),
]
