var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8001 }),
    Q = require('q');

var redis = require('redis'),
    topics = redis.createClient(6380, 'box.vrandkode.net'),
    client = redis.createClient(6380, 'box.vrandkode.net');

    // redis.debug_mode = true;
wss.broadcast = function broadcast(data) {
  var i = 0;
  wss.clients.forEach(function each(client) {
    console.log('Sending to client ', i++);
    client.send(data);
  });
};

wss.on('connection', function connection(ws) {
  console.log('Client connected');
  ws.on('message', function incoming(message) {
    console.log('received message from client: %s', message);
    //@todo: if we receive get..just send the info
  });
});

var mod = {};
(function(container){
  var eventObject = function(evt, object){
    return {
      event: evt,
      data: object
    };
  };

  var createConnection = function(source){
    return redis.createClient(source.port, source.host);
  };

  var timestampsPerDays = function(days){
    var timestamps = [];
    for (var day=days;day>0;day--){
      var date = new Date();
      date.setHours(0,0,0,0);
      date.setDate(date.getDate() - day);
      timestamps.push(date.getTime());
    }
    return timestamps;
  };

  container.Resources = function(configuration){
    var self = this;
    this._topics = configuration.topics;

    this._topics_conn = createConnection(configuration.source);
    this._client_conn = createConnection(configuration.source);

    for (var topic in this._topics){
      if (!this._topics[topic]) return;
      console.log('Subscribing "' + topic+'"');
      this._topics_conn.subscribe(topic);
    }

    if (this._topics){
      this._topics_conn.on('message', function(channel, message){
        console.log('received on channel: ', channel, ', message: ', message);
        if (self._topics[channel]){
          console.log('configuration found for this channel:', channel, self._topics[channel]);

          self._topics[channel].forEach(function(resource){
            console.log('resource:', resource.id);
            if (resource.type === 'days') {
              var timestamps = timestampsPerDays(resource.rows);
              self._getPerTimestamps(timestamps)
                .then(function(returned){
                  // returned data
                  var data = returned.map(function(e,i){
                    return [timestamps[i],e];
                  });

                  // sending by websocket clients
                  wss.broadcast(JSON.stringify(eventObject(resource.id, data)));
              });
            }
          });
        }
      });
    }
    this._getPerTimestamps = function(timestamps){
        try {
          var deferred = Q.defer();
          this._client_conn.multi(timestamps.map(function(day){
            return ['bitcount','users:day:'+day];
          })).exec(function (err, replies) {
            deferred.resolve(replies);
          });
          return deferred.promise;
        }catch(err){
          console.log(err);
        }
    };
  };

})(mod);

var resources = new mod.Resources({
  source: { host: 'box.vrandkode.net', port: 6380 },
  topics: { 'users': [
    {
      id: 'usersPerDay',
      type: 'days',
      rows: 5
    }]
  }
});


