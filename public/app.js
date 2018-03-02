const day = ( x => {
  let date = (t => new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0))(new Date());
  return new Date(date.setDate(date.getDate() + x));
});
const padDate = (x => (x.toString().length <= 1? '0'+ x : x));
const format = (x => formatDate(new Date(x)));
const formatDate =  (fd => padDate(fd.getUTCMonth() + 1)+'/'+padDate(fd.getUTCDate())+'/'+fd.getUTCFullYear()+' 00:00');
const serverUrl = ((window.location.href.indexOf("thoms-life-monitor") > -1) ? 'http://localhost:8080/logs' : 'https://thoms-life-monitor.herokuapp.com/logs/');

var c, ctx, weeklyChart; 
var c2, ctx2, dailyChart; 
let chartConfig = {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      type: 'bar',
      label: 'Productivity',
      backgroundColor: 'rgba(255, 0, 0, .5)',
      borderColor: 'rgba(255, 0, 0, .5)',
      data: [],
    }, {
      type: 'line',
      label: 'Code Written',
      backgroundColor: 'rgba(0, 255, 0, .5)',
      borderColor: 'rgba(0, 255, 0, .5)',
      fill: false,
      data: [],
    }, ]
  },
  options: {
            title: {
                text:"Productivity Graph"
            },
    scales: {
      xAxes: [{
        type: "time",
        display: true,
        time: {
          format: 'MM/DD/YYYY HH:mm',
          round: 'day',
          unit: 'day'
        }
      }],
    },
  }
};

const radarOptions = {
			maintainAspectRatio: true,
			spanGaps: false,
			elements: {
				line: {
					tension: 0.000001
				}
			},
			plugins: {
				filler: {
					propagate: false
				},
				samples_filler_analyser: {
					target: 'chart-analyser'
				}
			}
		};

let radarData =  {
    labels: ['Running', 'Swimming', 'Eating', 'Cycling'],
    datasets: [{
        data: [20, 10, 4, 2]
    }]
  }
let radarConfig = {
    type: 'radar',
    data: radarData,
    options: radarOptions
}

function fetchData(ext = '') {
  return fetch(serverUrl+ext).then(function (res){
    return res.json();
  })
}

function dateToISO(date) {
  var msec = Date.parse(date);
  return new Date(msec).toISOString().substring(0, 10);
}

function putRequest(data, callback) {
  return fetch(serverUrl+'/'+data._id, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(callback);
}

function postRequest(callback) {
  return fetch(serverUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(callback);
}

// NOTE todo add ability to add notes to days

function updateLog(logData){
  const headers = {
    headers: {
      'Access-Control-Allow-Origin':'*',
      'Content-Type': 'application/json'
    },
    method: "PUT",
    body:  JSON.stringify(logData)
  };
  return fetch('http://localhost:3000/logs',headers).then(function(res){
    return res.json();
  });
}

function runSprite(){
  // NOTE https://www.gameart2d.com/the-robot---free-sprites.html
  // NOTE Melee(Good) 8, Run(Normal) 8, DEAD(Bad) 10
  let path = 'imgs/';
  let i = app.sprite.index;
  switch (app.sprite.status) {
    case 'good':
      path += 'melee/';
      i = (i >= 26 ? 1 : ++i);
      break;
    case 'avg':
      path += 'run/';
      i = (i >= 8 ? 1 : ++i);
      break;
    case 'bad':
      path += 'dead/';
      i = (i >= 10 ? 1 : ++i);
      break;  
  }
  path += i;
  app.sprite.index = i;
  document.querySelector('#sprite').src = path + ".png";
}


 
Vue.component("weeklychart", {
  template: '<canvas id="weeklycanvas" width="800px" height="800px"></canvas>',
  methods: {
    draw: function(ctx) {
      var weeklyChart = new Chart(ctx, chartConfig);
    },
    update: function(){
      console.log('updated');
      weeklyChart.update();
    }
  },
  mounted: function() {
    c = document.getElementById("weeklycanvas");
    ctx = c.getContext("2d");
    ctx.translate(0.5, 0.5);
    // ctx.imageSmoothingEnabled = false;
    this.draw(ctx);
  }
});

Vue.component("dailychart", {
  template: '<div class="fifty"><canvas id="dailycanvas" width="800px" height="800px"></canvas></div>',
  methods: {
    draw: function(ctx2) {
      var dailyChart = new Chart(ctx2, radarConfig);
    },
    update: function(){
      console.log('updated');
      dailyChart.update();
    }
  },
  mounted: function() {
    c2 = document.getElementById("dailycanvas");
    ctx2 = c2.getContext("2d");
    ctx2.translate(0.5, 0.5);
    this.draw(ctx2);
  }
});
// var weeklyChart = Vue.component('weeklychart');

var app = new Vue({
  el: '#app',
  // components: { 'weeklyChart': weeklyChart },
  data: {
    viewDate:  day(-1).toISOString().substring(0, 10),
    sprite: {
      status: 'good',
      index: 1
    },
    logs: [],
    log:{},
    logNote: "",
    chart: chartConfig,
    line: '',
    hasLogData: true,
    dayProductivity: {},
    radar: radarConfig,
    productivityAverages: {},
    productivityMinutesGoal: 560,
    projectsMinutesGoal: 300,
    health_bar: 100,
    visible: true
  },
  methods : {
    updateChart: function(data, build = false){
      this.logs = data;
      this.log = data[0];
      this.dayProductivity = this.log.productivity;
      // const ctx = document.querySelector("canvas").getContext("2d");
      const productivityAverages = this.logs
                                  .map(x => x.productivity)
                                  .reduce((a, b, index, self) => {
                                     const keys = Object.keys(a)
                                     let c = {} 
                                     keys.map((key) => {
                                      c[key] = a[key] + b[key]
                                      if (index + 1 === self.length) {
                                        c[key] = c[key] / self.length
                                      }
                                     })
                                     return c
                                  });
      this.productivityAverages = productivityAverages;                            
      const projectsAverages = this.logs
                                  .map(x => x.projects.data[0].grand_total)
                                  .reduce((a, b, index, self) => {
                                     const keys = Object.keys(a)
                                     let c = {} 
                                     keys.map((key) => {
                                      c[key] = a[key] + b[key]
                                      if (index + 1 === self.length) {
                                        c[key] = c[key] / self.length
                                      }
                                     })
                                     return c
                                  });

      // above 90% equals + to health_bar;
      // below 90% equals - to health_bar; 
      // below 50% should equal death;
      this.health_bar += ((projectsAverages.hours * 60 + projectsAverages.minutes) / this.projectsMinutesGoal ) - 90;
      this.health_bar += ((productivityAverages.software_development_hours * 60) / this.productivityMinutesGoal ) - 90;
      this.health_bar = Math.round(this.health_bar);
      document.querySelector('.health_bar .life').setAttribute('style','width:'+ (100 + this.health_bar)+'%;');
      const loggedData = this.logs
                        .map(x => {return {
                          date:x.date, 
                          projectTimeMinutes:((x.projects.data[0].grand_total.hours * 60) + x.projects.data[0].grand_total.minutes - (projectsAverages.hours * 60 + projectsAverages.minutes)), 
                          productivitySoftwareMinutes: (x.productivity.software_development_hours * 60 - (productivityAverages.software_development_hours * 60))}
                        })
                        .sort((a,b) => new Date(b.date) - new Date(a.date));

      loggedData.forEach(x => {
        this.chart.data.labels.push(format(x.date));
        this.chart.data.datasets[0].data.push(x.productivitySoftwareMinutes);
        this.chart.data.datasets[1].data.push(x.projectTimeMinutes);
      
      });
      
      chartConfig = this.chart;
      weeklyChart = new Chart(ctx, this.chart)
    },
    updateRadar(){
      console.log('this fired',app.dayProductivity);
      this.radar.data =  {
          labels: ['Code', 'Studies', 'Design', 'Business', 'Communications', 'Entertainment'],
          datasets: [{
              data:[app.dayProductivity.software_development_hours, app.dayProductivity.reference_and_learning_hours, app.dayProductivity.design_and_composition_hours, app.dayProductivity.business_hours, app.dayProductivity.communication_and_scheduling_hours, app.dayProductivity.entertainment_hours]
          }]
        }
    dailyChart = new Chart(ctx2, this.radar)
    },
    changedDate(e){
      console.log('changedDate');
      if(e){
        e.target.setAttribute('disabled', "");
      }
      prepDate = this.viewDate.split("-").map(x=>parseInt(x)).join("-");
      fetchData('?date='+prepDate).then(function(data){
        if(data){
          app.log = data;
          app.hasLogData = true;
          if(data.notes){
            app.logNote = data.notes;
            console.log('data notes', data.notes);
          }else{
            console.log('no notes',data.notes);
            app.logNote = "";
          }
          console.log('fetch data',data);
          app.dayProductivity = data.productivity;
          app.dayProductivity.software_development_hours = data.productivity.software_development_hours;
          app.dayProductivity.reference_and_learning_hours  = data.productivity.reference_and_learning_hours;
          app.dayProductivity.design_and_composition_hours  = data.productivity.design_and_composition_hours;
          app.dayProductivity.business_hours = data.productivity.business_hours;
          app.dayProductivity.communication_and_scheduling_hours = data.productivity.communication_and_scheduling_hours;
          app.dayProductivity.entertainment_hours = data.productivity.entertainment_hours;
          app.updateRadar();
        }else{
          console.log('this data');
          // app.dayProductivity = {
            app.dayProductivity.software_development_hours = 0;
            app.dayProductivity.reference_and_learning_hours  = 0;
            app.dayProductivity.design_and_composition_hours  = 0;
            app.dayProductivity.business_hours = 0;
            app.dayProductivity.communication_and_scheduling_hours = 0;
            app.dayProductivity.entertainment_hours = 0;
          // }
          app.logNote = "";
          app.hasLogData = false;
          app.updateRadar();
        }
        if(e){
          e.target.removeAttribute('disabled');
        }
      })
    },
    saveNote(){
      // console.log('hello', this.log);
      this.log.notes = this.logNote;
      // console.log('hello', this.log);
      putRequest(this.log, function(e){
        console.log('sup fool', e);
      });
      // console.log()
    },
    updateLog(){
      this.log.notes = some.data;
    }  
  },
  computed: {
    showLogData: function(){
      console.log("his happened");
      // return this.hasLogData;
    }
  },
  created: function (){
    postRequest(function(){
      console.log("tester");
    });
    fetchData().then(function (data){
      app.updateChart(data);
    });
    prepDate = this.viewDate.split("-").map(x=>parseInt(x)).join("-");
    fetchData('?date='+prepDate).then(function(data){
      console.log("tester 2");
      this.log = data;
      this.dayProductivity = data.productivity;
      setTimeout(function(){
        app.changedDate();
      }, 1000);
    });
    setInterval(runSprite, 100);
  }
});

var siema =  new Siema({loop:true});
Vue.use(siema);

