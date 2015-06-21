var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8001 }),
    _ = require('underscore');

var util   = require('util');

wss.on('connection', function connection(ws) {
  console.log('connected!!');

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
      console.log('sending data with factor:', beginning, result);
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

