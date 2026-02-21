import json
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import IntegrityError

from .models import PlaceObject


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


#Домашняя страница
def home(request):
    return HttpResponse("Сайт работает")


def theatre(request):
    return render(request, "core/theatre.html")


def cinema(request):
    return render(request, "core/cinema.html")


def auth_page(request):
    return render(request, "core/auth.html")


def map_adm(request):
    return render(request, "core/map_adm.html")