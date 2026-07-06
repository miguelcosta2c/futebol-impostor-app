#!/usr/bin/env bash
set -o errexit

echo "---> Iniciando o processo de Build com UV..."

if ! command -v uv &> /dev/null; then
    echo "---> Instalando o UV..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source $HOME/.local/bin/env
fi

echo "---> Instalando dependências..."
uv sync --frozen

echo "---> Rodando migrações do banco de dados..."
uv run python manage.py migrate

echo "---> Coletando arquivos estáticos..."
uv run python manage.py tailwind build
uv run python manage.py collectstatic --noinput --clear

echo "---> Build concluído com sucesso!"
