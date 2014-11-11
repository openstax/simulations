define(function(require) {

	'use strict';

	var _        = require('underscore');
	var Backbone = require('backbone');

	var GOSimulation = require('models/simulation');
	var GOSimView    = require('views/sim');

	/**
	 *
	 */
	var FriendlyScaleSimView = GOSimView.extend({

		events: _.extend(GOSimView.prototype.events, {
			
		}),

		initialize: function(options) {
			options = _.extend({
				title: 'Friendly Scale',
				name:  'friendly'
			}, options);
			
			GOSimView.prototype.initialize.apply(this, [ options ]);
		}

	});

	return FriendlyScaleSimView;
});
