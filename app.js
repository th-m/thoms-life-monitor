function fetchData() {
  return fetch('http://localhost:3000/friends').then(function (res){
    return res.json();
  })
}

function jsonToQueryString(json) {
    return  Object.keys(json).map(function(key) {
            return encodeURIComponent(key) + '=' +
                encodeURIComponent(json[key]);
        }).join('&');
}

function saveFriend(name){
  const headers = {
    headers: {
      'Access-Control-Allow-Origin':'*',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: "POST",
    body:  jsonToQueryString(name)
  };
  return fetch('http://localhost:3000/friends',headers).then(function(res){
    return res.json();
  })
}

var app = new Vue({
  el: '#app',
  data: {
    friends: [],
    friend: {
      name: '',
      feature: ''
    },
    visible: true
  },
  methods : {
    clickMe: function(){
      saveFriend({name:this.friend.name,feature:this.friend.feature}).then(function(data){
        fetchData().then(function (data){
          app.friends = data;
        });
      });
    }
  },
  computed: {
    friendIsValid: function (){
      return this.friend.name.length == 0 || this.friend.feature.length == 0;
    }
  },
  created: function (){
    fetchData().then(function (data){
      app.friends = data;
    });
  }
});
