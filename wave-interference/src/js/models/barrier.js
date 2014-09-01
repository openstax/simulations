
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

		this.style = 0;

		// In PhET's simulation, they are 2 wide
		this.topBox    = new BoxPotential({ width: 2, enabled: false });
		this.middleBox = new BoxPotential({ width: 2, enabled: false });
		this.bottomBox = new BoxPotential({ width: 2, enabled: false });

		this.waveSimulation.addPotential(this.topBox);
		this.waveSimulation.addPotential(this.middleBox);
		this.waveSimulation.addPotential(this.bottomBox);

		this.listenTo(this.waveSimulation, 'change:barrierX', this.changeX);
		this.listenTo(this.waveSimulation, 'change:barrierSlitWidth change:barrierSlitSeparation change:barrierStyle', this.changeDimensions);

		this.changeX();
		this.changeDimensions();
	};

	_.extend(Barrier.prototype, Backbone.Events, {

		changeX: function() {
			this.topBox.x = this.middleBox.x = this.bottomBox.x = this.waveSimulation.get('barrierX') * this.waveSimulation.widthRatio;
		},

		/**
		 * This code closely follows PhET's VerticleDoubleSlit.update()
		 */
		changeDimensions: function() {
			this.style = this.waveSimulation.get('barrierStyle');
			switch (this.style) {
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
			this.trigger('change');
		},

		changeBarrierType0: function() {
			this.topBox.enabled    = false;
			this.middleBox.enabled = false;
			this.bottomBox.enabled = false;
		},

		changeBarrierType1: function() {
			var latHeight  = this.waveSimulation.get('latticeSize').height;
			var slitSize   = this.waveSimulation.get('barrierSlitWidth') * this.waveSimulation.heightRatio;

			var slitCenter = Math.round(latHeight / 2.0);
			var boxHeight  = slitCenter - Math.round(slitSize / 2.0);

			this.topBox.height    = boxHeight;
			this.middleBox.height = 0;
			this.bottomBox.height = boxHeight;
			
			this.bottomBox.y = 0;
			this.topBox.y = latHeight - boxHeight;

			this.topBox.enabled    = true;
			this.middleBox.enabled = false;
			this.bottomBox.enabled = true;
		},

		changeBarrierType2: function() {
			var latHeight  = this.waveSimulation.get('latticeSize').height;
			var separation = this.waveSimulation.get('barrierSlitSeparation') * this.waveSimulation.heightRatio;
			var slitSize   = this.waveSimulation.get('barrierSlitWidth') * this.waveSimulation.heightRatio;

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

			this.topBox.enabled    = true;
			this.middleBox.enabled = true;
			this.bottomBox.enabled = true;
		}
	});

	return Barrier;
});