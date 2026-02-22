from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0003_customuser_is_moderator"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="avatar",
            field=models.FileField(blank=True, null=True, upload_to="avatars/"),
        ),
    ]

