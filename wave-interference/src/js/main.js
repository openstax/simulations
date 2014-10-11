define(function (require) {

	'use strict';

	var $ = require('jquery');

	var AppView = require('./views/app.js');

	$(function(){
		var appView = new AppView();

		// Append to body
		$('body').append(appView.el);

		// Render main app view
		appView.render();

		// For demoing
		var better = false;
		$(document).bind('keydown', function(event) {
			if (event.which === 66) {
				if (better) {
					$('body').removeClass('better');
					$(window).trigger('worse');
					better = false;
				}
				else {
					$('body').addClass('better');
					$(window).trigger('better');
					better = true;
				}
			}
		});	

		appView.postRender();
	});

});