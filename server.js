const express = require("express");
const app = express();
const secrets = require('./secrets');

app.listen(3000, function() {
    console.log("Server is listening on port 3000. Ready to accept requests!");
});

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cyf_hotels',
    password: secrets.dbPassword,
    port: 5432
});

app.get("/hotels", function(req, res) {
    pool.query('SELECT * FROM hotels', (error, result) => {
        res.json(result.rows);
    });
});