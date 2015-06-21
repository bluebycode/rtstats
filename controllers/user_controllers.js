var Q      = require('q'),
    redis  = require('redis'),
    client = redis.createClient(6380, 'box2.omnidrone.net');

var Users = {
    findAll: function(params, mapper){
      var deferred = Q.defer();
      client.zrangebyscore('r:u',params._from,params._to, 'WITHSCORES', function(err, values){
        var first
        var pairs = [];
        if (values && values.length > 0){
          // [e|s|..|e|s] =>[ [s|e] ... [s|e] ]
          for (var index = 0; index < values.length; index+=2){
            pairs.push([values[index+1], mapper(values[index])]);
          }
        }
        deferred.resolve({
          key:   'users', //@todo
          values: pairs
        });
      });
      return deferred.promise;
    }
};

exports.getAll = function(req, res){

  var mapper = function(list, previous){

  };

  Users.findAll({ _from: '-Inf', _to: '+Inf' }, mapper)
  .then(function(values) {
    res.send(JSON.stringify(values));
  })
  .catch(function(e) {
    console.log('e:',e);
  });
};
