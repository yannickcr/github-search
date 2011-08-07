/*
 * Query GitHub for the given path.
 * If a callback function is given, she's called at the end of the response.
 */
query = function(path, callback){
	http.get({
		host: 'github.com',
		port: 80,
		path: path
	}, function (res){
		var data = '';
		res.setEncoding('utf8')
		res.on('data', function(chunk){
			data += chunk;
		})
		res.on('end', function() {
			if (typeof callback == 'function') callback(JSON.parse(data));
		});
	}).on('error', function(e){
		console.log(e);
	});
}

/*
 * Render the home page
 */
home = function(req, res){
	render('github/home.html', null, res);
}

/*
 * Render the search page
 */
search = function(req, res, search){
	query('/api/v2/json/repos/search/' + search, function(data){
		render('github/search.html', {data: data}, res);
	});
}

/*
 * Render the repository page
 */
repo = function(req, res, user, repo){
	query('/api/v2/json/repos/show/' + user + '/' + repo + '/contributors', function(data){
		query('/api/v2/json/commits/list/' + user + '/' + repo + '/master', function(data2){
			data.commits = data2.commits;
			render('github/repo.html', {data: data}, res);
		});
	});
}

module.exports = {
	home: home,
	search: search,
	repo: repo
};
