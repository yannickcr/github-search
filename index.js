//require.paths.push('./lib');

// Includes libraries
sys = require('sys'),
http = require('http'),
net = require('net'),
fs = require('fs'),
util = require('util'),
crypto = require('crypto'),
tpl = require('strobe'),
router = require('choreographer').router(),
mime = require('mime').mime,
//cradle = require('cradle'),
//markdown = require('markdown'),

require('./urls');   // Routing file

// Init Templates
tpl.setTemplatesDir('./templates');
tpl.setDebug(true);

/*tpl.Filters.markdown = function(string){
  return markdown.toHTML( string );
}*/

tpl.Filters.join = function(array, glue){
	if(array.join) return array.join(glue);
	var data = [];
	for (var i in array) data.push(array[i]);
	return data.join(glue);
}

tpl.Filters.toBytes = function(size, precision){
	var labels = [' kB', ' MB', ' GB'], p = 0;
	if (size >= 1073741824) p = 3;
	else if(size >= 1048576) p = 2;
	else if(size >= 1024) p = 1;
	return Math.round(Math.pow(10, precision) * size / Math.pow(1024, p)) / Math.pow(10, precision) + labels[p];
}

render = function(template, data, res){
  new tpl.Template(template).load(function(err, template) {
    if (err) sys.puts(err);
    else template.render(data, function(err, output) {
      if (err) sys.puts(err);
      else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(output.join(''));
      }
    });
  });
}

// Init Database
//db = new(cradle.Connection)().database('blog');

http.createServer(router).listen(8124);
sys.puts('Server running at http://127.0.0.1:8124');