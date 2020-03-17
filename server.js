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
    const hotelNameQuery=req.query.name;
    //console.log(`query name: ${hotelNameQuery}`)
let query = `SELECT * FROM hotels ORDER BY name`;
if(hotelNameQuery){
   query=`SELECT * FROM hotels WHERE name like '%${hotelNameQuery}%' ORDER BY name`}
   pool.query(query)
   .then(result=>res.json(result.rows))
   .catch(e=> console.error(e));

    });

    app.get("/hotels/:hotelId", function(req, res) {
        const hotelId = req.params.hotelId;
    
        pool.query("SELECT * FROM hotels WHERE id=$1", [hotelId])
            .then(result => res.json(result.rows))
            .catch(e => console.error(e));
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
});



app.get("/customers", function(req, res) {
    pool.query("SELECT * FROM customers ORDER BY name")
        .then(result => res.json(result.rows))
        .catch(e => console.error(e));
});

app.get("/customers/:customerId", function(req, res) {
    const customerId = req.params.customerId;

    pool.query("SELECT * FROM customers WHERE id=$1", [customerId])
        .then(result => res.json(result.rows))
        .catch(e => console.error(e));
});

app.get("/customers/:customerId/bookings", function(req,res){
const customerId=req.params.customerId
const query='select bookings.checkin_date, bookings.nights, hotels.name, hotels.postcode from bookings '+
'join hotels on hotels.id=bookings.hotel_id where customer_id=1';

pool.query(query, [customerId])
.then(result => res.json(result.rows))
.catch(e => console.error(e));
});

app.put("/customers/:customerId", function(req,res){
    const customerId=req.params.customerId;
    const newEmail=req.body.email;
    if(!newEmail || newEmail ===""){
        return res.status(400).send('Email is required')
    }
    pool.query('UPDATE customers SET email=$1 WHERE id=$2', [newEmail,customerId])
    .then(()=>res.send('Customer updated'))
    .catch(e=>console.error(e));
    }
  );

app.delete("/customers/:customerId", function(req, res) {
    const customerId = req.params.customerId;

    pool.query("DELETE FROM bookings WHERE customer_id=$1", [customerId])
        .then(() => {
            pool.query("DELETE FROM customers WHERE id=$1", [customerId])
                .then(() => res.send(`Customer ${customerId} deleted!`))
                .catch(e => console.error(e));;
        })
        .catch(e => console.error(e));
});

app.delete("/hotels/:hotelId", function(req,res){
    const hotelId=req.params.hotelId;

});
