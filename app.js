
/**
 * Module dependencies.
 */
var async   = require('async');
var util = require('util');
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

//var app = module.exports = express.createServer();

//create an express webserver
var app = express.createServer(
  express.logger(),
  express.static(__dirname + '/public'),
  express.bodyParser(),
  express.cookieParser(),
  // set this to a secret value to encrypt session cookies
  express.session({ secret: process.env.SESSION_SECRET || '4a3d7daf2cc5b1646644a9584d8c6c85' }),
  require('faceplate').middleware({
    app_id: process.env.FACEBOOK_APP_ID,
    secret: process.env.FACEBOOK_SECRET,
    scope:  'user_likes,user_photos,user_photo_video_tags'
  })
);

//GLOBAL.baseurl = "http://127.0.0.1:3000/";


app.dynamicHelpers({
	  'host': function(req, res) {
	    return req.headers['host'];
	  },
	  'scheme': function(req, res) {
	    return req.headers['x-forwarded-proto'] || 'http';
	  },
	  'url': function(req, res) {
	    return function(path) {
	    	//return 'test';
	    	url_no_scheme_temp = app.dynamicViewHelpers.url_no_scheme(req, res);
	      return app.dynamicViewHelpers.scheme(req, res) + url_no_scheme_temp(path);
	    }
	  },
	  'url_no_scheme': function(req, res) {
	    return function(path) {
	    	//return 'test';
	      return '://' + app.dynamicViewHelpers.host(req, res) + path;
	    }
	  },
	});

app.dynamicHelpers({ messages: require('express-messages') });

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
    scope:  'user_likes,email,user_location'
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

function render_page(req, res, next) {
  req.facebook.app(function(app) {
    req.facebook.me(function(user) {
      /*res.render('index', {
        layout:    false,
        req:       req,
        app:       app,
        user:      user
      });*/

    	req.app = app;
    	req.user = user;
    	next();
    });
  });
}

function handle_facebook_request(req, res, next) {
	
  // if the user is logged in
  if (req.facebook.token) {

    async.parallel([
      function(cb) {
        // query 4 friends and send them to the socket for this socket id
        req.facebook.get('/me/friends', { limit: 4 }, function(friends) {
          req.friends = friends;
          cb();
        });
      },
      function(cb) {
        // query 16 photos and send them to the socket for this socket id
        req.facebook.get('/me/photos', { limit: 16 }, function(photos) {
          req.photos = photos;
          cb();
        });
      },
      function(cb) {
        // query 4 likes and send them to the socket for this socket id
        req.facebook.get('/me/likes', { limit: 4 }, function(likes) {
          req.likes = likes;
          cb();
        });
      },
      function(cb) {
        // use fql to get a list of my friends that are using this app
        req.facebook.fql('SELECT uid, name, is_app_user, pic_square FROM user WHERE uid in (SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1', function(result) {
          req.friends_using_app = result;
          cb();
        });
      }
    ], function() {
      //render_page(req, res, next);
    });

  } else {
    //render_page(req, res, next);
  }
  next();
}


// Routes

app.post('/post/tagline',  handle_facebook_request, render_page, routes.post);
app.get('/shirt/:id', handle_facebook_request, render_page, routes.shirt);		

app.get('/', handle_facebook_request, render_page, routes.index);


var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

//app.write('test');
//setTimeout('test', 2000)



