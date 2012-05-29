
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , pg = require('pg').native
  , connectionString = process.env.DATABASE_URL //|| 'postgres://postgres:admin@localhost:5432/musicbacon'
  , start = new Date()
  , port = process.env.PORT || 3000
  , client
  , query;
GLOBAL.pg = require('pg').native;
client = new pg.Client(connectionString);
client.connect();
query = client.query('SELECT * FROM taglines');
//query.on('end', function() { client.end(); });

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.post('/post/tagline', routes.post);
app.get('/shirt/:id', routes.shirt);		

app.get('/', routes.index);



app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

//app.write('test');
//setTimeout('test', 2000)


