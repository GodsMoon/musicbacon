var sys = require('sys');
var http = require('http');
var pg = require('pg').native;
var connectionString = "postgres://postgres:admin@localhost:5432/musicbacon";

var server = http.createServer(function(req, res) {
  var start = new Date();
  if(req.url != "/") {
    res.writeHead(404);
    return res.end("404'd")
  }
  var after = function(callback) {
    return function(err, queryResult) {
      if(err) {
        res.writeHead(500, {"Content-Type" : "text/plain"});
        return res.end("Error! " + sys.inspect(err))
      }
      callback(queryResult)
    }
  }
  
  pg.connect(connectionString, after(function(client) {
    client.query("SELECT COUNT(date) as count FROM visit", after(function(result) {
      client.query("SELECT date FROM visit ORDER BY date DESC LIMIT 1", after(function(dateResult) {
        var text = ["<html><head><title>Postgres Node Hello</title><body>",
                    "<p>I have been viewed ", result.rows[0].count, " times</p>",
                    "<p>Most recently I was viewed at ", (dateResult.rows.length !== 0 ? dateResult.rows[0].date : ""), "</p>",
                    'you can view the source <a href="http://github.com/brianc/node-postgres">on github</a>',
                    '<p>this page took ~',
                    (new Date())-start,
                    ' milliseconds to render</p>',
                    "</body></html>"].join('')
        res.writeHead(200, {"Content-Type": "text/html"})
        res.end(text);
        client.query('INSERT INTO visit(date) VALUES($1)', [new Date()])
      }))
    }))
  }))
})

server.listen(3001)