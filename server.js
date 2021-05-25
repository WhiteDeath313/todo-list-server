// server.js
// Added all import
const express = require('express')
const bodyParser= require('body-parser')
var cors = require('cors');
const app = express()
const MongoClient = require('mongodb').MongoClient
const { ObjectId } = require('bson')

// init connection with database
MongoClient.connect('mongodb+srv://root:toor@cluster0.7sq0l.mongodb.net/Cluster0?retryWrites=true&w=majority',  {
    useUnifiedTopology: true
})
.then(client => {
    console.log('Connected to Database')
    // connect to database cluster0
    const db = client.db('Cluster0')
    // load blogs data
    const usersCollection = db.collection('users')
    // load comments data
    const tasksCollection = db.collection('tasks')
    // module for better lisibility of form
    app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
    app.use(bodyParser.json())
    app.use(cors());
    
    // begin to listen (process.env.PORT is recquired to deploy on heroku because he choose on wich port is host the server)
    app.listen(process.env.PORT || 3000, function() {
        // display which port is used for the user
        if (process.env.PORT != undefined)
            console.log("listening on " + process.env.PORT);
        else
            console.log("listening on 3000");
    })

    // the register service
    app.post('/users/register', (req, res) => {
        usersCollection.findOne({"username" : req.body.username}).then(result => {
            if (result == null) {
                //create
                usersCollection.insertOne(req.body).then(result => {
                    res.status(200);
                    res.json(result);
                })
                .catch(error => {
                    res.status(500);
                    res.json(error);
                })
            }
            else {
                //return error
                res.status(500);
                res.json({"error": "user already exist"});
            }
        })
        .catch(error => {
            res.status(500);
            res.json(error);
        })
    })

    // the register service
    app.post('/users/login', (req, res) => {
        usersCollection.findOne({"username" : req.body.username, "password" : req.body.password}).then(result => {
            console.log(result);
            if (result == null) {
                //bad information
                res.status(500);
                res.json({"error": "bad login"});
            }
            else {
                //return error
                res.status(200);
                res.json(result);
            }
        })
        .catch(error => {
            res.status(500);
            res.json(error);
        })
    })

    app.get('/users', (req, res) => {
        usersCollection.find().toArray()
        .then(users => {
            res.status(200);
            res.json(users);
        })
        .catch(error => {
            console.error(error);
            res.status(500);
            res.json(error);
        })
    })

    app.get('/tasks', (req, res) => {
        if (req.query.state !== undefined) {
            tasksCollection.find({"state" : req.query.state}).toArray()
            .then(tasks => {
                res.status(200);
                res.json(tasks);
            })
            .catch(error => {
                console.error(error);
                res.status(500);
                res.json(error);
            })
        }
        else {
            tasksCollection.find().toArray()
            .then(tasks => {
                res.status(200);
                res.json(tasks);
            })
            .catch(error => {
                console.error(error);
                res.status(500);
                res.json(error);
            })
        }
    })

    // task creation
    app.post('/tasks', (req, res) => {
        tasksCollection.insertOne(req.body)
        .then(result => {
            res.status(200);
            res.json(result);
        })
        .catch(error => {
            res.status(500);
            res.json(error);
        })
    })

    app.put('/tasks', (req, res) => {
        tasksCollection.updateOne({"_id" : new ObjectId(req.body._id)}, 
        {$set: {"title" : req.body.title, "description" : req.body.description, "due_date" : req.body.due_date,
            "state" : req.body.state, "idUser" : req.body.idUser}})
        .then(result => {
            res.status(200);
            res.json(result);
        })
        .catch(error => {
            res.status(500);
            res.json(error);
        })
    })

    app.delete('/tasks', (req, res) => {
        tasksCollection.deleteOne({"_id" : new ObjectId(req.query._id)})
        .then(result => {
            res.status(200);
            res.json(result);
        })
        .catch(error => {
            res.status(500);
            res.json(error);
        })
    })

})
.catch(error => console.error(error))