CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- You can add an index for faster email lookups
CREATE INDEX idx_users_email ON users(email);