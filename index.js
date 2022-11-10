const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
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

//varify jwt
function jwtVarify(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {

        res.status(401).send({ message: 'Unauthorized access!' })
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {

        if (err) {

            return res.status(403).send({ message: 'Forbidden Access' })
        }

        req.decoded = decoded
        next()

    })
}

//database

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ytkvvxy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {

        //create db collections for services
        const serviceCollection = client.db('DeventDbUser').collection('services')

        //create db collection for review
        const reviewCollection = client.db('DeventDbUser').collection('reviews')


        //post for jwt token
        app.post('/jwt', (req, res) => {

            const user = req.body
            // console.log(user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })
            res.send({ token })


        })

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

        // get review by service id 
        app.get('/review/servicereview', async (req, res) => {

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

        })

        // //search review by id
        app.get('/review/dynamic/:id', async (req, res) => {

            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.findOne(query)
            res.send(result)

        })

        // //get review by email
        app.get('/review/mail', jwtVarify, async (req, res) => {
            const decoded = req.decoded
            console.log('inside review', decoded)

            if (decoded.email !== req.query.email) {

                res.status(403).send({ message: 'Forbidden Access' })
            }

            let query = {}
            if (req.query.email) {
                query = { email: req.query.email }
            }
            const cursor = reviewCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        //delete a review
        app.delete('/review/delete/:id', async (req, res) => {

            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })


        //update review
        app.put('/update/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const reviews = req.body;
            // console.log(reviews)
            const option = { upsert: true }
            const updateReview = {
                $set: {

                    review: reviews.text
                }
            }

            const result = await reviewCollection.updateOne(query, updateReview, option)
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