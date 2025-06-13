from fastapi import Request


def get_db_session(request: Request):
    """
    FastAPI dependency to create and clean up a database session.
    """
    db = None
    try:
        SessionLocal = request.app.state.db_session_factory
        db = SessionLocal()
        yield db
    finally:
        if db:
            db.close()
