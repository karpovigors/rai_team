from django.urls import path
from . import views


urlpatterns = [
    path("health/", views.health, name="health"),
    path("api/ping", views.ping, name="ping"),
    path("api/objects", views.objects_api, name="objects_api"),
    path("api/objects/<int:object_id>", views.object_detail, name="object_detail"),
    path("objects/<int:object_id>/image", views.object_image, name="object_image"),
    path("api/objects/<int:object_id>/reviews", views.object_reviews, name="object_reviews"),
]
