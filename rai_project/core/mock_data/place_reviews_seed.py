from core.models import PlaceObject, PlaceReview


def seed_place_objects_and_reviews() -> None:
    place1, _ = PlaceObject.objects.get_or_create(
        title="КАРО 11 Октябрь",
        address="ул. Новый Арбат, 24",
        defaults={
            "description": (
                "Кинотеатр «КАРО 11 Октябрь» — это большой и красивый зал "
                "с большим экраном и сценой. Здесь часто проходят закрытые "
                "показы кинофильмов вместе с актерами, режиссерами и "
                "участниками съемок."
            ),
            "infrastructure_type": "Кинотеатр",
            "schedule": "ежедневно, 10:00-02:00",
            "metros": ["Смоленская", "Смоленская", "Арбатская"],
            "image_url": (
                "https://avatars.mds.yandex.net/get-altay/1881734/"
                "2a0000016b31d4a3311953c7416353d0c893/XXL"
            ),
            "sign_language": True,
            "subtitles": True,
            "ramps": True,
            "braille": True,
        },
    )

    place2, _ = PlaceObject.objects.get_or_create(
        title="Театр Мимики и Жеста",
        address="Измайловский бул., 41",
        defaults={
            "description": (
                "Театр с программами для глухих и слабослышащих "
                "посетителей, удобной навигацией и доступной средой."
            ),
            "infrastructure_type": "Театр",
            "schedule": "ежедневно, 10:00-21:00",
            "metros": ["Первомайская"],
            "image_url": (
                "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/34/"
                "40/1f/caption.jpg?w=1200&h=-1&s=1"
            ),
            "sign_language": True,
            "subtitles": True,
            "ramps": True,
            "braille": False,
        },
    )

    if not PlaceReview.objects.filter(place=place1).exists():
        PlaceReview.objects.create(
            place=place1,
            author_name="User",
            text="Со всей семьей смотрели фильм, топчик, советую туда сходить, т.к. есть субтитры!",
            rating=5,
        )
        PlaceReview.objects.create(
            place=place1,
            author_name="User1",
            text="Хорошее место",
            rating=4,
        )

    if not PlaceReview.objects.filter(place=place2).exists():
        PlaceReview.objects.create(
            place=place2,
            author_name="Anna",
            text="Очень комфортная среда и вежливый персонал.",
            rating=5,
        )
