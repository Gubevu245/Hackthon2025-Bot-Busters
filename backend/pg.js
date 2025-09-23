require('dotenv').config();
const express = require ("express");
const {Client} = require("pg");
const app = express();



const client = new Client({
  host: 'natesa-botbusters-db.c1w04mc02xqr.eu-north-1.rds.amazonaws.com', // RDS endpoint
  port: 5432, // default PostgreSQL port
  user: 'postgres',
  password: 'botbusters14',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false // optional, depending on your RDS SSL setup
  }
});

client.connect()
  .then(() => console.log('Connected to AWS RDS PostgreSQL!'))
  .catch(err => console.error('Connection error', err.stack));
 
app.get('/users', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users'); // Replace 'users' with your table name
    res.json(result.rows);
        console.log("data fetched successfully");

  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

app.listen(3000, () => {
    console.log("port connected at 3000")
});



    module.exports={client}