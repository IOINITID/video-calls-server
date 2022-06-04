CREATE TABLE friends (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    friend_id uuid NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);