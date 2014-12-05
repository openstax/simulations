define(function(require) {

	'use strict';

	//var _    = require('underscore');

	var PixiView = require('common/pixi/view');

	var EnergyChunkView = require('views/energy-chunk');

	/**
	 * A view that represents the air model
	 */
	var EnergyChunkContainerSliceView = PixiView.extend({

		/**
		 *
		 */
		initialize: function(options) {
			if (options.slice === undefined)
				throw 'EnergyChunkContainerSliceView requires an EnergyChunkContainerSlice object.';

			this.slice = options.slice;

			if (options.mvt === undefined)
				throw 'EnergyChunkContainerSliceView requires a ModelViewTransform object specified in the options as "mvt".';
			
			this.mvt = options.mvt;

			this.views = [];

			this.initGraphics();

			this.listenTo(this.slice.energyChunkList, 'add',    this.chunkAdded);
			this.listenTo(this.slice.energyChunkList, 'remove', this.chunkRemoved);
		},

		initGraphics: function() {
			// Populate it with what's already in the collection
			this.slice.energyChunkList.each(this.chunkAdded, this);
		},

		chunkAdded: function(chunk) {
			var energyChunkView = new EnergyChunkView({
				model: chunk,
				mvt: this.mvt
			});
			this.views.push(energyChunkView);
			this.displayObject.addChild(energyChunkView.displayObject);
		},

		chunkRemoved: function(chunk) {
			for (var i = 0; i < this.views.length; i++) {
				if (this.views[i].model === chunk) {
					this.views[i].remove();
					this.views.slice(i, 1);
					break;
				}
			}
		}

	});

	return EnergyChunkContainerSliceView;
});