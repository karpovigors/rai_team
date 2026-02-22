import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Ensure bootstrap accounts (superuser and moderator) exist."

    def handle(self, *args, **options):
        user_model = get_user_model()

        self._ensure_superuser(user_model)
        self._ensure_moderator(user_model)

    def _ensure_superuser(self, user_model):
        username = os.getenv("DJANGO_SUPERUSER_USERNAME", "").strip()
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "").strip()
        email = os.getenv("DJANGO_SUPERUSER_EMAIL", "").strip()

        if not username:
            self.stdout.write("Superuser username is not set, skipping.")
            return

        user, created = user_model.objects.get_or_create(
            username=username,
            defaults={"email": email},
        )

        if password:
            user.set_password(password)

        if email:
            user.email = email

        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
        user.save()

        status = "created" if created else "updated"
        self.stdout.write(f"Superuser {status}: {username}")

    def _ensure_moderator(self, user_model):
        username = os.getenv("MODERATOR_USERNAME", "").strip()
        password = os.getenv("MODERATOR_PASSWORD", "").strip()
        email = os.getenv("MODERATOR_EMAIL", "").strip()

        if not username:
            self.stdout.write("Moderator username is not set, skipping.")
            return

        user, created = user_model.objects.get_or_create(
            username=username,
            defaults={"email": email},
        )

        if password:
            user.set_password(password)
        elif created:
            user.set_unusable_password()

        if email:
            user.email = email

        user.is_moderator = True
        user.is_active = True
        user.save()

        status = "created" if created else "updated"
        self.stdout.write(f"Moderator {status}: {username}")
