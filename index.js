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

require('./routes'); // Routing file
require('custom-util'); // Custom utilities functions

// Init Templates
tpl.setTemplatesDir('./templates');
tpl.setDebug(true);
require('strobe-filters'); // Additional filters for strobe

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

http.createServer(router).listen(8075);
sys.puts('Server running at http://127.0.0.1:8075');