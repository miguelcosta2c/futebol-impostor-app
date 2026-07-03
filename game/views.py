import random

from django.http import HttpRequest as HttpRequestBase
from django.http import HttpResponse
from django.shortcuts import render
from django_htmx.middleware import HtmxDetails

from .models import Categoria, Jogador


class HttpRequest(HttpRequestBase):
    htmx: HtmxDetails


def home(request: HttpRequest) -> HttpResponse:
    if request.htmx:
        qs = Jogador.objects.all()
        categorias = request.GET.get("categorias")

        if categorias:
            ids_categorias = [
                int(c) for c in categorias.split(",") if c.strip().isdigit()
            ]
            if ids_categorias:
                qs = qs.filter(categoria_id__in=ids_categorias)

        todos_os_ids = list(qs.values_list("id", flat=True))

        if not todos_os_ids:
            return render(
                request, "game/partials/_jogador_card.html", {"jogador": None}
            )

        sorteados = request.session.get("jogadores_sorteados", [])
        disponiveis = [id_for for id_for in todos_os_ids if id_for not in sorteados]

        if not disponiveis:
            sorteados = []
            disponiveis = todos_os_ids

        id_escolhido = random.choice(disponiveis)  # noqa: S311

        sorteados.append(id_escolhido)
        request.session["jogadores_sorteados"] = sorteados
        jogador = Jogador.objects.get(id=id_escolhido)

        return render(request, "game/partials/_jogador_card.html", {"jogador": jogador})

    categorias = Categoria.objects.all()
    return render(request, "game/home.html", {"categorias": categorias})
