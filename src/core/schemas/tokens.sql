CREATE TABLE tokens (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    refresh_token TEXT NOT NULL
);