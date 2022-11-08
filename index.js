const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000

//middle ware
app.use(cors())
app.use(express.json())

//check the root server
app.get('/', (req, res) => {

    res.send('Devent server is running')
})

//database

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ytkvvxy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {

        //create db collections
        const serviceCollection = client.db('DeventDbUser').collection('services')

        // post services
        app.post('/service', async (req, res) => {

            const service = req.body
            const result = await serviceCollection.insertOne(service)
            res.send(result)

        })

        // get service data
        app.get('/service', async (req, res) => {

            const query = {}
            const cursor = serviceCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

    }

    finally {

    }
}

run().catch(console.dir)



app.listen(port, () => {

    console.log(`Devents runs on port ${port}`)
})