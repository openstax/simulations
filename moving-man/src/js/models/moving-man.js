define(function (require) {

	'use strict';

	//var _        = require('underscore');
	var Backbone = require('backbone');

	var DataSeries = require('models/data-series');

	/**
	 * Constants
	 */
	//var DERIVATIVE_RADIUS = 1;
	var SERIES_SIZE_LIMIT = 6;
	var SERIES_TIME_LIMIT = 20;

	/**
	 * 
	 */
	var MovingMan = Backbone.Model.extend({
		defaults: {

		},
		
		/**
		 *
		 */
		initialize: function(options) {
			this.mouseDataSeries         = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });
			this.positionModelSeries     = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });
			this.velocityModelSeries     = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });
			this.accelerationModelSeries = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });

			this.positionGraphSeries     = new DataSeries.LimitedTime({ maxSize: SERIES_TIME_LIMIT });
			this.velocityGraphSeries     = new DataSeries.LimitedTime({ maxSize: SERIES_TIME_LIMIT });
			this.accelerationGraphSeries = new DataSeries.LimitedTime({ maxSize: SERIES_TIME_LIMIT });
		},

		/**
		 *
		 */
		update: function(time, delta) {

		},

		/**
		 *
		 */
		addMouseData: function(value, time) {
			this.mouseDataSeries.add(value, time);
			this.set('position', value);
		}

	});

	return MovingMan;
});
