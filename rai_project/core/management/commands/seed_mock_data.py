from django.core.management.base import BaseCommand

from core.mock_data.place_reviews_seed import seed_place_objects_and_reviews


class Command(BaseCommand):
    help = "Seed mock place objects and reviews data."

    def handle(self, *args, **options):
        seed_place_objects_and_reviews()
        self.stdout.write(self.style.SUCCESS("Mock data created or already exists."))
