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

        //create db collections for services
        const serviceCollection = client.db('DeventDbUser').collection('services')

        //create db collection for review
        const reviewCollection = client.db('DeventDbUser').collection('reviews')






        // post services
        app.post('/service', async (req, res) => {

            const service = req.body
            const result = await serviceCollection.insertOne(service)
            res.send(result)

        })

        //post for review
        app.post('/review', async (req, res) => {

            const review = req.body
            const result = await reviewCollection.insertOne(review)
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
                const result = await cursor.sort({ date: -1 }).limit(limit).toArray()
                res.send(result)
            }
            else {
                const result = await cursor.toArray()
                res.send(result)
            }


        })




        // get review by email or by service id 
        app.get('/review', async (req, res) => {

            if (req.query.email) {
                let query = {}
                if (req.query.email) {
                    query = { email: req.query.email }
                }
                const cursor = reviewCollection.find(query)
                const result = await cursor.toArray()
                res.send(result)
            }

            else {

                const page = parseInt(req.query.page)
                const perPage = parseInt(req.query.perPage)
                let query = {}
                if (req.query.serviceId) {
                    query = { serviceId: req.query.serviceId }
                }
                const cursor = reviewCollection.find(query)
                const result = await cursor.sort({ date: -1 }).skip(page * perPage).limit(perPage).toArray()
                const count = await reviewCollection.estimatedDocumentCount()
                res.send({ count, result })

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