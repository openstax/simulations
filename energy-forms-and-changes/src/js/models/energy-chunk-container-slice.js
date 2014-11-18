define(function (require) {

	'use strict';

	var _         = require('underscore');
	var Backbone  = require('backbone');
	var Rectangle = require('rectangle-node');

	/**
	 * The original 
	 */
	var EnergyChunkContainerSlice = function(shape, zPosition) {
		this.shape;
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
		},

		getBounds: function() {
			if (this.shape instanceOf Rectangle)
				return this.shape;
			else
				this.shape.getBounds();
		}

	});

	return EnergyChunkContainerSlice;
});
