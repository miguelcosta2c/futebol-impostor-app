from django.contrib import admin

from .models import Categoria, Jogador


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nome", "slug")
    prepopulated_fields = {"slug": ("nome",)}  # noqa: RUF012
    search_fields = ("nome",)


@admin.register(Jogador)
class JogadorAdmin(admin.ModelAdmin):
    list_display = ("nome", "categoria", "dicas")
    list_filter = ("categoria",)
    search_fields = ("nome", "dicas")
    autocomplete_fields = ("categoria",)
