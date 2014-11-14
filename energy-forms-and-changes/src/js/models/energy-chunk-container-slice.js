define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Backbone = require('backbone');

	/**
	 * The original 
	 */
	var EnergyChunkContainerSlice = function(bounds, zPosition) {
		this.bounds = bounds;
		this.zPosition = zPosition;
		this.energyChunkList = [];
	};

	_.extend(EnergyChunkContainerSlice.prototype, Backbone.Events, {

		translate: function(translation) {
			for (var i = 0; i < this.energyChunkList.length; i++)
				this.energyChunkList[i].translate(translation);
		},

		addEnergyChunk: function(chunk) {
			chunk.zPosition = this.zPosition;
			this.energyChunkList.push(chunk);
		},

		getNumEnergyChunk: function() {
			return this.energyChunkList.length;
		}

	});

	return EnergyChunkContainerSlice;
});
