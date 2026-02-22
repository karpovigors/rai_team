from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, allow_blank=False)
    avatar_url = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_moderator', 'avatar', 'avatar_url')
        read_only_fields = ('is_moderator',)
        extra_kwargs = {
            'email': {'required': True},
            'avatar': {'required': False, 'allow_null': True},
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, password=password)
        return user

    def get_avatar_url(self, obj):
        if not getattr(obj, "avatar", None):
            return ""

        request = self.context.get("request")
        avatar_url = reverse("avatar_media", kwargs={"user_id": obj.id})
        if request is not None:
            return request.build_absolute_uri(avatar_url)
        return avatar_url
