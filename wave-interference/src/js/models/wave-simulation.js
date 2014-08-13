define([
	'underscore', 
	'backbone',
	'pixi'
], function (_, Backbone, PIXI) {

	'use strict';

	var WaveSimulation = Backbone.Model.extend({
		defaults: {
			damping: {
				x: 20,
				y: 20
			},
			dimensions: {
				w: 60,
				h: 60
			}
		},
		
		initialize: function(options) {
			
			this.stage = options.stage;

			this.graphics = new PIXI.Graphics().beginFill(0x8888FF).moveTo(-50, -50).lineTo(50, 100).lineTo(100,-50).lineTo(-50,-50).endFill();
			this.graphics.position.x = 200;
			this.graphics.position.y = 200;
			this.direction = 1;
			this.stage.addChild(this.graphics);
		},

		update: function(delta) {
			this.graphics.rotation += (Math.PI / 8000) * delta;
			this.graphics.position.x += (200 / 1000) * delta * this.direction;

			if (this.graphics.position.x > 700)
				this.direction = -1;
			else if (this.graphics.position.x < 100)
				this.direction = 1;
		},

		step: function(delta) {

		},

		reset: function() {

		}
	});

	return WaveSimulation;
});
