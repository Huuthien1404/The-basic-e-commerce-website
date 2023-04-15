const {Client} = require('pg');
const client = new Client({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: '123',
    database: 'dbQLBH1'
});
module.exports = client;