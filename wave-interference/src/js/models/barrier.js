
define(function(require) {

	'use strict';

	var _            = require('underscore');
	var Backbone     = require('backbone');
	var BoxPotential = require('models/potential/box');

	var Barrier = function(options) {

		if (options.waveSimulation)
			this.waveSimulation = options.waveSimulation;
		else
			throw 'Barrier requires a WaveSimulation model to operate.';

		this.topBox    = new BoxPotential({ width: 2 });
		this.middleBox = new BoxPotential({ width: 2 });
		this.bottomBox = new BoxPotential({ width: 2 });

		this.waveSimulation.addPotential(this.topBox);
		this.waveSimulation.addPotential(this.middleBox);
		this.waveSimulation.addPotential(this.bottomBox);

		this.listenTo(this.waveSimulation, 'change:barrierX', this.changeX);
		this.listenTo(this.waveSimulation, 'change:barrierSlitWidth change:barrierSlitSeparation change:barrierStyle', this.changeDimensions);

		this.changeX();
		this.changeDimensions();
	};


	var i;

	_.extend(Barrier.prototype, Backbone.Events, {

		changeX: function() {
			this.topBox.x = this.middleBox.x = this.bottomBox.x = this.waveSimulation.get('barrierX');
		},

		/**
		 * This code closely follows PhET's VerticleDoubleSlit.update()
		 */
		changeDimensions: function() {
			switch (this.waveSimulation.get('barrierStyle')) {
				case 0:
					this.changeBarrierType0();
					break;
				case 1: 
					this.changeBarrierType1();
					break;
				case 2:
					this.changeBarrierType2();
					break;
			}
		},

		changeBarrierType0: function() {
			this.topBox.height    = 0;
			this.middleBox.height = 0;
			this.bottomBox.height = 0;
		},

		changeBarrierType1: function() {
			var latHeight  = this.waveSimulation.get('latticeSize').height;
			var separation = this.waveSimulation.get('barrierSlitSeparation');
			var slitSize   = this.waveSimulation.get('barrierSlitWidth');

			var slitCenter = Math.round(latHeight / 2.0);
			var boxHeight  = slitCenter - Math.round(slitSize / 2.0);

			this.bottomBox.height = boxHeight;
			this.topBox.height    = boxHeight;

			this.bottomBox.y = 0;
			this.topBox.y = latHeight - boxHeight;

			// Discount the middle one; we don't want it.
			this.middleBox.height = 0;
		},

		changeBarrierType2: function() {
			var latHeight  = this.waveSimulation.get('latticeSize').height;
			var separation = this.waveSimulation.get('barrierSlitSeparation');
			var slitSize   = this.waveSimulation.get('barrierSlitWidth');

			var middleBoxHeight = separation - slitSize;
			if (middleBoxHeight < 1)
				middleBoxHeight = 1;

			var endBoxesHeight = latHeight / 2 - middleBoxHeight / 2 - slitSize;

			this.bottomBox.height = endBoxesHeight;
			this.middleBox.height = middleBoxHeight;
			this.topBox.height    = endBoxesHeight;

			this.bottomBox.y = 0;
			this.middleBox.y = endBoxesHeight + slitSize;
			this.topBox.y    = this.middleBox.y + this.middleBox.height + slitSize;
		}
	});

	return Barrier;
});