from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, allow_blank=False)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_moderator')
        read_only_fields = ('is_moderator',)
        extra_kwargs = {
            'email': {'required': True},
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, password=password)
        return user
