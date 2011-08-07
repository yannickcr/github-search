var github = require('./controllers/github');

// Homepage
router.get(/^\/$/, github.home);

// Search results
router.get(/search\/(.+)/, github.search);

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