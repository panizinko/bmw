FROM python:3.13-slim AS builder

# Set environment variables for Poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml poetry.lock ./

# Install dependencies, excluding development ones, into a local .venv
RUN poetry install --no-root

FROM python:3.13-slim

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv

# Set the PATH to include the virtual environment's binaries
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH="/app/src"

COPY alembic.ini .
COPY alembic ./alembic

# Copy our application source code
COPY ./src ./src

# Expose the port the app runs on
EXPOSE 8000

CMD ["uvicorn", "budget_manager_api.main:app", "--host", "0.0.0.0", "--port", "8000"]