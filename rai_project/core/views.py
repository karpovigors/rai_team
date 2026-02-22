import json
import mimetypes
from urllib.parse import quote

from django.db import IntegrityError
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import PlaceObject, PlaceReview


def _parse_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "on"}
    return False


def _parse_metros(value):
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
    if obj.image:
        image_key = quote(obj.image.name, safe="")
        return f"/objects/{obj.id}/image?key={image_key}"
    return obj.image_url


def _is_moderator(user):
    return user.is_authenticated and (user.is_superuser or getattr(user, "is_moderator", False))


def _serialize_place(request, obj, include_reviews=False):
    reviews_qs = obj.reviews.all()
    reviews_list = list(reviews_qs) if include_reviews else None
    rated_reviews = [review for review in (reviews_list or reviews_qs) if getattr(review, "rating", None)]
    rating_count = len(rated_reviews)
    rating_avg = round(sum(review.rating for review in rated_reviews) / rating_count, 1) if rating_count else 0

    payload = {
        "id": obj.id,
        "title": obj.title,
        "description": obj.description,
        "infrastructure_type": obj.infrastructure_type,
        "address": obj.address,
        "schedule": obj.schedule,
        "metros": obj.metros,
        "image_url": _build_image_url(request, obj),
        "map_image_url": obj.map_image_url,
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

    try:
        obj = PlaceObject.objects.create(
            title=str(data.get("title", "")).strip(),
            description=str(data.get("description", "")).strip(),
            infrastructure_type=str(data.get("infrastructureType") or data.get("infrastructure_type") or "").strip(),
            address=str(data.get("address", "")).strip(),
            schedule=str(data.get("schedule", "")).strip(),
            metros=_parse_metros(data.get("metros", [])),
            image_url=str(data.get("imageUrl") or data.get("image_url") or "").strip(),
            map_image_url=str(data.get("mapImageUrl") or data.get("map_image_url") or "").strip(),
            image=image_file,
            lat=data.get("lat") or data.get("latitude"),
            lng=data.get("lng") or data.get("longitude"),
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

    return Response({"id": obj.id}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok"})


@api_view(["GET"])
@permission_classes([AllowAny])
def ping(request):
    return Response(
        {
            "status": "ok",
            "service": "backend",
        }
    )


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def object_detail(request, object_id):
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
        obj.infrastructure_type = str(data.get("infrastructureType") or data.get("infrastructure_type") or obj.infrastructure_type).strip()
        obj.address = str(data.get("address", obj.address)).strip()
        obj.schedule = str(data.get("schedule", obj.schedule)).strip()
        obj.metros = _parse_metros(data.get("metros", obj.metros))
        obj.image_url = str(data.get("imageUrl") or data.get("image_url") or obj.image_url).strip()
        obj.map_image_url = str(data.get("mapImageUrl") or data.get("map_image_url") or obj.map_image_url).strip()
        obj.lat = data.get("lat") or data.get("latitude") or obj.lat
        obj.lng = data.get("lng") or data.get("longitude") or obj.lng
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

    return Response(_serialize_place(request, obj, include_reviews=True))


@api_view(["GET"])
@permission_classes([AllowAny])
def object_image(request, object_id):
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
