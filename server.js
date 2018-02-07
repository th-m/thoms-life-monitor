const express = require('express');

const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const querystring = require(`querystring`);

const model = require('./model.js');

// use it before all route definitions

app.use(cors({origin: '*'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// let dataStore = [{'name':'Thom','feature':'I\'m my own best friend :)'},{'name':'Kierstin','feature':'Wife and other best friend.'}];

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/friends', (req, res) => handleGet(req, res));
app.post('/friends', (req, res) => handlePost(req, res));

//NOTE this handles all requsts that do not match `tools`
app.get(/^(?!friends).*$/ , (req, res) => handleError(req, res));
app.post(/^(?!friends).*$/ , (req, res) => handleError(req, res));

function handleError (req, res){
  res.set('Access-Control-Allow-Origin', '*');
  res.status(404).json({'error':'you hit a bad path'});
}

function handleGet (req, res){
  model.Friend.find().then(function(friends){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).json(friends);
  });
};

function handlePost (req, res){
  var friend = new model.Friend({
    name: req.body.name,
    feature: req.body.feature,
  });
  
  friend.save().then(function(f){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(201).json(f);
  });
};

app.listen(3000, () => console.log('Example app listening on port 3000!'));
