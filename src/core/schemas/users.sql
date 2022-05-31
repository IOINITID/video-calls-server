CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    default_color TEXT DEFAULT '' NOT NULL,
    description TEXT DEFAULT '' NOT NULL,
    color TEXT NOT NULL,
    status TEXT DEFAULT 'offline' NOT NULL,
    socket_id TEXT DEFAULT '' NOT NULL,
    image TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);