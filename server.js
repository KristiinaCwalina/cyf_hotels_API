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
app.get("/customers", function(req, res) {
    pool.query('SELECT * FROM customers', (error, result) => {
        res.json(result.rows);
    });
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.post("/hotels", function(req, res) {
    const newHotelName = req.body.name;
    const newHotelRooms = req.body.rooms;
    const newHotelPostcode = req.body.postcode;

    if(!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
        return res.status(400).send("The number of rooms should be a positive integer.");
    }

    pool.query("SELECT * FROM hotels WHERE name=$1", [newHotelName])
        .then(result => {
            if(result.rows.length > 0) {
                return res.status(400).send('An hotel with the same name already exists!');
            } else {
                const query = "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
                pool.query(query, [newHotelName, newHotelRooms, newHotelPostcode])
                    .then(() => res.send("Hotel created!"))
                    .catch(e => console.error(e));
            }
        });
});

app.post("/customers", function(req, res) {
    const newCustomerName = req.body.name;
    const newCustomerAddress = req.body.address;
    const newCustomerEmail = req.body.email;
    const newCustomerCity=req.body.city;
    const newCustomerPostcode=req.body.postcode;
    const newCustomerCountry=req.body.country;

    const query='INSERT INTO customers (name,email,address,city,postcode,country) VALUES ($1,$2,$3,$4,$5,$6)'
    
    const params=[newCustomerName, newCustomerEmail, newCustomerAddress,newCustomerCity,newCustomerPostcode,newCustomerCountry];

    pool.query(query,params)
    .then(() => res.send('Customer Created!'))
    .catch(e=>res.status(500).send(e))
})
