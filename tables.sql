CREATE TABLE Users (
id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(40) NOT NULL UNIQUE,
password VARCHAR(164) NOT NULL,
first VARCHAR(40),
last VARCHAR(40),
karma INT UNSIGNED,
created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
lastlogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Bathrooms (
id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
description VARCHAR(400),
state VARCHAR(50),
city VARCHAR(80),
zip VARCHAR(20),
coords VARCHAR(100) NOT NULL,
uses INT UNSIGNED,
striked BIT,
created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
lastuse TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Reviews (
id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
uid INT UNSIGNED,
bid INT UNSIGNED,
comment VARCHAR(280),
rating INT UNSIGNED,
created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Data (
id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
dau INT UNSIGNED, /* nLogins (we can make this more advanced later) */
reviews INT UNSIGNED,
bathrooms INT UNSIGNED,
day TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
