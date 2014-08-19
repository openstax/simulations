define([
	'jquery', 
	'underscore', 
	'backbone',
	'pixi',

	'views/sim',
	'models/wave-sim-sound'
], function ($, _, Backbone, PIXI, SimView, SoundSimulation) {

	'use strict';

	var SoundModuleView = SimView.extend({

		initialize: function(options) {
			options = _.extend({
				waveSimulation: new SoundSimulation()
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);

			this.model = new Backbone.Model({
				title: 'Sound'
			});

			// Test code
			this.graphics = new PIXI.Graphics()
				.beginFill(0x8888FF)
				.moveTo(-50, -50)
				.lineTo(50, 100)
				.lineTo(100,-50)
				.lineTo(-50,-50)
				.endFill();
			this.graphics.position.x = 200;
			this.graphics.position.y = 200;
			this.direction = 1;
			this.stage.addChild(this.graphics);
		},

		update: function(time, delta) {
			SimView.prototype.update.apply(this, [time, delta]);

			// Test code
			this.graphics.rotation += (Math.PI / 8000) * delta;
			this.graphics.position.x += (200 / 1000) * delta * this.direction;

			if (this.graphics.position.x > 860)
				this.direction = -1;
			else if (this.graphics.position.x < 100)
				this.direction = 1;
			// End test code
		}
	});

	return SoundModuleView;
});
