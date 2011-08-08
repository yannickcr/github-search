var github = require('./controllers/github');
var url = require('url');

// Homepage
router.get(/^\/$/, github.home);

// Search results
router.get(/search\/(.*)/, function(req, res, search){
	// Redirect /search/?q=foo to /search/foo
	var query = url.parse(req.url, true).query;
	if (query.q) {
		res.statusCode = 302;
		res.setHeader('Location', '/search/' + query.q);
		res.end();
	}
	github.search(req, res, search);
});

// Static files directory
router.get(/public\/?(.*)/, function(req, res, file){
	fs.readFile('./public/' + file, function (err, data) {
		if (err){
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('Sorry, I can\'t find "' + file + '"'+'\n');
		} else {
			var ext = file.match(/\.(.*)/);
			ext = ext ? ext[1].toLowerCase() : '';
			res.writeHead(200, {'Content-Type': mime[ext]});
			res.end(data);
		}
	});
});

// Repository details
router.get(/([^\/]+)\/(.+)/, github.repo);

// 404 Error
router.notFound(function(req, res){
	res.writeHead(404, {'Content-Type': 'text/plain'});
	res.end('Sorry, I can\'t find "' + req.url + '"'+'\n');
});