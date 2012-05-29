
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , pg = require('pg').native
  , connectionString = process.env.DATABASE_URL || 'postgres://postgres:admin@localhost:5432/musicbacon'
  , start = new Date()
  , port = process.env.PORT || 3000
  , client
  , query;
GLOBAL.pg = require('pg').native;
client = new pg.Client(connectionString);
client.connect();
/*query = client.query(
		'CREATE TABLE taglines				\
		(									\
		  id serial NOT NULL,				\
		  tag character varying(50),		\
		  likes integer,					\
		  "user" character varying(50),		\
		  date date,						\
		  slug character varying(50),		\
		  CONSTRAINT id PRIMARY KEY (id ),	\
		  CONSTRAINT slg UNIQUE (slug )		\
		)									\
		WITH (								\
		  OIDS=FALSE						\
		);									\
		ALTER TABLE taglines				\
		  OWNER TO postgres;');*/
//query.on('end', function() { client.end(); });

var app = module.exports = express.createServer();

GLOBAL.baseurl = "http://127.0.0.1:3000/";

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  express.cookieParser(),
  // set this to a secret value to encrypt session cookies
  express.session({ secret: process.env.SESSION_SECRET || '4a3d7daf2cc5b1646644a9584d8c6c85' }),
  require('faceplate').middleware({
    app_id: process.env.FACEBOOK_APP_ID,
    secret: process.env.FACEBOOK_SECRET,
    scope:  'user_likes,user_photos,user_photo_video_tags'
  })
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


var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

//app.write('test');
//setTimeout('test', 2000)



