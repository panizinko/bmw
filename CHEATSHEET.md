# Developer Command Cheatsheet

This document lists the common commands for developing and managing the Budget Manager API.

## 🐳 Docker & Application Management

All `docker-compose` commands should be run from the **project's root directory** (the one containing `docker-compose.yml`).

**Start all services with live-reloading (Recommended for Development):**
This is the main command for day-to-day development. It starts all services and uses file watching to automatically reload the backend when you change the code.
```bash
docker-compose watch
```

**Rebuild images and start services:**
Run this after you add a new dependency with `poetry add` or change a `Dockerfile`.
```bash
docker-compose up --build
```

**Start only the database services in the background:**
Useful if you only need the database running for other tasks.
```bash
docker-compose up -d postgres pgadmin
```

**Stop all running services:**
```bash
docker-compose down
```

**Nuke Everything (Stop services AND delete all data):**
Use this when you need a completely fresh start. **This will delete all database and pgAdmin data.** It's the best way to reset if you have migration issues.
```bash
docker-compose down -v
```

---

## 🗄️ Database Migrations (Alembic)

The entire application stack must be running (`docker-compose watch`) before you run these commands. All commands should be run from the **`budget-manager-api/` directory**.

**The Full Migration Workflow:**

1.  **Make changes** to your table definitions in `src/budget_manager_api/db_schema.py`.

2.  **Generate a new migration script:** This command "reaches into" the running backend container to generate the script. The new file will appear locally in `alembic/versions/`.
    ```bash
    poetry run poe db_migrate "A descriptive message for your change"
    ```
    *Example: `poetry run poe db_migrate "Add is_active column to users"`*

3.  **Apply the migration to the database:** This command also runs inside the container to apply the new script to the database.
    ```bash
    poetry run poe db_upgrade
    ```

**Other Useful Alembic Commands:**

*   **Downgrade by one step:**
    ```bash
    docker-compose exec backend alembic downgrade -1
    ```
*   **Check current status:**
    ```bash
    docker-compose exec backend alembic current
    ```

---

## 🧪 Testing

The database container must be running (`docker-compose up -d postgres`). All test commands should be run from the **`budget-manager-api/` directory**.

**Run the entire test suite:**
```bash
poetry run poe test
```