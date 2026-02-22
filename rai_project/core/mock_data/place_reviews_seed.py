from pathlib import Path

from django.core.files import File

from core.models import PlaceObject, PlaceReview


SEED_PLACES = [
    {
        'title': 'КАРО 11 Октябрь',
        'address': 'ул. Новый Арбат, 24',
        'description': 'Крупный кинотеатр, на части сеансов доступны субтитры, удобен для культурного досуга.',
        'upcoming_event': 'Премьера фильма с субтитрами',
        'discount_info': 'Скидка инвалидам по 200р',
        'infrastructure_type': 'Кинотеатр',
        'schedule': 'ежедневно, 10:00-02:00',
        'metros': ['Смоленская', 'Арбатская'],
        'image_url': '',
        'image_local_path': 'places/780c0cad4f0decb42f27c25bd04bce36.jpg',
        'lat': 55.753083,
        'lng': 37.587623,
        'sign_language': False,
        'subtitles': True,
        'ramps': True,
        'braille': False,
        'reviews': [
            {'author_name': 'User', 'text': 'Со всей семьей смотрели фильм, топчик, советую туда сходить, т.к. есть субтитры!', 'rating': 5},
            {'author_name': 'User1', 'text': 'Хорошее место', 'rating': 5},
        ],
    },
    {
        'title': 'Театр Мимики и Жеста',
        'address': 'Измайловский бул., 41',
        'description': 'Профильный театр для глухих и слабослышащих зрителей, постановки с использованием русского жестового языка.',
        'upcoming_event': 'Показ спектакля выходного дня',
        'discount_info': 'Льготные билеты для студентов и пенсионеров',
        'infrastructure_type': 'Театр',
        'schedule': 'ежедневно, 10:00-21:00',
        'metros': ['Первомайская'],
        'image_url': '',
        'image_local_path': 'places/1200_634d1c0282682c3a4aee9523.jpg',
        'lat': 55.79766,
        'lng': 37.797065,
        'sign_language': True,
        'subtitles': True,
        'ramps': True,
        'braille': False,
        'reviews': [
            {'author_name': 'Anna', 'text': 'Очень комфортная среда и вежливый персонал.', 'rating': 5},
        ],
    },
    {
        'title': 'Еврейский музей и центр толерантности',
        'address': 'Москва, ул. Образцова, 11, стр. 1А',
        'description': 'Современный музей с инклюзивными программами и доступной средой для посетителей с разными потребностями.',
        'upcoming_event': 'Инклюзивная экскурсия',
        'discount_info': 'Льготный билет по удостоверению',
        'infrastructure_type': 'Музей',
        'schedule': 'ежедневно, 12:00-22:00',
        'metros': ['Марьина Роща', 'Достоевская'],
        'image_url': '',
        'image_local_path': '',
        'lat': 55.7949,
        'lng': 37.6097,
        'sign_language': True,
        'subtitles': True,
        'ramps': True,
        'braille': True,
        'reviews': [],
    },
    {
        'title': 'Музей современного искусства «Гараж»',
        'address': 'Москва, ул. Крымский Вал, 9, стр. 32',
        'description': 'Культурная площадка с инклюзивными событиями и доступной инфраструктурой.',
        'upcoming_event': 'Открытая лекция',
        'discount_info': 'Льготные категории посетителей',
        'infrastructure_type': 'Музей',
        'schedule': 'ежедневно, 11:00-22:00',
        'metros': ['Парк культуры', 'Октябрьская'],
        'image_url': '',
        'image_local_path': 'places/гараж.webp',
        'lat': 55.72778,
        'lng': 37.6016,
        'sign_language': False,
        'subtitles': False,
        'ramps': True,
        'braille': True,
        'reviews': [],
    },
    {
        'title': 'Новая Третьяковка',
        'address': 'Москва, Крымский Вал, 10',
        'description': 'Крупный музейный комплекс, социально значимый объект с доступной средой для посетителей.',
        'upcoming_event': 'Тематическая экскурсия',
        'discount_info': 'Льготный вход по расписанию',
        'infrastructure_type': 'Музей',
        'schedule': 'ежедневно, 10:00-21:00',
        'metros': ['Октябрьская', 'Парк культуры'],
        'image_url': '',
        'image_local_path': 'places/Новая_Третьяковка.jpg',
        'lat': 55.734643,
        'lng': 37.605768,
        'sign_language': False,
        'subtitles': True,
        'ramps': True,
        'braille': True,
        'reviews': [],
    },
    {
        'title': 'ГМИИ им. А. С. Пушкина',
        'address': 'Москва, ул. Волхонка, 12',
        'description': 'Один из ключевых музеев Москвы с программами доступности и инфраструктурой для посетителей.',
        'upcoming_event': 'Экскурсия для маломобильных групп',
        'discount_info': 'Льготные билеты',
        'infrastructure_type': 'Музей',
        'schedule': 'ежедневно, 11:00-20:00',
        'metros': ['Кропоткинская', 'Боровицкая'],
        'image_url': '',
        'image_local_path': '',
        'lat': 55.747277,
        'lng': 37.605194,
        'sign_language': True,
        'subtitles': False,
        'ramps': True,
        'braille': True,
        'reviews': [],
    },
    {
        'title': 'Парк Зарядье',
        'address': 'Москва, ул. Варварка, 6, стр. 1',
        'description': 'Городское общественное пространство с удобной навигацией и доступными маршрутами.',
        'upcoming_event': 'Открытая программа на сцене',
        'discount_info': 'Бесплатный вход на территорию',
        'infrastructure_type': 'Парк',
        'schedule': 'ежедневно, 10:00-22:00',
        'metros': ['Китай-город', 'Площадь Революции'],
        'image_url': '',
        'image_local_path': '',
        'lat': 55.7516,
        'lng': 37.6288,
        'sign_language': False,
        'subtitles': False,
        'ramps': True,
        'braille': False,
        'reviews': [
            {'author_name': 'moderator', 'text': 'куку', 'rating': 5},
        ],
    },
    {
        'title': 'ВДНХ',
        'address': 'Москва, проспект Мира, 119',
        'description': 'Большая территория с павильонами и социально значимыми объектами, подходит для карты доступности.',
        'upcoming_event': 'Выставка выходного дня',
        'discount_info': 'Бесплатный вход на территорию',
        'infrastructure_type': 'Выставочный комплекс',
        'schedule': 'ежедневно, 10:00-22:00',
        'metros': ['ВДНХ'],
        'image_url': '',
        'image_local_path': 'places/вндх.webp',
        'lat': 55.826296,
        'lng': 37.63765,
        'sign_language': False,
        'subtitles': False,
        'ramps': True,
        'braille': False,
        'reviews': [],
    },
    {
        'title': 'Флагманский МФЦ «Мои документы»',
        'address': 'Москва, Пресненская набережная, 2',
        'description': 'Социально значимый объект для получения госуслуг, важен для повседневной жизни людей с инвалидностью.',
        'upcoming_event': 'Консультационный день',
        'discount_info': 'Не требуется',
        'infrastructure_type': 'Госуслуги / МФЦ',
        'schedule': 'ежедневно, 10:00-22:00',
        'metros': ['Деловой центр', 'Выставочная'],
        'image_url': '',
        'image_local_path': 'places/мфц.webp',
        'lat': 55.749162,
        'lng': 37.539742,
        'sign_language': True,
        'subtitles': False,
        'ramps': True,
        'braille': False,
        'reviews': [],
    },
]


PROJECT_MEDIA_DIR = Path(__file__).resolve().parents[2] / 'media'


def _apply_local_image(place: PlaceObject, image_local_path: str) -> None:
    if not image_local_path:
        return

    source_path = PROJECT_MEDIA_DIR / image_local_path
    if not source_path.exists():
        return

    current_name = place.image.name or ''
    if current_name == image_local_path:
        return

    with source_path.open('rb') as image_file:
        place.image.save(source_path.name, File(image_file), save=False)
    place.save(update_fields=['image'])


def seed_place_objects_and_reviews() -> None:
    for seed_item in SEED_PLACES:
        item = {
            k: v
            for k, v in seed_item.items()
            if k not in {'reviews', 'image_local_path'}
        }
        reviews = list(seed_item.get('reviews', []))
        image_local_path = seed_item.get('image_local_path', '')

        place, _ = PlaceObject.objects.update_or_create(
            title=item['title'],
            address=item['address'],
            defaults=item,
        )
        _apply_local_image(place, image_local_path)

        for review_data in reviews:
            PlaceReview.objects.get_or_create(
                place=place,
                author_name=review_data['author_name'],
                text=review_data['text'],
                defaults={'rating': review_data.get('rating', 5)},
            )
