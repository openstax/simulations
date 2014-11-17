define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Backbone = require('backbone');

	/**
	 * Constants
	 */
	var Constants = require('models/constants');

	/**
	 * 
	 */
	var Air = Backbone.Model.extend({

		defaults: {
			energy: Static.INITIAL_ENERGY,
			energyChunksVisible: false
		},
		
		initialize: function(attributes, options) {
			this.energyChunksList = [];
			this.energyCunkWanderControllers = [];
		},

		/**
		 * Reset the air model to its original state.
		 */
		reset: function() {
		   
		}

	}, Constants.Air);

	return Air;
});
