CREATE database pokemon_api;

USE pokemon_api;

CREATE TABLE IF NOT EXISTS captured_pokemon(

	id INT AUTO_INCREMENT PRIMARY KEY, 
    pokemon_name VARCHAR(255) NOT NULL,
    trainer_name VARCHAR(255) NOT NULL,
    capture_date DATE NOT NULL, 
    level INT, 
    UNIQUE (pokemon_name, trainer_name)
);

CREATE TABLE IF NOT EXISTS battle (
	
    id INT AUTO_INCREMENT PRIMARY KEY, 
    trainer1_name VARCHAR(255) NOT NULL, 
    trainer2_name VARCHAR(255) NOT NULL, 
    winner VARCHAR(255), 
    battle_date DATETIME NOT NULL
);