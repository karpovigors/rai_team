from django.http import HttpResponse
from django.shortcuts import render


#Домашняя страница
def home(request):
    return HttpResponse("Сайт работает")


def theatre(request):
    return render(request, "core/theatre.html")


def cinema(request):
    return render(request, "core/cinema.html")


def auth_page(request):
    return render(request, "core/auth.html")


def map_adm(request):
    return render(request, "core/map_adm.html")