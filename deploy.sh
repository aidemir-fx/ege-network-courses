#!/bin/bash
set -e

echo "=== [1/4] Сборка нового образа приложения ==="
docker compose build

echo "=== [2/4] Запуск обновленного контейнера ==="
docker compose up -d --remove-orphans

echo "=== [3/4] Очистка старых образов и кэша сборщика ==="
# Удаляем старые неиспользуемые образы (предыдущие версии контейнера)
docker image prune -f

# Очищаем кэш buildkit (чтобы не забивал диск)
docker builder prune -f --filter "until=24h"

echo "=== [4/4] Статус контейнеров и использование диска Docker ==="
docker compose ps
echo ""
docker system df

echo ""
echo "✅ Обновление завершено успешно! Данные в ./data сохранены."
