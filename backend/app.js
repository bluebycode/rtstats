var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8001 }),
    _ = require('underscore');

var util  = require('util');


wss.on('connection', function connection(ws) {

  console.log('connected!!',ws);

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  var data = [ [ 1434585600000 , 10] , [ 1434672000000 , 256] ,[ 1434758400000 , 100] , [ 1434844800000 , 156] ];
  var beginning = 0;
  setInterval(function(){
    try {
      beginning+=10;
      var result = _.map(data, function(e){
        return [e[0],e[1]+beginning];
      });
      //console.log('sending data with factor:', beginning, result);
      ws.send(JSON.stringify(eventObject('dau', result)));
    }catch(er){
      console.log(er);
    }
  },1000);

  var eventObject = function(evt, object){
    return {
      event: evt,
      data: object
    };
  };
});

setInterval(function(){
  console.log('sending broadcast data');
  wss.broadcast = function broadcast(data) {
    var i = 0;
    wss.clients.forEach(function each(client) {
      console.log('sending to client ', i++);
      //client.send(data);
    });
  };
  wss.broadcast(JSON.stringify({
      event: 'daily',
      data: [ [ 1434585600000 , 10] , [ 1434672000000 , 256] ,[ 1434758400000 , 100] , [ 1434844800000 , 156] ]
    }));
},2000);
