from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_pushsubscription'),
    ]

    operations = [
        migrations.AddField(
            model_name='placeobject',
            name='discount_info',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='placeobject',
            name='upcoming_event',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
