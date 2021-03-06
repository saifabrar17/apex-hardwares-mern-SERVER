
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}


async function run() {
  try {
    await client.connect();

    //database collections
    const productCollection = client.db('apex_hardwares').collection('products');
    const orderCollection = client.db('apex_hardwares').collection('orders');
    const userCollection = client.db('apex_hardwares').collection('users');
    const reviewCollection = client.db('apex_hardwares').collection('reviews');

    //user collection api START

    //admin role

    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === 'admin';
      res.send({ admin: isAdmin })
    })

    app.put('/userx/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({ email: requester });
      if (requesterAccount.role === 'admin') {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: 'admin' },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
      else {
        res.status(403).send({ message: 'forbidden' });
      }

    })

    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);

      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ result, token });
    })

    //get all users
    app.get('/user', async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    //user collection api END


    //get all products
    app.get('/product',  async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    //get by id
    app.get('/product/:id',  async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    //ADD NEW PRODUCT
    app.post('/product',  async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    //add new review
    app.post('/reviews',  async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

      //get all reviews
      app.get('/reviews',  async (req, res) => {
        const query = {};
        const cursor = reviewCollection.find(query);
        const reviews = await cursor.toArray();
        res.send(reviews);
      });

    //DELETE AN EXISTING PRODUCT

    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    })

    //post orders to database
    app.post('/order',  async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    })

    //get all orders
    app.get('/orders', verifyJWT, async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    //get specific one order details by id
    app.get('/orders/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await orderCollection.findOne(query);
      res.send(order);
    })

    app.get('/order-by/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
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