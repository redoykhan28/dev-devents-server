const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

//middle ware
app.use(cors())
app.use(express.json())

//check the root server
app.get('/', (res, req) => {

    res.send('Devent server is running')
})


app.listen(port, () => {

    console.log(`DEvents runs on port ${port}`)
})