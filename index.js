//require.paths.push('./lib');

// Includes libraries
sys = require('sys'),
http = require('http'),
net = require('net'),
fs = require('fs'),
util = require('util'),
tpl = require('node-t'),
router = require('choreographer').router(),
mime = require('mime').mime,
//cradle = require('cradle'),
markdown = require('markdown'),

require('./urls');   // Routing file

// Init Templates
tpl.init('./templates', true);

/*tpl.Filters.markdown = function(string){
  return markdown.toHTML( string );
}*/

render = function(template, data, res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(
		tpl.fromFile(template).render(data)
	);
}

// Init Database
//db = new(cradle.Connection)().database('blog');

http.createServer(router).listen(8124);
sys.puts('Server running at http://127.0.0.1:8124');