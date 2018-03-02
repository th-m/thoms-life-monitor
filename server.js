const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const fetch = require('node-fetch');
const querystring = require(`querystring`);

const app = express();

const model = require('./model.js');

function validateDate(strDate) {
  var t = /^\d{4}-\d{2}-\d{2}$/;
  strDate.replace(t, function($, _, y, m, d, y2) {
    $ = new Date(y = y || y2, m, d);
    t = $.getFullYear() != y || $.getMonth() != m || $.getDate() != d;
  });
  return !t;
}

app.use(cors({origin: '*'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => handleRoot(req, res));
app.get('/logs', (req, res) => handleGet(req, res));
app.get('/logs/:id', (req, res) => handleGetId(req, res));
app.post('/logs', (req, res) => handlePost(req, res));
app.put('/logs/:id', (req, res) => handlePut(req, res));

app.get(/^(?!logs).*$/ , (req, res) => handleError(req, res));
app.post(/^(?!logs).*$/ , (req, res) => handleError(req, res));
app.put(/^(?!logs).*$/ , (req, res) => handleError(req, res));

const day = ( x => {
  let date = (t => new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0))(new Date());
  return new Date(date.setDate(date.getDate() + x));
});
const formatDate =  (d => d.getUTCFullYear()+'-'+(d.getUTCMonth() + 1)+'-'+d.getUTCDate());

let logBuilder = {};

const getProjects = function (){
  // NOTE wakatime
  // https://wakatime.com/developers#authentication
  // https://wakatime.com/api/v1/users/current/durations?date=2018-02-19&api_key=fb8378c8-4829-42b5-b3c9-2988215542b2
  // https://wakatime.com/api/v1/users/current/summaries?start=2018-02-18&end=2018-02-19&api_key=fb8378c8-4829-42b5-b3c9-2988215542b2
  return fetch('https://wakatime.com/api/v1/users/current/summaries?start='+formatDate(day(-1))+'&end='+formatDate(day(-1))+'&api_key=fb8378c8-4829-42b5-b3c9-2988215542b2')
    .then(res => res.json())
    .then(json => logBuilder.projects = json);
}();

const getProductivity = function (){
  // NOTE rescuetime
  // https://www.rescuetime.com/anapi/setup/documentation
  // https://www.rescuetime.com/anapi/daily_summary_feed?key=B63jpnvszaSb2AF0ASQTUI3zXepHMJgZ4luGf7dU&format=json
  return fetch('https://www.rescuetime.com/anapi/daily_summary_feed?key=B63jpnvszaSb2AF0ASQTUI3zXepHMJgZ4luGf7dU&format=json')
    .then(res =>  res.json())
    .then(json => logBuilder.productivity = json[0]);
}();


// NOTE ROUTES 
// POST
function handlePost(req, res){
  console.log('date:', formatDate(day(-1)));
  return Promise.all([getProjects, getProductivity]).then(function(values) {
    let log ={
      date: formatDate(day(-1)),
      productivity: logBuilder.productivity,
      projects: logBuilder.projects,
    };
    return model.Log.update({date:{ $eq: log.date }}, log, {upsert: true}).then(function(log){
      res.set('Access-Control-Allow-Origin', '*');
      res.status(201).json({'success':'updated logs', 'log':log});
    }, function(err){
      res.set('Access-Control-Allow-Origin', '*');
      res.status(500).json(err);
    });
  });
}

// PUT
function handlePut (req, res){
    model.Log.update({_id: req.params.id}, req.body, {upsert: true}).then(function(log){
      res.status(201).json(log);
    }, function(err){
      res.status(404).json(err);
    });
};

// GET
function handleGetId(req, res){
  model.Log.findOne({_id: req.params.id}).then(function(log){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).json(log);
  });
};

function handleGet (req, res){
  if(req.query.date){
    model.Log.findOne({date:{ $eq: req.query.date }}).then(function(log){
      res.set('Access-Control-Allow-Origin', '*');
      res.status(200).json(log);
    })
  }else{
    model.Log.find({date:{ $gt: formatDate(day(-7)) }}).then(function(log){
      res.set('Access-Control-Allow-Origin', '*');
      res.status(200).json(log);
    })
  }
};

function handleRoot(req, res){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).json({'success':'Connected to logs resourceful api','resources':'logs','methods':['get','post','put']});
}

// BAD Path Hit
function handleError (req, res){
  res.set('Access-Control-Allow-Origin', '*');
  res.status(404).json({'error':'you hit a bad path'});
}


app.use("/public", express.static(__dirname + '/public'));
// app.use(Express.static(path.join(__dirname, '../public')));

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
// app.get('/', function (request, response){
//     response.sendFile(path.resolve(__dirname, '../public', 'index.html'));
// });
// app.use(express.static('public'));
// app.set('port', process.env.PORT || 8080);
app.listen(process.env.PORT || 8080, () => console.log('Example app listening on port 3000!'));