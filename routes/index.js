
/*
 * GET home page.
 */

var util = require('util');

exports.index = function(req, res){
	pg.connect(process.env.DATABASE_URL, after(function(client) {
	    client.query("SELECT * FROM taglines", after(function(result) {
	    	//res.send({ title: 'Music Bacon', tagline: 'hello world', shirts: result });

	    		res.render('index', { title: 'Music Bacon', shirts: result, user: req.user });
	    }))
	}))
	//res.send({ title: 'Music Bacon', tagline: 'hello world'});
	
};

exports.shirt = function(req, res){
	if(req.params.id)
		pg.connect(process.env.DATABASE_URL, after(function(client) {
		    client.query("SELECT * FROM taglines", after(function(result0) {
		    	client.query("SELECT * FROM taglines where slug='"+req.params.id+"'", after(function(result1) {
			    	
		    		         //res.send({ title: 'Music Bacon', tagline: result1.rows[0].tag, shirts: result0, myshirt:result1 });
		    		res.render('index', { title: 'Music Bacon', tagline: result1.rows[0].tag, shirts: result0, myshirt:result1, user: req.user })	
		
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
	console.log(req.user);
	//res.send({ facebook: req.user });
	
	if(req.body.tagline){
		var slug = slugify(req.body.tagline);
		var safe_text = sanitize(req.body.tagline)
		
		console.log("slug:"+slug);
		console.log("safe_text:"+safe_text);
		
		if(slug.length<50 && safe_text.length<50){
			
			pg.connect(process.env.DATABASE_URL, after(function(client) {
				client.query("select name from taglines where slug='"+slug+"'", after(function(exist_test) {
					console.log("EXISTS TEST:"+exist_test.row[0]);
					if(exist_test.rows[0])
						client.query('INSERT INTO taglines(tag,slug) VALUES($1,$2)', [req.body.tagline,slug], after(function(result) {
							res.redirect('/shirt/'+slug);
						}))
					else{
						//res.send({ ERROR: "There was an error" });
						console.log("ERROR");
						req.error = "";
						req.flash('error', "#{exist_test.rows[0].name} already submitted that tagline<br/>I bet you can come up with something better.");
						res.redirect('back');
					}
						
				}))
				
			}))
		}
		else{
			req.flash('error', "Your tagline is too long.");
			res.redirect('back');
		}
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
  
function sanitize(text) {
	text = text.replace(/(\r\n|\n|\r)/gm,"<br/>");
	text = text.replace(/[^-a-zA-Z0-9</>,&\s]+/ig, '');

	return text;
};
  
function slugify(text) {
	text = text.replace(/[^-a-zA-Z0-9,&\s]+/ig, '');
	text = text.replace(/-/gi, "_");
	text = text.replace(/\s/gi, "-");
	return text;
};