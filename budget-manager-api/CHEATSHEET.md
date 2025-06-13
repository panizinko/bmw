# Developer Command Cheatsheet

Common commands for developing and managing the Budget Manager API.

## 🐳 Docker & Application Management

All `docker-compose` commands should be run from the project's root directory (the one containing `docker-compose.yml`).

**Start all services with live-reloading:**
This is the main command for day-to-day development. It starts the backend, frontend, database, and pgAdmin, with file watching enabled.
```bash
docker-compose watch
```

**Start only the backend and its dependencies (Postgres):**
Useful if you are not working on the frontend.
```bash
docker-compose up --build backend
```

**Start only the database services in the background:**
Useful for running local tests without starting the full application stack.
```bash
docker-compose up -d postgres pgadmin
```

**Stop all running services:**
```bash
docker-compose down
```

**Nuke Everything (Stop services AND delete all data):**
Use this when you need a completely fresh start, for example, after changing the database schema in a breaking way. **This will delete all database and pgAdmin data.**
```bash
docker-compose down -v
```

---

## 🧪 Testing

All test commands should be run from the `budget-manager-api/` directory.

**Run the entire test suite:**
```bash
poetry run poe test
```

---

## 🗄️ Database Migrations (Alembic)

All `alembic` commands should be run from the `budget-manager-api/` directory. Make sure the Postgres container is running first (`docker-compose up -d postgres`).

**Generate a new migration script after changing models:**
After you modify `src/budget_manager_api/db_schema.py`, run this to have Alembic automatically generate the migration script.
```bash
poetry run alembic revision --autogenerate -m "A descriptive message for your change"
```
*Example: `poetry run alembic revision --autogenerate -m "Add is_active column to users"`*

**Apply all pending migrations to the database:**
This runs the `upgrade()` function in all new migration scripts.
```bash
poetry run alembic upgrade head
```

**Downgrade the database by one migration:**
This runs the `downgrade()` function of the most recent migration. Useful for undoing a change.
```bash
poetry run alembic downgrade -1
```

**Check the current status of migrations:**
Shows which revision the database is at and what the latest "head" revision is.
```bash
poetry run alembic current
```