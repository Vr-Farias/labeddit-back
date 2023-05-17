-- Active: 1683853889799@@127.0.0.1@3306
CREATE TABLE users (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT (DATETIME()) NOT NULL
);

INSERT INTO users (id, name, email, password, role)
VALUES
	("u001", "Igor", "igor@email.com", "igor123", "NORMAL"),
	("u002", "Hugo", "hugo@email.com", "hugo00", "NORMAL"),
	("u003", "Vanessa", "vanessa@email.com", "vanessa99", "ADMIN");

CREATE TABLE posts(
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    creator_id TEXT NOT NULL,
    content TEXT NOT NULL, 
    likes INT NOT NULL, 
    dislikes INT NOT NULL,
    comments INT NOT NULL,
    created_at TEXT DEFAULT (DATETIME()) NOT NULL,
    updated_at TEXT DEFAULT (DATETIME()) NOT NULL
);

INSERT INTO posts (id, creator_id, content, likes, dislikes, comments)
VALUES
("p001", "u003", "e como estamos hoje?", 5, 0, 2),
("p002", "u002", "hoje vamos de sushi?", 8, 0, 3);

CREATE TABLE comments (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    comments TEXT NOT NULL, 
    likes INT NOT NULL, 
    dislikes INT NOT NULL, 
    create_at TEXT DEFAULT (DATETIME()) NOT NULL
);

INSERT INTO comments (id, post_id, user_id, comments, likes, dislikes)
VALUES
("c001", "p002", "u003", "um peixe vai sempre bem", 4, 0);

SELECT * FROM posts;

SELECT * FROM users;

SELECT * FROM comments;

DROP TABLE users;