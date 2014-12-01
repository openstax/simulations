define(function(require) {

	'use strict';

	//var _       = require('underscore');
	var PIXI    = require('pixi');
	var Vector2 = require('common/math/vector2');
	var PiecewiseCurve = require('common/math/piecewise-curve');

	var ElementView = require('views/element');
	var Beaker      = require('models/element/beaker');
	//var Assets      = require('assets');

	var Constants = require('constants');

	/**
	 * A view that represents a block model
	 */
	var BeakerView = ElementView.extend({

		/**
		 *
		 */
		initialize: function(options) {
			options = _.extend({
				fillColor: BeakerView.FILL_COLOR,
				fillAlpha: BeakerView.FILL_ALPHA,
				lineWidth: BeakerView.LINE_WIDTH,
				lineColor: BeakerView.LINE_COLOR,
				lineJoin:  'round',
				textFont:  BeakerView.TEXT_FONT
			}, options);

			ElementView.prototype.initialize.apply(this, arguments);

			this.initGraphics();
		},

		initGraphics: function() {

			this.backLayer  = new PIXI.DisplayObjectContainer();
			this.frontLayer = new PIXI.DisplayObjectContainer();
			this.grabLayer  = new PIXI.DisplayObjectContainer();

			this.displayObject.addChild(this.backLayer);
			this.displayObject.addChild(this.frontLayer);
			this.displayObject.addChild(this.grabLayer);
			
			// Get a version of the rectangle that defines the beaker size and
			//   location in the view.
			var beakerViewRect = this.mvt.modelToViewScale(this.model.getRawOutlineRect());
			
			// Create the shapes for the top and bottom of the beaker.  These are
			//   ellipses in order to create a 3D-ish look.
			var ellipseHeight = beakerViewRect.w * BeakerView.PERSPECTIVE_PROPORTION;


			// Outline style
			var lineStyle = {
				lineWidth:   this.lineWidth,
				strokeStyle: this.lineColor,
				lineJoin:    this.lineJoin
			};
			

			// Label
			this.label = new PIXI.Text(this.labelText, {
				font: this.textFont,
				fill: this.textColor
			});
			this.label.anchor.x = this.label.anchor.y = 0.5;
			this.label.x = blockFaceOffset.x;
			this.label.y = -(rect.h / 2) + blockFaceOffset.y;
			this.displayObject.addChild(this.label);


			// Calculate the bounding box for the dragging bounds
			this.boundingBox = beakerViewRect.clone();
		},

		showEnergyChunks: function() {
			
		},

		hideEnergyChunks: function() {
			
		}

	}, Constants.BeakerView);

	return BeakerView;
});