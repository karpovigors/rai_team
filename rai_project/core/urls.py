from django.urls import path
from django.views.generic import RedirectView
from .views import home
from . import views


#ссылки
urlpatterns = [
    path('', home, name='home'),
    path("home/", RedirectView.as_view(url="/", permanent=False)),
    path("theatre/", views.theatre, name="theatre"),
    path("cinema/", views.cinema, name="cinema"),
    path("auth/", views.auth_page, name="auth"),
    path("add_map/", views.map_adm, name="map_adm"),
    path("api/objects", views.objects_api, name="objects_api"),
]