from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.files.storage import FileSystemStorage


class CustomUser(AbstractUser):
    """
    @brief Кастомная модель пользователя для приложения
    Наследует базовую модель AbstractUser Django и добавляет дополнительные поля
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
        """
        @brief Возвращает строковое представление пользователя
        @return Имя пользователя
        """
        return self.username
