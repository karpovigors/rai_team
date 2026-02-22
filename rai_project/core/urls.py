from django.urls import path
from . import views


urlpatterns = [
    path("health/", views.health, name="health"),
    path("api/ping", views.ping, name="ping"),
    path("api/push/public-key", views.push_public_key, name="push_public_key"),
    path("api/objects", views.objects_api, name="objects_api"),
    path("api/objects/<int:object_id>", views.object_detail, name="object_detail"),
    path("objects/<int:object_id>/image", views.object_image, name="object_image"),
    path("api/objects/<int:object_id>/reviews", views.object_reviews, name="object_reviews"),
    path("api/objects/<int:object_id>/reviews/<int:review_id>", views.object_review_detail, name="object_review_detail"),
    path("api/push/subscriptions", views.push_subscriptions_api, name="push_subscriptions_api"),
    path("api/push/notify", views.push_notify_api, name="push_notify_api"),
]
