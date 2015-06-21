
var app = angular.module('app', ['nvd3ChartDirectives','ngWebSocket']);

app.factory('UsersPerDay', function($websocket) {
  var dataStream = $websocket('ws://localhost:8001');

  var updated = [{
    key: 'daily',
    values: []
  }];

  dataStream.onMessage(function(message) {
    var event = message.event,
        data = JSON.parse(message.data).data;
    updated[0].values = data;
  });
  return updated;
});

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

