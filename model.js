const mongoose = require("mongoose");

mongoose.connect('mongodb://th_m:password@ds121238.mlab.com:21238/thoms_friends');

var sortAlphabetically = function (items){
  console.log("sorting");
}
var friendSchema = new mongoose.Schema({
  name: String,
  feature: String
})
friendSchema.method.foodAmount = function (isOnDiet){
  if(isOnDiet || this.age < 2){
    return "1 cup";
  }else{
    return "2 cups";
  }
}

friendSchema.statics.howManyFriends = function(){
  return this.count();
}
var Friend = mongoose.model('Friend', friendSchema);

module.exports = {
  Friend,
  sortAlphabetically,
}