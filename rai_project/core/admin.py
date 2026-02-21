from django.contrib import admin
from .models import PlaceObject, PlaceReview


@admin.register(PlaceObject)
class PlaceObjectAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "infrastructure_type", "address", "created_at")
    search_fields = ("title", "address", "infrastructure_type")


@admin.register(PlaceReview)
class PlaceReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "place", "author_name", "created_at")
    search_fields = ("author_name", "text", "place__title")
