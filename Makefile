.PHONY: help build up down restart logs shell-backend shell-db migrate collectstatic test lint clean rebuild rebuild-clean

# Основная справка
help:
	@echo "Команды управления Docker"
	@echo ""
	@echo "Использование: make [команда]"
	@echo ""
	@echo "Основные команды:"
	@echo "  build         		Собрать все контейнеры"
	@echo "  up            		Запустить все сервисы (фоновый режим)"
	@echo "  dev           		Запустить все сервисы (режим разработки с логами)"
	@echo "  down          		Остановить и удалить контейнеры, сети"
	@echo "  restart       		Перезапустить все сервисы"
	@echo "  logs          		Просмотр логов всех сервисов"
	@echo "  logs-backend  		Логи только бекенда"
	@echo "  logs-frontend 		Логи только фронтенда"
	@echo "  logs-db       		Логи только базы данных"
	@echo "  shell-backend 		Открыть shell в контейнере бекенда"
	@echo "  shell-python  		Открыть Python shell бекенда"
	@echo "  shell-db      		Открыть shell в контейнере БД"
	@echo "  psql          		Подключиться к PostgreSQL через psql"
	@echo "  migrate       		Применить миграции Django"
	@echo "  makemigrations 	Создать новые миграции"
	@echo "  collectstatic 		Собрать статические файлы Django"
	@echo "  createsuperuser 	Создать суперпользователя Django"
	@echo "  test          		Запустить тесты Django"
	@echo "  lint          		Запустить линтер фронтенда"
	@echo "  frontend-install 	Установить зависимости фронтенда"
	@echo "  frontend-build 	Собрать фронтенд"
	@echo "  clean         		Удалить контейнеры, тома и артефакты"
	@echo "  rebuild       		Быстро пересобрать и перезапустить сервисы"
	@echo "  rebuild-clean 		Полная пересборка без кэша"
	@echo "  ps            		Показать работающие контейнеры"
	@echo "  db-backup     		Создать бэкап базы данных"
	@echo "  db-restore    		Восстановить БД из бэкапа (FILE=путь_к_файлу)"
	@echo ""

# Собрать все контейнеры
build:
	docker compose build

# Запустить все сервисы в фоновом режиме
up:
	docker compose up -d

# Запустить все сервисы в режиме разработки (с логами)
dev:
	docker compose up

# Остановить и удалить контейнеры и сети
down:
	docker compose down

# Перезапустить все сервисы
restart:
	docker compose restart

# Просмотр логов всех сервисов
logs:
	docker compose logs -f

# Логи только бекенда
logs-backend:
	docker compose logs -f backend

# Логи только фронтенда
logs-frontend:
	docker compose logs -f frontend

# Логи только базы данных
logs-db:
	docker compose logs -f db

# Открыть shell в контейнере бекенда
shell-backend:
	docker compose exec backend sh

# Открыть Python shell в контейнере бекенда
shell-python:
	docker compose exec backend python manage.py shell

# Открыть shell в контейнере базы данных
shell-db:
	docker compose exec db sh

# Подключиться к PostgreSQL через psql
psql:
	docker compose exec db psql -U rai_user -d rai_db

# Применить миграции Django
migrate:
	docker compose exec backend python manage.py migrate

# Создать новые миграции Django
makemigrations:
	docker compose exec backend python manage.py makemigrations

# Собрать статические файлы Django
collectstatic:
	docker compose exec backend python manage.py collectstatic --noinput

# Создать суперпользователя Django
createsuperuser:
	docker compose exec backend python manage.py createsuperuser

# Запустить тесты Django
test:
	docker compose exec backend python manage.py test

# Запустить линтер фронтенда
lint:
	docker compose run --rm frontend npm run lint

# Установить зависимости фронтенда
frontend-install:
	docker compose run --rm frontend npm install

# Собрать фронтенд
frontend-build:
	docker compose run --rm frontend npm run build

# Удалить контейнеры, тома и артефакты сборки
clean:
	docker compose down -v --remove-orphans
	docker system prune -f

# Пересобрать и перезапустить сервисы
rebuild:
	docker compose down
	docker compose build
	docker compose up -d

# Полная пересборка без кэша
rebuild-clean:
	docker compose down
	docker compose build --no-cache
	docker compose up -d

# Показать работающие контейнеры
ps:
	docker compose ps

# Создать бэкап базы данных
db-backup:
	@mkdir -p ./backups
	docker compose exec db pg_dump -U rai_user rai_db > ./backups/db_backup_$$(date +%Y%m%d_%H%M%S).sql

# Восстановить БД из бэкапа (использование: make db-restore FILE=backups/db_backup_YYYYMMDD_HHMMSS.sql)
db-restore:
	@if [ -z "$(FILE)" ]; then echo "Ошибка: требуется FILE. Пример: make db-restore FILE=backups/file.sql"; exit 1; fi
	docker compose exec -T db psql -U rai_user -d rai_db < $(FILE)
