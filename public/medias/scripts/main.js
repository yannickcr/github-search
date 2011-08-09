/** Main **/

(function(){

	var req = new Request.HTML({
		onComplete: function(tree, els, html, js){
			document.id('content')
				.set('html', html)
				.removeClass('load');
		}
	});
	
	History.Adapter.bind(window, 'statechange', function(){
		var state = History.getState();
		// Update the search field
		document.id('q').set('value', state.data.search);
		// Cancel the previous request
		if (req.isRunning()) req.cancel();
		
		// Request content
		req.options.url = state.data.url;
		req.get('ajax');
		
		document.id('content').addClass('load');
	});

	// Search
	GIT.initSearch = function(){
		if (Browser.ie) return false; // Skip if IE
		
		document.id('search').addEvent('submit', function(e){
			e.stop();
			var q = document.id('q');
			// Update state
			History.pushState({
				url: '/search/' + q.value,
				search: q.value
			}, 'Search:' + q.value + ' - GitHub' , '/search/' + q.value);
		});
	}
	
	// Results
	GIT.initResults = function(){
		if (Browser.ie) return false; // Skip if IE
		
		document.id('container').addEvent('click:relay(#results a)', function(e, el){
			e.stop();
			var q = document.id('q');
			// Update state
			History.pushState({
				url: el.get('href'),
				search: q.value
			}, el.getElement('h2').get('text') + ' - GitHub' , el.get('href'));
		});
	}

})();

/*
 * Exec queued functions
 */
GIT.execFn = function(){
	GIT.exec.push = function(fn){
		typeof fn == 'string' ? GIT[fn]() : fn();
	}
	GIT.exec.forEach(GIT.exec.push);
}
