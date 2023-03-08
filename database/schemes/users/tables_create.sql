CREATE TABLE users.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(25) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(75) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP,
    salt VARCHAR(32) NOT NULL,
    cluster INT DEFAULT 0
);

CREATE TABLE users.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE users.users_to_roles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users.users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (role_id) REFERENCES users.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE users.ratings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  rating INT,
  type VARCHAR(20),
  visited BOOLEAN,
  detail_level INT,
  date TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users.users(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE users.chapters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    chapter_order INT NOT NULL
);

CREATE TABLE users.exercises (
    id SERIAL PRIMARY KEY,
	chapter_id INT NOT NULL,
    name VARCHAR(255),
    question VARCHAR(2000),
    schema VARCHAR(255),
    attempts INT DEFAULT 0,
    exercise_order INT NOT NULL,
	FOREIGN KEY (chapter_id) REFERENCES users.chapters(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE users.answers (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    query VARCHAR(1000),
    solution VARCHAR(10),
    execution_time DECIMAL,
    similarity DECIMAL,
    date TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users.users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (exercise_id) REFERENCES users.exercises(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE users.solutions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    query VARCHAR(1000),
    execution_time DECIMAL,
    abstract_syntax_tree VARCHAR(10000),
    FOREIGN KEY (user_id) REFERENCES users.users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (exercise_id) REFERENCES users.exercises(id) ON UPDATE CASCADE ON DELETE RESTRICT
);