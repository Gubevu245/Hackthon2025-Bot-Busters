require('dotenv').config();
const express = require("express");
const app = express();


app.get('/users', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users'); // Replace 'users' with your table name
    res.json(result.rows);
        console.log("data fetched ");

  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

