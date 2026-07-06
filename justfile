server:
  uv run gunicorn core.wsgi:application

collectstatic:
  uv run manage.py collectstatic --noinput --clear
