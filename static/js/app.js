
var app = angular.module('app', ['nvd3ChartDirectives','ngWebSocket']);

app.factory('Configuration', function() {
  return {
    resource: {
      'UsersPerDay': 'ws://localhost:8001/usersPerDay'
    }
  };
});

app.factory('WebsocketResource', ['$websocket','Configuration', function($websocket, Configuration) {
  return function(id){
    var stream = $websocket(Configuration.resource[id]),
        values = [{
                    key: id,
                    values: []
                   }];

    stream.onMessage(function(message) {
      values[0].values = JSON.parse(message.data).data;
    });
    return values;
  };
}]);

app.factory('UsersPerDay', ['WebsocketResource', function(WebsocketResource) {
  return WebsocketResource('UsersPerDay');
}]);

app.controller('usersController', ['$scope','UsersPerDay', function($scope, UsersPerDay) {
  $scope.usersPerDay = UsersPerDay;
  $scope.xAxisTickFormatFunction = function() {
   return function(d) {
    return d3.time.format('%b, %d/%m/%Y')(new Date(d));
  };
 };
}]);

app.directive('extendedLineChart', function(){
  'use strict';
 return {
     restrict: 'E',
     require: '^nvd3MultiBarChart',
     link: function($scope, $element, $attributes, nvd3LineChart) {
         $scope.d3Call = function(data, chart){
             var svg = d3.select('#' + $scope.id + ' svg')
                 .datum(data);
             var path = svg.selectAll('path');
                  path.data(data)
                  .transition()
                  //.ease('linear')
                  .duration(500);
             return svg.transition()
                 .duration(500)
                 .call(chart);
         };
     }
  };
});

