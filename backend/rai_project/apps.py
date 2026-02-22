from django.apps import AppConfig


class RaiProjectConfig(AppConfig):
    """
    @brief Конфигурация основного проекта RAI
    Определяет настройки для главного Django-проекта
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rai_project'