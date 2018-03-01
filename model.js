
const mongoose = require("mongoose");

mongoose.connect('mongodb://th_m:password@ds121238.mlab.com:21238/thoms_friends');

const logSchema = new mongoose.Schema({
  "date": {   // This is how we do validation with the mongoose library
    type: String,
    required: [true, "Each log entry must have a date."]
  },
  productivity: {
    type: Object
  },
  projects: {
    type: Object
  },
  notes:{
    type: String
  }
});

const Log = mongoose.model('Log', logSchema);

const sortLogs = function(data){
  console.log(data);
}


module.exports = {
  Log
}