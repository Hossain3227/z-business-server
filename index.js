const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');

//middleware 
const corOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://z-handicraft.web.app',
    
  ],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corOptions))
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.42osioc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



    const handyCollection = client.db('handicraftDB').collection('handyitems')

    app.get('/items', async (req, res) => {
      const result = await handyCollection.find().toArray()

      res.send(result);
    })
    

    //item details 

    app.get('/items/:id', async (req,res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await handyCollection.findOne(query)
      res.send(result);
    })


    //pagination 

    app.get('/all-vols', async (req, res) => {
      
      const size = parseInt(req.query.size)
      const page = parseInt(req.query.page) -1
      const filter = req.query.filter
      const search = req.query.search
      
      console.log(size,page);
      
      let query = {
        title: {$regex: search, $options: 'i'},
      }
      if(filter) query.category = filter

      const result = await handyCollection.find(query).skip(page*size).limit(size).toArray()


      res.send(result);
    })

    app.get('/vol-sum', async (req, res) => {
      const filter = req.query.filter
      const search = req.query.search
      // let query = {}
      // if(filter) query = {Category:filter}
      let query = {
        title: {$regex: search, $options: 'i'},
      }
      if(filter) query.Category = filter

      const sum = await handyCollection.countDocuments(query)

      

      res.send({sum});
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req,res) => {
    res.send('site is running')
})

app.listen(port, () => {
    console.log(`site is running on port ${port}`)
    
})