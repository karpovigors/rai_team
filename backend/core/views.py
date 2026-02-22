import json
import mimetypes
import os
from urllib.error import URLError
from urllib.parse import quote, urlencode
from urllib.request import urlopen

from django.db import IntegrityError
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from pywebpush import webpush, WebPushException

from .models import PlaceObject, PlaceReview, PushSubscription


def _parse_bool(value):
    """
    @brief Преобразование значения в булевый тип
    @param value Значение для преобразования
    @return bool Преобразованное булевое значение
    """
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "on"}
    return False


def _parse_metros(value):
    """
    @brief Парсинг списка станций метро из строки или списка
    @param value Входное значение (строка или список)
    @return list Список станций метро
    """
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return []
        if stripped.startswith("["):
            try:
                parsed = json.loads(stripped)
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if str(item).strip()]
            except json.JSONDecodeError:
                pass
        return [item.strip() for item in stripped.split(",") if item.strip()]
    return []


def _build_image_url(request, obj):
    """
    @brief Построение URL изображения для объекта
    @param request HTTP-запрос
    @param obj Объект места
    @return str URL изображения
    """
    if obj.image:
        image_key = quote(obj.image.name, safe="")
        return f"/objects/{obj.id}/image?key={image_key}"
    return obj.image_url


def _is_moderator(user):
    """
    @brief Проверка, является ли пользователь модератором
    @param user Пользователь
    @return bool True, если пользователь модератор или суперпользователь
    """
    return user.is_authenticated and (user.is_superuser or getattr(user, "is_moderator", False))


def _geocode_address(address):
    """
    @brief Геокодирование адреса с использованием Yandex Geocoder API
    @param address Адрес для геокодирования
    @return tuple|None Кортеж (широта, долгота) или None в случае ошибки
    """
    address_value = str(address or "").strip()
    if not address_value:
        return None

    api_key = (
        os.getenv("YANDEX_GEOCODER_API_KEY", "").strip()
        or os.getenv("VITE_YANDEX_GEOCODER_API_KEY", "").strip()
    )
    if not api_key:
        return None

    query = urlencode(
        {
            "apikey": api_key,
            "geocode": address_value,
            "format": "json",
            "lang": "ru_RU",
        }
    )

    try:
        with urlopen(f"https://geocode-maps.yandex.ru/1.x/?{query}", timeout=5) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (URLError, TimeoutError, ValueError, json.JSONDecodeError):
        return None

    members = (
        payload.get("response", {})
        .get("GeoObjectCollection", {})
        .get("featureMember", [])
    )
    if not members:
        return None

    point_pos = (
        members[0]
        .get("GeoObject", {})
        .get("Point", {})
        .get("pos", "")
    )
    if not point_pos:
        return None

    try:
        lon_str, lat_str = point_pos.split()
        return float(lat_str), float(lon_str)
    except (ValueError, TypeError):
        return None


def _subscription_payload_to_data(payload):
    """
    @brief Преобразование полезной нагрузки подписки в формат данных
    @param payload Полезная нагрузка подписки
    @return dict|None Словарь с данными подписки или None при ошибке
    """
    endpoint = str(payload.get("endpoint", "")).strip()
    keys = payload.get("keys") or {}
    p256dh = str(keys.get("p256dh", "")).strip()
    auth = str(keys.get("auth", "")).strip()

    if not endpoint or not p256dh or not auth:
        return None

    return {
        "endpoint": endpoint,
        "p256dh": p256dh,
        "auth": auth,
    }


def _build_notification_payload(notification_type, title, body, url):
    """
    @brief Построение полезной нагрузки уведомления
    @param notification_type Тип уведомления
    @param title Заголовок уведомления
    @param body Текст уведомления
    @param url URL для перехода по умолчанию "/"
    @return dict Словарь с данными уведомления
    """
    return {
        "type": notification_type,
        "title": title,
        "body": body,
        "url": url or "/",
    }


def _send_push_to_subscriptions(subscriptions, payload):
    """
    @brief Отправка push-уведомлений подписчикам
    @param subscriptions Список подписок
    @param payload Полезная нагрузка уведомления
    @return dict Результат отправки уведомлений
    """
    vapid_private_key = os.getenv("VAPID_PRIVATE_KEY", "").strip()
    vapid_subject = os.getenv("VAPID_SUBJECT", "mailto:admin@example.com").strip()

    if not vapid_private_key:
        return {
            "sent": 0,
            "failed": len(subscriptions),
            "removed": 0,
            "errors": ["VAPID_PRIVATE_KEY is not configured"],
        }

    sent = 0
    failed = 0
    removed = 0
    errors = []

    for subscription in subscriptions:
        subscription_info = {
            "endpoint": subscription.endpoint,
            "keys": {
                "p256dh": subscription.p256dh,
                "auth": subscription.auth,
            },
        }

        try:
            webpush(
                subscription_info=subscription_info,
                data=json.dumps(payload, ensure_ascii=False),
                vapid_private_key=vapid_private_key,
                vapid_claims={"sub": vapid_subject},
            )
            sent += 1
        except WebPushException as exc:
            failed += 1
            status_code = getattr(getattr(exc, "response", None), "status_code", None)
            if status_code in (404, 410):
                subscription.delete()
                removed += 1
                continue
            errors.append(str(exc))
        except Exception as exc:
            failed += 1
            errors.append(str(exc))

    return {
        "sent": sent,
        "failed": failed,
        "removed": removed,
        "errors": errors[:10],
    }


def _serialize_place(request, obj, include_reviews=False):
    """
    @brief Сериализация объекта места в словарь
    @param request HTTP-запрос
    @param obj Объект места
    @param include_reviews Флаг включения отзывов
    @return dict Словарь с сериализованными данными места
    """
    reviews_qs = obj.reviews.all()
    reviews_list = list(reviews_qs) if include_reviews else None
    rated_reviews = [review for review in (reviews_list or reviews_qs) if getattr(review, "rating", None)]
    rating_count = len(rated_reviews)
    rating_avg = round(sum(review.rating for review in rated_reviews) / rating_count, 1) if rating_count else 0

    payload = {
        "id": obj.id,
        "title": obj.title,
        "description": obj.description,
        "upcoming_event": obj.upcoming_event,
        "discount_info": obj.discount_info,
        "infrastructure_type": obj.infrastructure_type,
        "address": obj.address,
        "schedule": obj.schedule,
        "metros": obj.metros,
        "image_url": _build_image_url(request, obj),
        "lat": obj.lat,
        "lng": obj.lng,
        "sign_language": obj.sign_language,
        "subtitles": obj.subtitles,
        "ramps": obj.ramps,
        "braille": obj.braille,
        "created_at": obj.created_at,
        "rating_avg": rating_avg,
        "rating_count": rating_count,
    }

    if include_reviews:
        payload["reviews"] = [
            {
                "id": review.id,
                "author": review.author_name,
                "text": review.text,
                "rating": review.rating,
                "created_at": review.created_at,
            }
            for review in reviews_list or []
        ]

    return payload


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def objects_api(request):
    """
    @brief API для получения и создания объектов мест
    GET: Возвращает список всех мест
    POST: Создает новое место (только для модераторов)
    @param request HTTP-запрос
    @return Response Ответ с данными мест или результатом создания
    """
    if request.method == "GET":
        items = [
            _serialize_place(request, obj)
            for obj in PlaceObject.objects.order_by("-created_at")
        ]
        return Response(items)

    if not _is_moderator(request.user):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({"error": "Moderator permissions required"}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    checklist = data.get("checklist") or {}
    if isinstance(checklist, str):
        try:
            checklist = json.loads(checklist)
        except json.JSONDecodeError:
            checklist = {}

    image_file = request.FILES.get("image")

    lat_value = data.get("lat") or data.get("latitude")
    lng_value = data.get("lng") or data.get("longitude")
    fallback_coords = None
    if not lat_value or not lng_value:
        fallback_coords = _geocode_address(data.get("address", ""))

    try:
        obj = PlaceObject.objects.create(
            title=str(data.get("title", "")).strip(),
            description=str(data.get("description", "")).strip(),
            upcoming_event=str(data.get("upcoming_event", "")).strip(),
            discount_info=str(data.get("discount_info", "")).strip(),
            infrastructure_type=str(data.get("infrastructureType") or data.get("infrastructure_type") or "").strip(),
            address=str(data.get("address", "")).strip(),
            schedule=str(data.get("schedule", "")).strip(),
            metros=_parse_metros(data.get("metros", [])),
            image_url=str(data.get("imageUrl") or data.get("image_url") or "").strip(),
            image=image_file,
            lat=lat_value or (fallback_coords[0] if fallback_coords else None),
            lng=lng_value or (fallback_coords[1] if fallback_coords else None),
            sign_language=_parse_bool(data.get("sign_language", checklist.get("signLanguage"))),
            subtitles=_parse_bool(data.get("subtitles", checklist.get("subtitles"))),
            ramps=_parse_bool(data.get("ramps", checklist.get("ramps"))),
            braille=_parse_bool(data.get("braille", checklist.get("braille"))),
        )
    except IntegrityError:
        return Response(
            {"error": "Object with same title and address already exists"},
            status=status.HTTP_409_CONFLICT,
        )

    subscriptions = list(PushSubscription.objects.select_related("user").all())
    notifications = [
        _build_notification_payload(
            "new_place",
            "Новое заведение",
            f"Добавлено новое место: {obj.title}",
            f"/building/{obj.id}",
        )
    ]
    if obj.upcoming_event:
        notifications.append(
            _build_notification_payload(
                "event",
                "Предстоящее событие",
                f"{obj.title}: {obj.upcoming_event}",
                f"/building/{obj.id}",
            )
        )
    if obj.discount_info:
        notifications.append(
            _build_notification_payload(
                "discount",
                "Новая скидка",
                f"{obj.title}: {obj.discount_info}",
                f"/building/{obj.id}",
            )
        )
    for notification_payload in notifications:
        _send_push_to_subscriptions(subscriptions, notification_payload)

    return Response({"id": obj.id}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    """
    @brief Проверка состояния сервиса
    @param request HTTP-запрос
    @return Response Ответ со статусом "ok"
    """
    return Response({"status": "ok"})


@api_view(["GET"])
@permission_classes([AllowAny])
def ping(request):
    """
    @brief Проверка работоспособности backend-сервиса
    @param request HTTP-запрос
    @return Response Ответ с информацией о сервисе
    """
    return Response(
        {
            "status": "ok",
            "service": "backend",
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def push_public_key(request):
    """
    @brief Получение публичного ключа для push-уведомлений
    @param request HTTP-запрос
    @return Response Ответ с публичным ключом
    """
    return Response({
        "publicKey": os.getenv("VAPID_PUBLIC_KEY", "").strip(),
    })


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def object_detail(request, object_id):
    """
    @brief API для получения, обновления и удаления деталей объекта
    GET: Возвращает подробную информацию о месте
    PUT: Обновляет информацию о месте (только для модераторов)
    DELETE: Удаляет место (только для модераторов)
    @param request HTTP-запрос
    @param object_id ID объекта
    @return Response Ответ с данными объекта или результатом операции
    """
    obj = get_object_or_404(PlaceObject, id=object_id)
    if request.method == "GET":
        return Response(_serialize_place(request, obj, include_reviews=True))

    if request.method == "DELETE":
        if not _is_moderator(request.user):
            if not request.user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            return Response({"error": "Moderator permissions required"}, status=status.HTTP_403_FORBIDDEN)
        if obj.image:
            obj.image.delete(save=False)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if not _is_moderator(request.user):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({"error": "Moderator permissions required"}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    previous_upcoming_event = obj.upcoming_event
    previous_discount_info = obj.discount_info
    checklist = data.get("checklist") or {}
    if isinstance(checklist, str):
        try:
            checklist = json.loads(checklist)
        except json.JSONDecodeError:
            checklist = {}

    image_file = request.FILES.get("image")
    previous_image_name = obj.image.name if image_file and obj.image else None

    try:
        obj.title = str(data.get("title", obj.title)).strip() or obj.title
        obj.description = str(data.get("description", obj.description)).strip()
        obj.upcoming_event = str(data.get("upcoming_event", obj.upcoming_event)).strip()
        obj.discount_info = str(data.get("discount_info", obj.discount_info)).strip()
        obj.infrastructure_type = str(data.get("infrastructureType") or data.get("infrastructure_type") or obj.infrastructure_type).strip()
        obj.address = str(data.get("address", obj.address)).strip()
        obj.schedule = str(data.get("schedule", obj.schedule)).strip()
        obj.metros = _parse_metros(data.get("metros", obj.metros))
        obj.image_url = str(data.get("imageUrl") or data.get("image_url") or obj.image_url).strip()
        obj.lat = data.get("lat") or data.get("latitude") or obj.lat
        obj.lng = data.get("lng") or data.get("longitude") or obj.lng
        if (obj.lat is None or obj.lng is None) and obj.address:
            fallback_coords = _geocode_address(obj.address)
            if fallback_coords:
                obj.lat = obj.lat if obj.lat is not None else fallback_coords[0]
                obj.lng = obj.lng if obj.lng is not None else fallback_coords[1]
        obj.sign_language = _parse_bool(data.get("sign_language", checklist.get("signLanguage", obj.sign_language)))
        obj.subtitles = _parse_bool(data.get("subtitles", checklist.get("subtitles", obj.subtitles)))
        obj.ramps = _parse_bool(data.get("ramps", checklist.get("ramps", obj.ramps)))
        obj.braille = _parse_bool(data.get("braille", checklist.get("braille", obj.braille)))
        if image_file:
            obj.image = image_file
        obj.save()
        if previous_image_name and obj.image and obj.image.name != previous_image_name:
            try:
                obj.image.storage.delete(previous_image_name)
            except Exception:
                pass
    except IntegrityError:
        return Response(
            {"error": "Object with same title and address already exists"},
            status=status.HTTP_409_CONFLICT,
        )

    subscriptions = list(PushSubscription.objects.select_related("user").all())
    if obj.upcoming_event and obj.upcoming_event != previous_upcoming_event:
        _send_push_to_subscriptions(
            subscriptions,
            _build_notification_payload(
                "event",
                "Обновление события",
                f"{obj.title}: {obj.upcoming_event}",
                f"/building/{obj.id}",
            ),
        )
    if obj.discount_info and obj.discount_info != previous_discount_info:
        _send_push_to_subscriptions(
            subscriptions,
            _build_notification_payload(
                "discount",
                "Обновление скидки",
                f"{obj.title}: {obj.discount_info}",
                f"/building/{obj.id}",
            ),
        )

    return Response(_serialize_place(request, obj, include_reviews=True))


@api_view(["GET"])
@permission_classes([AllowAny])
def object_image(request, object_id):
    """
    @brief Получение изображения объекта по ID
    @param request HTTP-запрос
    @param object_id ID объекта
    @return FileResponse Файл изображения объекта
    """
    obj = get_object_or_404(PlaceObject, id=object_id)
    if not obj.image:
        return Response({"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND)

    content_type, _ = mimetypes.guess_type(obj.image.name)
    image_file = obj.image.open("rb")
    response = FileResponse(image_file, content_type=content_type or "application/octet-stream")
    response["Cache-Control"] = "no-store"
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def object_reviews(request, object_id):
    """
    @brief API для добавления отзывов к объекту
    @param request HTTP-запрос с данными отзыва
    @param object_id ID объекта
    @return Response Результат создания отзыва
    """
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    obj = get_object_or_404(PlaceObject, id=object_id)
    text = str(request.data.get("text", "")).strip()
    raw_rating = request.data.get("rating")

    if not text:
        return Response({"error": "Text is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        rating = int(raw_rating)
    except (TypeError, ValueError):
        return Response({"error": "Rating must be an integer from 1 to 5"}, status=status.HTTP_400_BAD_REQUEST)

    if rating < 1 or rating > 5:
        return Response({"error": "Rating must be from 1 to 5"}, status=status.HTTP_400_BAD_REQUEST)

    review = PlaceReview.objects.create(
        place=obj,
        author_name=request.user.username,
        text=text,
        rating=rating,
    )
    return Response(
        {
            "id": review.id,
            "author": review.author_name,
            "text": review.text,
            "rating": review.rating,
            "created_at": review.created_at,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["DELETE"])
@permission_classes([AllowAny])
def object_review_detail(request, object_id, review_id):
    """
    @brief API для удаления конкретного отзыва
    @param request HTTP-запрос
    @param object_id ID объекта
    @param review_id ID отзыва
    @return Response Результат удаления отзыва
    """
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    obj = get_object_or_404(PlaceObject, id=object_id)
    review = get_object_or_404(PlaceReview, id=review_id, place=obj)

    is_moderator = _is_moderator(request.user)
    is_author = (review.author_name or "").strip() == (request.user.username or "").strip()

    if not is_moderator and not is_author:
        return Response(
            {"error": "You can delete only your own review"},
            status=status.HTTP_403_FORBIDDEN,
        )

    review.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def push_subscriptions_api(request):
    """
    @brief API для управления подписками на push-уведомления
    GET: Возвращает список подписок пользователя
    POST: Создает новую подписку
    DELETE: Удаляет существующую подписку
    @param request HTTP-запрос
    @return Response Результат операции с подписками
    """
    user = request.user

    if request.method == "GET":
        items = [
            {
                "id": item.id,
                "endpoint": item.endpoint,
                "created_at": item.created_at,
                "updated_at": item.updated_at,
            }
            for item in PushSubscription.objects.filter(user=user).order_by("-updated_at")
        ]
        return Response({"items": items})

    if request.method == "DELETE":
        endpoint = str(request.data.get("endpoint", "")).strip()
        if not endpoint:
            return Response({"error": "endpoint is required"}, status=status.HTTP_400_BAD_REQUEST)
        deleted_count, _ = PushSubscription.objects.filter(user=user, endpoint=endpoint).delete()
        return Response({"deleted": deleted_count})

    subscription_data = _subscription_payload_to_data(request.data)
    if not subscription_data:
        return Response({"error": "Invalid subscription payload"}, status=status.HTTP_400_BAD_REQUEST)

    item, _ = PushSubscription.objects.update_or_create(
        endpoint=subscription_data["endpoint"],
        defaults={
            "user": user,
            "p256dh": subscription_data["p256dh"],
            "auth": subscription_data["auth"],
        },
    )

    return Response(
        {
            "id": item.id,
            "endpoint": item.endpoint,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def push_notify_api(request):
    """
    @brief API для отправки push-уведомлений всем подписчикам
    Только для модераторов
    @param request HTTP-запрос с данными уведомления
    @return Response Результат отправки уведомлений
    """
    if not _is_moderator(request.user):
        return Response({"error": "Moderator permissions required"}, status=status.HTTP_403_FORBIDDEN)

    notification_type = str(request.data.get("type", "")).strip() or "general"
    title = str(request.data.get("title", "")).strip()
    body = str(request.data.get("body", "")).strip()
    url = str(request.data.get("url", "")).strip() or "/"

    if not title or not body:
        return Response({"error": "title and body are required"}, status=status.HTTP_400_BAD_REQUEST)

    payload = _build_notification_payload(notification_type, title, body, url)
    subscriptions = list(PushSubscription.objects.select_related("user").all())
    delivery = _send_push_to_subscriptions(subscriptions, payload)

    return Response({
        "payload": payload,
        "delivery": delivery,
    })
