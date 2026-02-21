.PHONY: help build up down restart logs shell-backend shell-db migrate collectstatic test lint clean rebuild

# Default target
help:
	@echo "Docker Management Commands"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Commands:"
	@echo "  build         Build all containers"
	@echo "  up            Start all services in detached mode"
	@echo "  down          Stop and remove all containers, networks"
	@echo "  restart       Restart all services"
	@echo "  logs          View logs from all services"
	@echo "  logs-backend  View backend logs only"
	@echo "  logs-frontend View frontend logs only"
	@echo "  logs-db       View database logs only"
	@echo "  shell-backend Open shell in backend container"
	@echo "  shell-db      Open shell in database container"
	@echo "  migrate       Run Django migrations"
	@echo "  collectstatic Collect static files for Django"
	@echo "  test          Run Django tests"
	@echo "  lint          Run linter on frontend"
	@echo "  clean         Remove all containers, volumes, and build artifacts"
	@echo "  rebuild       Rebuild and restart all services"
	@echo "  dev           Start services in development mode (with logs)"
	@echo ""

# Build all containers
build:
	docker-compose build

# Start all services in detached mode
up:
	docker-compose up -d

# Start all services in foreground (development)
dev:
	docker-compose up

# Stop and remove all containers and networks
down:
	docker-compose down

# Restart all services
restart:
	docker-compose restart

# View logs from all services
logs:
	docker-compose logs -f

# View backend logs only
logs-backend:
	docker-compose logs -f backend

# View frontend logs only
logs-frontend:
	docker-compose logs -f frontend

# View database logs only
logs-db:
	docker-compose logs -f db

# Open shell in backend container
shell-backend:
	docker-compose exec backend sh

# Open Python shell in backend container
shell-python:
	docker-compose exec backend python manage.py shell

# Open shell in database container
shell-db:
	docker-compose exec db sh

# Open psql in database container
psql:
	docker-compose exec db psql -U rai_user -d rai_db

# Run Django migrations
migrate:
	docker-compose exec backend python manage.py migrate

# Create Django migrations
makemigrations:
	docker-compose exec backend python manage.py makemigrations

# Collect static files for Django
collectstatic:
	docker-compose exec backend python manage.py collectstatic --noinput

# Create superuser
createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

# Run Django tests
test:
	docker-compose exec backend python manage.py test

# Run linter on frontend
lint:
	docker-compose run --rm frontend npm run lint

# Install frontend dependencies
frontend-install:
	docker-compose run --rm frontend npm install

# Run frontend build
frontend-build:
	docker-compose run --rm frontend npm run build

# Remove all containers, volumes, and build artifacts
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

# Rebuild and restart all services
rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

# Show running containers
ps:
	docker-compose ps

# Database backup
db-backup:
	@mkdir -p ./backups
	docker-compose exec db pg_dump -U rai_user rai_db > ./backups/db_backup_$$(date +%Y%m%d_%H%M%S).sql

# Database restore (usage: make db-restore FILE=backups/db_backup_YYYYMMDD_HHMMSS.sql)
db-restore:
	@if [ -z "$(FILE)" ]; then echo "Error: FILE is required. Usage: make db-restore FILE=backups/file.sql"; exit 1; fi
	docker-compose exec -T db psql -U rai_user -d rai_db < $(FILE)
