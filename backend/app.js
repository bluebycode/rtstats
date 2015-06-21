var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8001 }),
    _ = require('underscore');

var redis = require('redis'),
    client = redis.createClient(6380, 'box2.omnidrone.net'),
    client2 = redis.createClient(6380, 'box2.omnidrone.net');

    //redis.debug_mode = true;

var util  = require('util');

var Q = require('q');

wss.broadcast = function broadcast(data) {
  var i = 0;
  wss.clients.forEach(function each(client) {
    console.log('sending to client ', i++);
    client.send(data);
  });
};

wss.on('connection', function connection(ws) {
  console.log('client connected!!',ws);
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
});

var data = [ [ 1434585600000 , 10] , [ 1434672000000 , 256] ,[ 1434758400000 , 100] , [ 1434844800000 , 156] ];
var beginning = 0;
var eventObject = function(evt, object){
  return {
    event: evt,
    data: object
  };
};

client.subscribe('users');

var getPerDays = function(days){
  var deferred = Q.defer();
  client2.multi(_.map(days, function(day){
    return ['bitcount','users:day:'+day];
  })).exec(function (err, replies) {
    deferred.resolve(replies);
  });
  return deferred.promise;
};

var getPerTimestamps = function(timestamps){
  var deferred = Q.defer();
  client2.multi(_.map(days, function(day){
    return ['bitcount','users:day:'+day];
  })).exec(function (err, replies) {
    deferred.resolve(replies);
  });
  return deferred.promise;
};

client.on('message', function(channel, message){
  console.log('received on channel: ', channel, ', message: ', message);
  if (channel === 'users'){
    getPerDays(['18062015','19062015','20062015','21062015','22062015'])
      .then(function(ups){
        console.log('everything', ups);
    });
  }
});

setInterval(function(){
  console.log('sending broadcast data');
  try {
      beginning+=10;
      var result = _.map(data, function(e){
        return [e[0],e[1]+beginning];
      });
      wss.broadcast(JSON.stringify(eventObject('dau', result)));
    }catch(er){
      console.log(er);
    }

},2000);
