
/*
 * GET home page.
 */

var util = require('util');

exports.index = function(req, res){
	pg.connect(process.env.DATABASE_URL, after(function(client) {
	    client.query("SELECT * FROM taglines", after(function(result) {
	    	//res.send({ title: 'Music Bacon', tagline: 'hello world', shirts: result });
	    	/*if(req.body.tagline)
	    		res.render('index', { title: 'Music Bacon', tagline: 'hello world', shirts: result })
	    	else*/
	    		res.render('index', { title: 'Music Bacon', shirts: result, tagline: 'hello world' });
	    }))
	}))
	
	
};

exports.shirt = function(req, res){
	if(req.params.id)
		pg.connect(process.env.DATABASE_URL, after(function(client) {
		    client.query("SELECT * FROM taglines", after(function(result0) {
		    	client.query("SELECT * FROM taglines where slug='"+req.params.id+"'", after(function(result1) {
			    	
		    		         //res.send({ title: 'Music Bacon', tagline: result1.rows[0].tag, shirts: result0, myshirt:result1 });
		    		res.render('index', { title: 'Music Bacon', tagline: result1.rows[0].tag, shirts: result0, myshirt:result1 })	
		
			    }))
		    }))
		}))
	else
		res.render('index', { title: 'Music Bacon', tagline: 'ERROR' })
	
	/*if(req.params.id)
		res.render('index', { title: 'Music Bacon', tagline: req.params.id })	
	else
		res.render('index', { title: 'Music Bacon', tagline: 'ERROR' })*/
};

exports.post = function(req, res){
	
	if(req.body.tagline){
		var slug = slugify(req.body.tagline);
		pg.connect(process.env.DATABASE_URL, after(function(client) {
			client.query('INSERT INTO taglines(tag,slug) VALUES($1,$2)', [req.body.tagline,slug], after(function(result) {
				res.redirect('/shirt/'+slug);
			}))
		}))
	}
};

var after = function(callback) {
    return function(err, queryResult) {
      if(err) {
    	  console.log("Error! " + util.inspect(err));
      }
      callback(queryResult)
    }
  };
  
function slugify(text) {
	text = text.replace(/[^-a-zA-Z0-9,&\s]+/ig, '');
	text = text.replace(/-/gi, "_");
	text = text.replace(/\s/gi, "-");
	return text;
};