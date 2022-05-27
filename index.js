
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.acd3k.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();

    //database collections
    const productCollection = client.db('apex_hardwares').collection('products');
    const orderCollection = client.db('apex_hardwares').collection('orders');


    //get all products
    app.get('/product', async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    //get by id
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    //ADD NEW PRODUCT
    app.post('/product', async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    //DELETE AN EXISTING PRODUCT

    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    })

    //post orders to database
    app.post('/order', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    })

    //get all orders
    app.get('/orders', async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    //get specific one order details by id
    app.get('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await orderCollection.findOne(query);
      res.send(order);
    })

    app.get('/order-by/:email', async (req, res) => {
      const email = req.params.email;
      console.log('something', email);
      const query = { email: email };
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);

    })

  }

  finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello')
})

app.listen(port, () => {
  console.log(`Doctors App listening on port ${port}`)
})