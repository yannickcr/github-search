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
			
			/*
			 * Commits graph
			 */
			data.commits = {};
			data.commitMax = 0;
			var lastCommit = resetTime(new Date(data2.commits[0].committed_date)).getTime(),
				firstCommit = resetTime(new Date(data2.commits[data2.commits.length - 1].committed_date)).getTime();
			
			// Init the empty commit array
			for (var i = lastCommit, j = firstCommit; i >= j; i = i - 86400000){
				var fullDate = new Date(i),
					day = fullDate.getDate() + '/' + (fullDate.getMonth() + 1) + '/' + fullDate.getFullYear();
					
				data.commits[day] = 0;
			}
			
			// Count the commits by day
			for (var i = 0, j = data2.commits.length; i < j; i++){
				var fullDate = new Date(data2.commits[i].committed_date),
					day = fullDate.getDate() + '/' + (fullDate.getMonth() + 1) + '/' + fullDate.getFullYear(),
					current = resetTime(fullDate).getTime();
					
				data.commits[day]++;
				
				if(data.commits[day] > data.commitMax) data.commitMax = data.commits[day];
			}
			
			/*
			 * Contributors graph
			 */
			data.contributions = {
				labels: [],
				commits:[]
			}
			for (var i = 0, j = data.contributors.length, others = 0; i < j; i++){
				if (i < 6) {
					data.contributions.labels.push(data.contributors[i].name);
					data.contributions.commits.push(data.contributors[i].contributions);
				} else others += data.contributors[i].contributions;
			}
			data.contributions.labels.push('Others');
			data.contributions.commits.push(others);
			
			render('github/repo.html', {data: data}, res);
		});
	});
}

module.exports = {
	home: home,
	search: search,
	repo: repo
};