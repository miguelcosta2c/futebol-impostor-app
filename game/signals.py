from pathlib import Path
from typing import Any

from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import Jogador


@receiver(post_delete, sender=Jogador)
def deletar_foto_jogador(
    sender: type[Jogador], instance: Jogador, **kwargs: Any
) -> None:
    # Apaga a foto do jogador após ele ser deletado.
    if instance.foto:
        caminho_foto = Path(instance.foto.path)
        caminho_foto.unlink(missing_ok=True)
