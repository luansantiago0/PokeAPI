const express = require('express'); 
const axios = require('axios'); 
const mysql = require('mysql2/promise');

const app = express(); 
const PORT = 3000; 

// Configuração do banco de dados 
const dbConfig = {

    host: 'localhost', 
    user: 'gustavo', 
    password: 'tecnologia', 
    database: 'pokemon_api',

};

// Função para concluir o poder do Pokémon 
const calcularPoder = (pokemon) => {

    const {abilities, base_experience } = pokemon; 
    const poder = Math.log(abilities.length * abilities.reduce((acc, ability) => acc + ability.slot, 0) * base_experience);

    return poder;
}

// Rota para capturar um Pokémon 
app.get('/capturar', async (req, res) => {

    try {

        // Gerar um ID aleatório entre 1 e 100 
        const pokemonId = Math.floor(Math.random() * 100) + 1;

        // Consultar a PokeAPI para obter os dados do Pokémon 
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const pokemonData = response.data; 

        // Conectar ao banco de dados 
        const connection = await mysql.createConnection(dbConfig); 

        // Verificar se o Pokémon já existe na Pokedex 
        const [rows] = await connection.execute('SELECT * FROM captured_pokemon WHERE id = ?', [pokemonData.id]); 

        if (rows.length === 0) {

            // Salvar os dados do Pokemon no banco de dados
            const poder = Math.floor(Math.random() * 100) + 1; 

            await connection.execute(

                'INSERT INTO captured_pokemon (id, pokemon_name, base_experience, ability, power) VALUES (?, ?, ?, ?, ?)',
                [pokemonData.id, pokemonData.name, pokemonData.base_experience, JSON.stringify(pokemonData.abilities[0].ability.name), poder]
            );

            res.json({message: `Pokemon capturado: ${pokemonData.name}, a experiência do pokemon é: ${pokemonData.base_experience}`}); 

        } else {

            res.json({message: 'Pokémon já está na Pokédex.'}); 
        }

        // Fechar a conexão com o banco de dados
        connection.end(); 

    } catch (error) {

        console.error(error); 
        res.status(500).json({error: 'Erro ao capturar o Pokémon.'}); 
    }
});

// Rota para capturar um Pokémon especifico por ID 
app.get('/capturar/:id', async (req, res) => {

    try {

        const pokemonId = req.params.id; 

        // Consultar a PokeAPI para obter os dados do Pokémon específico
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const pokemonData = response.data;

        // Conectar ao banco de dados 
        const connection = await mysql.createConnection(dbConfig); 


        // Verificar se o Pokémon já existe na Pokedex 
       const [rows] = await connection.execute('SELECT * FROM captured_pokemon WHERE id = ?', [pokemonData.id]); 

        if(rows.length === 0) {

            // Salvar os dados do Pokémon no banco de dados
            const poder = Math.floor(Math.random() * 100) + 1; 
            await connection.execute(

                'INSERT INTO captured_pokemon (id, pokemon_name, base_experience, ability, power) VALUES (?, ?, ?, ?, ?)',
                [pokemonData.id, pokemonData.name, pokemonData.base_experience, JSON.stringify(pokemonData.abilities[0].ability.name), poder]
            );

            res.json({message: `Pokemon capturado: ${pokemonData.name}, a experiência do pokemon é: ${pokemonData.base_experience}`}); 

        } else {

            res.json({message: 'Pokémon já está na Pokédex.'});
        }
        

        // Fechar a conexão com o banco de dados
        connection.end(); 

    } catch (error) {

        console.error(error); 
        res.status(500).json({error: 'Erro ao capturar o Pokémon.'});
    } 
});

// Rota para batalhar com um Pokemon específico por ID
app.get('/batalhar/:id', async (req, res) => {

    try {

        const pokemonId = req.params.id; 

        // Consultar a PokeAPI para obter os dados do Pokémon para a batalha
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`); 
        const pokemonData = response.data;

        // Conectar ao banco de dados
        const connection = await mysql.createConnection(dbConfig); 

        // Gerar um ID aleatório para o oponente
        const oponenteId = Math.floor(Math.random() * 100) + 1;

        // Consultar a PokeAPI para obter os dados do Pokémon oponente 
        const oponenteResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${oponenteId}`);
        const oponenteData = oponenteResponse.data;

        // Calcular o poder dos Pokémon 
        const poderPokemon = calcularPoder(pokemonData); 
        const poderOponente = calcularPoder(oponenteData);

        // Salvar os dados do Pokemon no banco de dados
        const poder = Math.floor(Math.random() * 100) + 1; 

        // Salvar os dados dos Pokémon no banco de dados
        await connection.execute(
            'INSERT INTO captured_pokemon (id, pokemon_name, base_experience, ability, power) VALUES (?, ?, ?, ?, ?)',
            [pokemonData.id, pokemonData.name, pokemonData.base_experience, pokemonData.abilities[0].ability.name, poder]
        );
        
        res.json({ message: 'Batalha realizada com sucesso!', poderPokemon, poderOponente });

        // Fechar a conexão com o banco de dados
        connection.end();

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Erro ao realizar a batalha.' });
    }
});

// Rota para obter a Pokedex completa
app.get('/pokedex', async (req, res) => {

    try {

        // Conectar ao banco de dados
        const connection = await mysql.createConnection(dbConfig);

        // Consultar todos os Pokémon na Pokedex
        const [rows] = await connection.execute('SELECT * FROM captured_pokemon'); 

        res.json(rows);

        // Fechar a conexão com o banco de dados
        connection.end(); 

    } catch (error) {

        console.error(error); 
        res.status(500).json({error: 'Erro ao obter a Pokedex'}); 
    }
})

// Rota para obter um Pokémon por ID
app.get('/pokedex/:id', async (req, res) => {

    try {

        const pokemonId = req.params.id; 

        // Conectar ao banco de dados 
        const connection = await mysql.createConnection(dbConfig);

        // Consultar o Pokémon na Pokedex pelo ID 
        const [rows] = await connection.execute('SELECT * FROM captured_pokemon WHERE id = ?', [pokemonId]);

        if(rows.length > 0) {

            res.json(rows[0]); 

        } else {

            res.status(404).json({message: 'Pokémon não encontrado na Pókedex. '});
        }

        // Fechar a conexão com o banco de dados
        connection.end();

    } catch (error) {

        console.error(error); 
        res.status(500).json({error: 'Erro ao obter o Pokémon'});
    }
});

// Iniciar o servidor 
app.listen(PORT, () => {

    console.log(`Servidor rodando na porta ${PORT}`);
})