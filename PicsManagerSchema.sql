DROP DATABASE IF EXISTS pictsManager;
CREATE DATABASE IF NOT EXISTS pictsManager;
USE pictsManager;

CREATE TABLE User(
    id INT not null AUTO_INCREMENT,
    name VARCHAR(20) not null,
    password VARCHAR(20) not null,
    created_at DATETIME not null,
    PRIMARY KEY(id)
);
CREATE TABLE Tag(
    id INT not null AUTO_INCREMENT,
    name VARCHAR(10) not null,
    PRIMARY KEY (id)
);
CREATE TABLE Album(
    id INT not null AUTO_INCREMENT,
    owner int not null,
    name VARCHAR(20) not null,
    created_at DATETIME not null,
    updated_at DATETIME not null,
    PRIMARY KEY (id),
    FOREIGN KEY (owner) references User(id)
);

CREATE TABLE Image(
    id INT not null AUTO_INCREMENT,
    path TEXT not null,
    album INT not null,
    created_at DATETIME not null,
    updated_at DATETIME not null,
    PRIMARY KEY (id),
    FOREIGN KEY (album) references Album (id)
);
CREATE TABLE Tag_Image(
    image INT not null ,
    tag INT not null,
    FOREIGN KEY (image) references Image(id),
    FOREIGN KEY (tag) references Tag(id)
);
CREATE TABLE Album_Permission(
    album INT not null,
    user INT not null,
    access VARCHAR(10),
    FOREIGN KEY (album) references Album (id),
    FOREIGN KEY (user) references User (id)
);