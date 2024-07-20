const postgres = require('postgres');
require('dotenv').config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

// Função para criar um novo usuário
async function createUser(username, password) {
  try {
    await sql`
      INSERT INTO users (username, password)
      VALUES (${username}, ${password})
    `;
    console.log('User created');
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

// Função para obter um usuário pelo nome
async function getUserByUsername(username) {
  try {
    const result = await sql`
      SELECT * FROM users
      WHERE username = ${username}
    `;
    return result[0]; // Retorna o primeiro usuário encontrado
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}

const { WebSocketServer } = require('ws');
const dotenv = require('dotenv');

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
  ws.on('error', console.error);

  ws.on('message', async (data) => {
    const message = data.toString();
    // Exemplo de comando simples: "create user:username:password"
    const [command, ...args] = message.split(':');
    
    if (command === 'create') {
      const [username, password] = args;
      await createUser(username, password);
      ws.send('User created');
    } else if (command === 'get') {
      const [username] = args;
      const user = await getUserByUsername(username);
      if (user) {
        ws.send(`User found: ${JSON.stringify(user)}`);
      } else {
        ws.send('User not found');
      }
    } else {
      ws.send('Unknown command');
    }
  });

  console.log('Client connected');
});
