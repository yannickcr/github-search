/*
 * Query GitHub for the given paths.
 * If a callback function is given, she's called after the requests.
 */
query = function(paths, callback, data){
	var path = paths.shift()
		data = data || {};
	http.get({
		host: 'github.com',
		port: 80,
		path: path
	}, function (res){
		var newData = '';
		res.setEncoding('utf8')
		res.on('data', function(chunk){
			newData += chunk;
		})
		res.on('end', function() {
			newData = JSON.parse(newData);
			for (var attr in newData) {
				if (data[attr]) data[attr] = data[attr].concat(newData[attr]);
				else data[attr] = newData[attr];
			}
			
			if (paths.length) query(paths, callback, data);
			else if (typeof callback == 'function') callback(data);
		});
	}).on('error', function(err){
		sys.puts(err);
	});
}

resetTime = function(date){
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
}

/*
 * Render the home page
 */
home = function(req, res){
	render('github/home.html', {title: 'Search - GitHub'}, res);
}

/*
 * Render the search page
 */
search = function(req, res, search){
	query(['/api/v2/json/repos/search/' + search], function(data){
		render('github/search.html', {title: 'Search:' + search + ' - GitHub', search: search, data: data}, res);
	});
}

/*
 * Render the repository page
 */
repo = function(req, res, user, repo){
	query([
		'/api/v2/json/repos/show/' + user + '/' + repo,
		'/api/v2/json/repos/show/' + user + '/' + repo + '/contributors',
		'/api/v2/json/commits/list/' + user + '/' + repo + '/master?page=1',
		'/api/v2/json/commits/list/' + user + '/' + repo + '/master?page=2',
		'/api/v2/json/commits/list/' + user + '/' + repo + '/master?page=3'
	], function(data){	
		/*
		 * Commits graph
		 */
		data.commitsByDay = {};
		var lastCommit = resetTime(new Date(data.commits[0].committed_date)).getTime(),
			firstCommit = resetTime(new Date(data.commits[data.commits.length - 1].committed_date)).getTime();
				
		// Init the empty commit array
		for (var i = lastCommit, j = firstCommit; i >= j; i = i - 86400000){
			var date = resetTime(new Date(i)).getTime();
			data.commitsByDay[date] = 0;
		}
				
		// Count the commits by day
		for (var i = 0, j = data.commits.length; i < j; i++){
			var date = resetTime(new Date(data.commits[i].committed_date)).getTime();
			data.commitsByDay[date]++;
		}
		
		/*
		 * Contributors graph
		 */
		data.contributions = {
			labels: [],
			commits:[]
		}
		for (var i = 0, j = data.contributors.length, others = 0; i < j; i++){
			if (i < 10) {
				data.contributions.labels.push(data.contributors[i].name || data.contributors[i].login);
				data.contributions.commits.push(data.contributors[i].contributions);
			} else others += data.contributors[i].contributions;
		}
		
		if (others != 0) {
			data.contributions.labels.push('Others');
			data.contributions.commits.push(others);
		}
		
		render('github/repo.html', {title: user + '/' + repo + ' - GitHub', data: data}, res);
	});
}

module.exports = {
	home: home,
	search: search,
	repo: repo
};