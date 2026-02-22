from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.files.storage import FileSystemStorage


class CustomUser(AbstractUser):
    """
    Custom user model for the application
    """
    username = models.CharField(max_length=150, unique=True)
    avatar = models.FileField(
        upload_to='avatars/',
        blank=True,
        null=True,
    )
    is_moderator = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    
    def __str__(self):
        return self.username
