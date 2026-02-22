from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0002_sync_placereview_rating_column"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="placeobject",
            name="map_image_url",
        ),
    ]
