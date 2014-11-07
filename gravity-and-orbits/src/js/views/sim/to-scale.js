define(function(require) {

	'use strict';

	var _        = require('underscore');
	var Backbone = require('backbone');

	var GOSimulation = require('models/simulation');
	var GOSimView    = require('views/sim');

	/**
	 *
	 */
	var ToScaleSimView = GOSimView.extend({

		events: _.extend(GOSimView.prototype.events, {
			
		}),

		initialize: function(options) {
			options = _.extend({
				title: 'Accurate Scale',
				name:  'to-scale'
			}, options);
			
			GOSimView.prototype.initialize.apply(this, [ options ]);
		}

	});

	return ToScaleSimView;
});
