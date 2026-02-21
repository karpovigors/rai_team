from django.urls import path
from . import views


urlpatterns = [
    path("health/", views.health, name="health"),
    path("api/ping", views.ping, name="ping"),
    path("api/objects", views.objects_api, name="objects_api"),
]
