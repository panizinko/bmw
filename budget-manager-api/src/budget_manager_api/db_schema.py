from sqlalchemy import (
    Column,
    DateTime,
    Index,
    MetaData,
    String,
    Table,
    func,
)

convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=convention)

users_table = Table(
    "users",
    metadata,
    Column("id", String(36), primary_key=True),
    Column("name", String(50), nullable=False),
    Column("email", String(255), nullable=False, unique=True),
    Column("hashed_password", String(255), nullable=False),
    Column(
        "created_at",
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    ),
    Column(
        "updated_at",
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    ),
    Index("idx_users_email", "email"),
)
