/*
 * Query GitHub for the given paths.
 * If a callback function is given, she's called after the requests.
 */
query = function(paths, callback, data){
	var path = paths.shift()
		data = data || {};
		file = 'tmp/' + path.replace(/[^a-z0-9-]/gi, '-');
		now = Date.now();
	
	fs.stat(file, function(err, stats){
		// File error, read feed
		if (err) readFeed();
		else {
			// Check file
			var filemTime = new Date(stats.mtime).getTime();
			// Too old, read feed
			if (now - filemTime > 1000*60*10) readFeed();
			// Read file
			else {
				fs.readFile(file, 'utf8', function (err, newData) {
					if (err) sys.puts(err);
					processing(newData);
				});
			}
		}
	});
	
	function readFeed(){
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
				fs.writeFile(file, newData, function (err) {
					if (err) sys.puts(err);
				});
				processing(newData);
			});
		}).on('error', function(err){
			sys.puts(err);
		});
	}
	
	function processing(newData){
		newData = JSON.parse(newData);
		for (var attr in newData) {
			if (data[attr]) data[attr] = data[attr].concat(newData[attr]);
			else data[attr] = typeof newData[attr] == 'object' ? newData[attr] : [newData[attr]];
		}
				
		if (paths.length) query(paths, callback, data);
		else if (typeof callback == 'function') callback(data);
	}
}

/*
 * Reset the hours, minutes, seconds and milliseconds of a Date object
 */
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
	render('github/home.html', {
		title: 'Search - GitHub',
		layout: util.isAjax(req) ? 'layout/empty.html' : 'layout/common.html'
	}, res);
}

/*
 * Render the search page
 */
search = function(req, res, search){
	query(['/api/v2/json/repos/search/' + search], function(data){
		render('github/search.html', {
			title: 'Search:' + search + ' - GitHub',
			layout: util.isAjax(req) ? 'layout/empty.html' : 'layout/common.html',
			search: search,
			data: data
		}, res);
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
		
		// Display an error if we  lost the repository, commits or contributors
		if (!data.repository || !data.commits || !data.contributors) {
			return render('partials/error.html', {
				errors: data.error,
				title: user + ' / ' + repo + ' - GitHub',
				layout: util.isAjax(req) ? 'layout/empty.html' : 'layout/common.html'
			}, res);
		}
			
		/*
		 * Commits graph
		 */
		data.commitsByDay = {};
		var lastCommit = resetTime(new Date(data.commits[0].committed_date)).getTime(),
			firstCommit = resetTime(new Date(data.commits[data.commits.length - 1].committed_date)).getTime();
				
		// Init the empty commit array
		for (var i = firstCommit, j = lastCommit; i <= j; i = i + 86400000){
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
		
		render('github/repo.html', {
			title: user + ' / ' + repo + ' - GitHub',
			layout: util.isAjax(req) ? 'layout/empty.html' : 'layout/common.html',
			data: data
		}, res);
	});
}

module.exports = {
	home: home,
	search: search,
	repo: repo
};