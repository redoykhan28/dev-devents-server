const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        //get service by id

        app.get('/service/:id', async (req, res) => {

            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            res.send(result)
        })


        // get service data
        app.get('/service', async (req, res) => {

            //take limit for limited data
            const limit = parseInt(req.query.limit)

            const query = {}
            const cursor = serviceCollection.find(query)

            if (limit) {
                const result = await cursor.limit(limit).toArray()
                const sort = result.sort(
                    (p1, p2) => (p1.date < p2.date) ? 1 : (p1.date > p2.date) ? -1 : 0);
                res.send(sort)
            }
            else {
                const result = await cursor.toArray()
                res.send(result)
            }

        })

    }

    finally {

    }
}

run().catch(console.dir)



app.listen(port, () => {

    console.log(`Devents runs on port ${port}`)
})