define(function(require) {
	
	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone');

	var AppView = require('common/app/app');

	var IntroSimView  = require('views/sim/intro');
	var ChartsSimView = require('views/sim/charts');

	var MovingManAppView = AppView.extend({

		initialize: function() {
			this.sims = [
				new IntroSimView(),
				new ChartsSimView()
			];

			AppView.prototype.initialize.apply(this);
		}

	});

	return AppView;
});
