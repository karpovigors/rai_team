import json
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import IntegrityError

from .models import PlaceObject, PlaceReview


@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def objects_api(request):
    if request.method == "OPTIONS":
        resp = HttpResponse(status=204)
        resp["Access-Control-Allow-Origin"] = "*"
        resp["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
        resp["Access-Control-Allow-Headers"] = "Content-Type"
        return resp

    if request.method == "GET":
        items = list(
            PlaceObject.objects.order_by("-created_at").values(
                "id",
                "title",
                "description",
                "infrastructure_type",
                "address",          # ← запятая
                "schedule",
                "metros",
                "image_url",
                "map_image_url",
                "lat",
                "lng",
                "sign_language",
                "subtitles",
                "ramps",
                "braille",
                "created_at",
            )
        )
        resp = JsonResponse(items, safe=False)
        resp["Access-Control-Allow-Origin"] = "*"
        return resp

    try:
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        resp = JsonResponse({"error": "Invalid JSON"}, status=400)
        resp["Access-Control-Allow-Origin"] = "*"
        return resp

    coords = data.get("coordinates") or {}
    checklist = data.get("checklist") or {}

    try:
        obj = PlaceObject.objects.create(
            title=data.get("title", ""),
            description=data.get("description", ""),
            infrastructure_type=data.get("infrastructureType", ""),
            address=data.get("address", ""),
            schedule=data.get("schedule", ""),
            metros=data.get("metros", []),
            image_url=data.get("imageUrl", ""),
            map_image_url=data.get("mapImageUrl", ""),
            lat=coords.get("latitude"),
            lng=coords.get("longitude"),
            sign_language=bool(checklist.get("signLanguage")),
            subtitles=bool(checklist.get("subtitles")),
            ramps=bool(checklist.get("ramps")),
            braille=bool(checklist.get("braille")),
        )
    except IntegrityError:
        resp = JsonResponse(
            {"error": "Object with same title and address already exists"},
            status=409,
        )
        resp["Access-Control-Allow-Origin"] = "*"
        return resp

    resp = JsonResponse({"id": obj.id}, status=201)
    resp["Access-Control-Allow-Origin"] = "*"
    return resp


def health(request):
    return HttpResponse("ok")


@require_http_methods(["GET"])
def ping(request):
    return JsonResponse(
        {
            "status": "ok",
            "service": "backend",
        }
    )


@require_http_methods(["GET"])
def object_detail(request, object_id):
    obj = get_object_or_404(PlaceObject, id=object_id)
    reviews = [
        {
            "id": review.id,
            "author": review.author_name,
            "text": review.text,
            "created_at": review.created_at,
        }
        for review in obj.reviews.all()
    ]
    return JsonResponse(
        {
            "id": obj.id,
            "title": obj.title,
            "description": obj.description,
            "infrastructure_type": obj.infrastructure_type,
            "address": obj.address,
            "schedule": obj.schedule,
            "metros": obj.metros,
            "image_url": obj.image_url,
            "map_image_url": obj.map_image_url,
            "sign_language": obj.sign_language,
            "subtitles": obj.subtitles,
            "ramps": obj.ramps,
            "braille": obj.braille,
            "reviews": reviews,
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
def object_reviews(request, object_id):
    obj = get_object_or_404(PlaceObject, id=object_id)
    try:
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    author = str(data.get("author", "")).strip()
    text = str(data.get("text", "")).strip()

    if not author or not text:
        return JsonResponse({"error": "Author and text are required"}, status=400)

    review = PlaceReview.objects.create(place=obj, author_name=author, text=text)
    return JsonResponse(
        {
            "id": review.id,
            "author": review.author_name,
            "text": review.text,
            "created_at": review.created_at,
        },
        status=201,
    )
