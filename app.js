var express = require('express');
var app = express();

app.set('view engine', 'html');
app.set('views', require('path').join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res){
  res.render('main');
});

require('./routes')(app);
app.listen(3000);
