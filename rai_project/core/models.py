from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

#Объект карта яндекс
class PlaceObject(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    infrastructure_type = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=100, blank=True)
    schedule = models.CharField(max_length=120, blank=True)
    metros = models.JSONField(default=list, blank=True)
    image_url = models.URLField(blank=True)
    map_image_url = models.URLField(blank=True)
    image = models.FileField(upload_to="places/", blank=True, null=True)

    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)

    sign_language = models.BooleanField(default=False)
    subtitles = models.BooleanField(default=False)
    ramps = models.BooleanField(default=False)
    braille = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["title", "address"],
                name="unique_place_title_address",
            )
        ]
    def __str__(self):
        return self.title


class PlaceReview(models.Model):
    place = models.ForeignKey(PlaceObject, on_delete=models.CASCADE, related_name="reviews")
    author_name = models.CharField(max_length=150)
    text = models.TextField()
    rating = models.PositiveSmallIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author_name}: {self.place.title}"
