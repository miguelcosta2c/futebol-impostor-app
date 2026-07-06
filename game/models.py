from io import BytesIO
from pathlib import Path
from typing import Any

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.db import models
from django.db.models.fields.files import FieldFile
from PIL import Image


def validar_tamanho_imagem(campo_arquivo: FieldFile) -> None:
    """Valida se o tamanho da imagem é menor que 2MB"""
    limite_megabytes = 2
    limite_bytes = limite_megabytes * 1024 * 1024

    if campo_arquivo.size > limite_bytes:
        msg = f"O arquivo é muito grande. \
                O tamanho máximo permitido é de {limite_megabytes}MB"
        raise ValidationError(msg)


class Categoria(models.Model):
    nome = models.CharField(
        max_length=100, unique=True, verbose_name="Nome da Categoria"
    )
    slug = models.SlugField(max_length=100, unique=True, verbose_name="Slug (URL)")

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"

    def __str__(self) -> str:
        return self.nome


class Jogador(models.Model):
    """Representa um jogador cadastrado no sistema para o sorteio nas partidas.

    Attributes:
        nome (str): Nome completo ou apelido do jogador.
        foto (FieldFile): Foto demonstrativa do jogador.
        dicas (str): Dica(s) para o usuario encontrar o jogador
        categoria (ForeignKey): A categoria atual do jogador (vinculada ao model Categoria).
    """  # noqa: E501

    nome = models.CharField(max_length=150, unique=True, verbose_name="Nome do Jogador")
    foto = models.ImageField(
        upload_to="fotos_jogadores/%Y/%m/%d/",
        validators=[validar_tamanho_imagem],
        verbose_name="Foto do Jogador",
        blank=True,
        null=True,
    )
    dicas = models.CharField(max_length=255, verbose_name="Dicas para o Jogador")
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="jogadores",
        verbose_name="Categoria",
    )

    class Meta:
        verbose_name = "Jogador"
        verbose_name_plural = "Jogadores"

    def __str__(self) -> str:
        return self.nome

    def save(self, *args: Any, **kwargs: Any) -> None:
        """Salva e valida a foto do jogador"""
        if self.foto:
            img = Image.open(self.foto)

            if img.mode in ("RGBA", "p"):
                img = img.convert("RGB")

            largura, altura = img.size

            menor_dimensao = min(largura, altura)
            esquerda = (largura - menor_dimensao) / 2
            topo = (altura - menor_dimensao) / 2
            direita = (largura + menor_dimensao) / 2
            base = (altura + menor_dimensao) / 2

            img_quadrada = img.crop((esquerda, topo, direita, base))

            tamanho_final = (500, 500)
            img_redimensionada = img_quadrada.resize(
                tamanho_final, Image.Resampling.LANCZOS
            )

            buffer_recorte = BytesIO()
            img_redimensionada.save(buffer_recorte, format="JPEG", quality=85)

            nome_arquivo = Path(self.foto.name).name
            self.foto.save(
                nome_arquivo, ContentFile(buffer_recorte.getvalue()), save=False
            )

        super().save(*args, **kwargs)
