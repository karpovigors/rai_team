from django.apps import AppConfig


class AccountsConfig(AppConfig):
    """
    @brief Конфигурация приложения accounts
    Определяет настройки для приложения аутентификации и управления пользователями
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'