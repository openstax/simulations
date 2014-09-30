
define(function(require) {

	'use strict';

	var _        = require('lodash');
	var glMatrix = require('glmatrix');

	/**
	 * From PhET's edu.colorado.phet.common.phetcommon.view.graphics.Arrow
	 */
	var ArrowGraphic = function(options) {
		options = _.extend({
			tail: {
				x: 0,
				y: 0
			},
			head: {
				x: 0,
				y: 0
			},

			headHeight: 8,
			headWidth:  8,
			tailWidth:  4,

			scaleHead: true,
			scaleTail: true,
			scaledHeadProportion: 0.5,

			lineColor: '#000',
			lineThickness: 2,
		}, options);

		this.tail = glMatrix.vec2.fromValues(options.tail.x, options.tail.y);
		this.head = glMatrix.vec2.fromValues(options.head.x, options.head.y);

		this.headHeight = options.headHeight;
		this.headWidth  = options.headWidth;
		this.tailWidth  = options.tailWidth;

		this.scaleHead = options.scaleHead;
		this.scaleTail = options.scaleTail;
		this.scaledHeadProportion = options.scaledHeadProportion;

		this.lineColor = options.lineColor;
		this.lineThickness = options.lineThickness;

		if (options.context)
			this.context = options.context;
		else
			throw 'ArrowGraphic needs a graphics context to draw to.';

		// Initialize vectors
		this._direction = glMatrix.vec2.create();
		this._normal    = glMatrix.vec2.create();

		this._rightFlap = glMatrix.vec2.create();
		this._rightPin  = glMatrix.vec2.create();
		this._rightTail = glMatrix.vec2.create();
		this._leftTail  = glMatrix.vec2.create();
		this._leftPin   = glMatrix.vec2.create();
		this._leftFlap  = glMatrix.vec2.create();
	};

	_.extend(ArrowGraphic.prototype, {

		setTail: function(x, y) {
			this.tail[0] = x;
			this.tail[1] = y;
		},

		setHead: function(x, y) {
			this.head[0] = x;
			this.head[1] = y;
		},

		setLineColor: function(color) {
			this.lineColor = color;
		},

		setLineThickness: function(thickness) {
			this.lineThickness = thickness;
		},

		draw: function() {
			if (glMatrix.vec2.distance(this.tail, this.head) !== 0) {
			
				// Get normalized direction vector
				glMatrix.vec2.sub(this._direction, this.head, this.tail);
				glMatrix.vec2.normalize(this._direction, this._direction);

				var length = glMatrix.vec2.distance(this.head, this.tail);
				var headHeight = this.headHeight;
				var headWidth  = this.headWidth;
				var tailWidth  = this.tailWidth;

				if (this.scaleHead) {
					if (length < headHeight / this.scaledHeadProportion) {
						headHeight = length * this.scaledHeadProportion;
						if (this.scaleTail) {
							tailWidth *= headHeight / this.headHeight;
							headWidth *= headHeight / this.headHeight;
						}
					}
				}

				// Calculate the normal vector by making it perpendicular to direction vector
				this._normal[0] =  this._direction[1];
				this._normal[1] = -this._direction[0];

				// Calculate positions of all the points on the arrow
				this._headOffset(this._rightFlap, -headHeight, -headWidth / 2);
				this._headOffset(this._leftFlap,  -headHeight,  headWidth / 2);
				this._headOffset(this._rightPin,  -headHeight, -tailWidth / 2);
				this._headOffset(this._leftPin,   -headHeight,  tailWidth / 2);
				this._headOffset(this._rightTail, -length,     -tailWidth / 2);
				this._headOffset(this._leftTail,  -length,      tailWidth / 2);

				// Connect the dots
				var context = this.context;

				context.beginPath();
				context.moveTo(this.head[0], this.head[1]);
				context.lineTo(this._rightFlap[0], this._rightFlap[1]);
				context.lineTo(this._rightPin[0],  this._rightPin[1]);
				context.lineTo(this._rightTail[0], this._rightTail[1]);
				context.lineTo(this._leftTail[0],  this._leftTail[1]);
				context.lineTo(this._leftPin[0],   this._leftPin[1]);
				context.lineTo(this._leftFlap[0],  this._leftFlap[1]);
				context.closePath();

				context.lineWidth = this.lineThickness;
				context.lineJoin = 'round';
				context.strokeStyle = this.lineColor;
				context.stroke();
			}
		},

		_headOffset: function(out, parallelComponent, normalComponent) {
			// Scale the direction and normal vectors by different scalars to offset from the head location
			out[0] = this._direction[0] * parallelComponent + this._normal[0] * normalComponent + this.head[0];
			out[1] = this._direction[1] * parallelComponent + this._normal[1] * normalComponent + this.head[1];
		}

	});

	return ArrowGraphic;
});