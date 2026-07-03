from django.http import HttpRequest as HttpRequestBase
from django.http import HttpResponse
from django.shortcuts import render
from django_htmx.middleware import HtmxDetails

from .models import Jogador


class HttpRequest(HttpRequestBase):
    htmx: HtmxDetails


def home(request: HttpRequest) -> HttpResponse:
    if request.htmx:
        jogador = Jogador.objects.order_by("?").first()
        return render(request, "game/partials/_jogador_card.html", {"jogador": jogador})
    return render(request, "game/home.html")
