/** Main **/

// Search
GIT.initSearch = function(){
	var req = new Request.HTML({
		onComplete: function(tree, els, html, js){
			document.id('content')
				.set('html', html)
				.removeClass('load');
		}
	});
	
	document.id('search').addEvent('submit', function(e){
		e.stop();
		var q = document.id('q');
		History.pushState({
			url: '/search/' + q.value,
			search: q.value
		}, 'Search:' + q.value + ' - GitHub' , '/search/' + q.value);
	});
	
	// Initialize History.js
	/*History.replaceState({
		url: URI.base.parsed['directory'] + URI.base.parsed['file'],
		search: document.id('q').get('value')
	}, document.title, URI.base.parsed['directory'] + URI.base.parsed['file']);*/

	History.Adapter.bind(window, 'statechange', function(){
		var state = History.getState();
		// Request content
		document.id('q').set('value', state.data.search);
		if (req.isRunning()) req.cancel();
		req.options.url = state.data.url;
		req.get('ajax');
		document.id('content').addClass('load');
	});
}

// Results
GIT.initResults = function(){
	var req = new Request.HTML({
		onComplete: function(tree, els, html, js){
			document.id('content')
				.set('html', html)
				.removeClass('load');
		}
	});
	
	document.id('container').addEvent('click:relay(#results a)', function(e, el){
		e.stop();
		History.pushState({
			url: el.get('href'),
		}, el.getElement('h2').get('text') + ' - GitHub' , el.get('href'));
	});
}

/*
 * Exec queued functions
 */
GIT.execFn = function(){
	GIT.exec.push = function(fn){
		typeof fn == 'string' ? GIT[fn]() : fn();
	}
	GIT.exec.forEach(GIT.exec.push);
}
