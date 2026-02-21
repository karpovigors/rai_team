from django.db import models

#Объект карта яндекс
class PlaceObject(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    infrastructure_type = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=100, blank=True)

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