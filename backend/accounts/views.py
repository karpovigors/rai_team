from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.http import FileResponse
from django.shortcuts import get_object_or_404
import mimetypes
import os
from .serializers import UserSerializer

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    @brief Регистрация нового пользователя
    @param request Запрос с данными пользователя
    @return Response Объект ответа с JWT токенами и данными пользователя
    """
    serializer = UserSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    @brief Аутентификация пользователя и возврат JWT токенов
    @param request Запрос с логином и паролем пользователя
    @return Response Объект ответа с JWT токенами и данными пользователя
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if username and password:
        user = authenticate(request, username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user, context={'request': request}).data
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    @brief Получение информации о текущем пользователе
    @param request Запрос с аутентификацией
    @return Response Объект ответа с данными пользователя
    """
    return Response({'user': UserSerializer(request.user, context={'request': request}).data})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_me(request):
    """
    @brief Обновление информации о текущем пользователе
    @param request Запрос с обновленными данными пользователя
    @return Response Объект ответа с обновленными данными пользователя
    """
    user = request.user
    username = request.data.get('username')
    email = request.data.get('email')
    new_password = request.data.get('password')
    avatar_file = request.FILES.get('avatar')
    remove_avatar = str(request.data.get('remove_avatar', '')).lower() in ('1', 'true', 'yes')

    if username is not None:
        username = str(username).strip()
        if not username:
            return Response({'error': 'Username cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
        user.username = username

    if email is not None:
        email = str(email).strip()
        if not email:
            return Response({'error': 'Email cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
        user.email = email

    if new_password:
        user.set_password(str(new_password))

    if remove_avatar and user.avatar:
        user.avatar.delete(save=False)
        user.avatar = None

    if avatar_file is not None:
        previous_avatar_name = user.avatar.name if user.avatar else None
        _, extension = os.path.splitext(avatar_file.name or "")
        safe_extension = extension.lower() if extension else ".png"
        avatar_file.name = f"{user.username}/avatar_{user.id or 'new'}{safe_extension}"
        user.avatar = avatar_file

    user.save()
    if avatar_file is not None and 'previous_avatar_name' in locals():
        if previous_avatar_name and user.avatar and previous_avatar_name != user.avatar.name:
            try:
                user.avatar.storage.delete(previous_avatar_name)
            except Exception:
                pass

    return Response({'user': UserSerializer(user, context={'request': request}).data})


@api_view(['GET'])
@permission_classes([AllowAny])
def avatar_media(request, user_id):
    """
    @brief Получение аватара пользователя по ID
    @param request Запрос без аутентификации
    @param user_id ID пользователя
    @return FileResponse Файл аватара пользователя
    """
    user = get_object_or_404(User, id=user_id)
    if not user.avatar:
        return Response({'error': 'Avatar not found'}, status=status.HTTP_404_NOT_FOUND)

    content_type, _ = mimetypes.guess_type(user.avatar.name)
    avatar_file = user.avatar.open('rb')
    return FileResponse(avatar_file, content_type=content_type or 'application/octet-stream')


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh(request):
    """
    @brief Обновление JWT токена
    @param request Запрос с refresh токеном
    @return Response Объект ответа с новыми access и refresh токенами
    """
    token = request.data.get('refresh')
    if not token:
        return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        refresh_token = RefreshToken(token)
        return Response({
            'access': str(refresh_token.access_token),
            'refresh': str(refresh_token),
        })
    except TokenError:
        return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
