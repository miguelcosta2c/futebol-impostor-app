from django.apps import AppConfig


class GameConfig(AppConfig):
    name = "game"

    def ready(self) -> None:
        import game.signals  # noqa: F401, PLC0415
