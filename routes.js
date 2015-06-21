var express = require('express');

module.exports = function(app) {
  //var users = require('./controllers/user_controllers');
  app.use('/js', express.static(__dirname + '/static/js'));
  app.use('/css', express.static(__dirname + '/static/css'));
  app.use('/images', express.static(__dirname + '/static/images'));

  //app.get('/users/access', users.getAll);
};
