from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    @brief Сериализатор для модели пользователя
    Обрабатывает преобразование данных пользователя в формат JSON и обратно
    """
    password = serializers.CharField(write_only=True, allow_blank=False)
    avatar_url = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        """
        @brief Метаданные сериализатора
        """
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_moderator', 'avatar', 'avatar_url')
        read_only_fields = ('is_moderator',)
        extra_kwargs = {
            'email': {'required': True},
            'avatar': {'required': False, 'allow_null': True},
        }
    
    def create(self, validated_data):
        """
        @brief Создание нового пользователя
        @param validated_data Валидированные данные пользователя
        @return User Созданный пользователь
        """
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, password=password)
        return user

    def get_avatar_url(self, obj):
        """
        @brief Получение URL аватара пользователя
        @param obj Объект пользователя
        @return str URL аватара или пустая строка, если аватар отсутствует
        """
        if not getattr(obj, "avatar", None):
            return ""

        request = self.context.get("request")
        avatar_url = reverse("avatar_media", kwargs={"user_id": obj.id})
        if request is not None:
            return request.build_absolute_uri(avatar_url)
        return avatar_url
