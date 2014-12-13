define(function(require) {

	'use strict';

	//var _    = require('underscore');
	var PIXI = require('pixi');

	var PixiView = require('common/pixi/view');

	var EnergyChunk = require('models/energy-chunk');
	var Constants   = require('constants');
	var Assets      = require('assets');

	var Textures;
	var initTextures = function() {
		if (!Textures) {
			Textures = {};
			Textures[EnergyChunk.THERMAL]    = Assets.Texture(Assets.Images.E_THERM_BLANK_ORANGE);
			Textures[EnergyChunk.ELECTRICAL] = Assets.Texture(Assets.Images.E_ELECTRIC_BLANK);
			Textures[EnergyChunk.MECHANICAL] = Assets.Texture(Assets.Images.E_MECH_BLANK);
			Textures[EnergyChunk.LIGHT]      = Assets.Texture(Assets.Images.E_LIGHT_BLANK);
			Textures[EnergyChunk.CHEMICAL]   = Assets.Texture(Assets.Images.E_CHEM_BLANK_LIGHT);
			Textures[EnergyChunk.HIDDEN]     = Assets.Texture(Assets.Images.E_DASHED_BLANK);
		}	
	};

	/**
	 * A view that represents the air model
	 */
	var EnergyChunkView = PixiView.extend({

		/**
		 *
		 */
		initialize: function(options) {
			if (options.mvt === undefined)
				throw 'EnergyChunkView requires a ModelViewTransform object specified in the options as "mvt".';

			this.mvt = options.mvt;

			this.listenTo(this.model, 'change:visible',    this.updateVisibility);
			this.listenTo(this.model, 'change:zPosition',  this.updateTransparency);
			this.listenTo(this.model, 'change:energyType', this.updateEnergyType);
			this.listenTo(this.model, 'change:position',   this.positionUpdated);

			this.initGraphics();

			this._point = new PIXI.Point();
		},

		initGraphics: function() {
			initTextures();
			
			this.symbol = new PIXI.Sprite(Textures[this.model.get('energyType')]);
			this.symbol.anchor.x = 0.5;
			this.symbol.anchor.y = 0.5;
			this.displayObject.addChild(this.symbol);

			this.E = new PIXI.Text('E', { font: 'bold 18px Arial' });
			this.E.anchor.x = 0.5;
			this.E.anchor.y = 0.4;
			this.displayObject.addChild(this.E);

			var scale = this.mvt.modelToViewDeltaX(EnergyChunkView.WIDTH) / this.symbol.width;

			this.displayObject.scale.x = this.displayObject.scale.y = scale;
		},

		updateVisibility: function(model, visible) {
			this.displayObject.visible = visible;
		},

		updateTransparency: function(model, zPosition) {
			var zFadeValue;
			if (zPosition < 0)
				zFadeValue = Math.max((EnergyChunkView.Z_DISTANCE_WHERE_FULLY_FADED + zPosition) / EnergyChunkView.Z_DISTANCE_WHERE_FULLY_FADED, 0);
			else
				zFadeValue = 1;
			this.displayObject.alpha = zFadeValue;
		},

		updateEnergyType: function(model, energyType) {
			this.displayObject.texture = Textures[energyType];
		},

		updatePosition: function(model, position) {
			if (this.displayObject.parent) {
				var globalPoint = this.mvt.modelToView(position);
	            var localPoint = this.displayObject.parent.toLocal(globalPoint);
	            this.displayObject.x = localPoint.x;
	            this.displayObject.y = localPoint.y;	
	            console.log(localPoint.x.toFixed(1) + ', ' + localPoint.y.toFixed(1));
			}
			else {
				console.log('not ready to update position yet');
			}
		},

		positionUpdated: function() {
			this.updateOnNextFrame = true;
		},

		update: function(time, deltaTime) {
			if (this.updateOnNextFrame) {
				this.updateOnNextFrame = false;
				this.updatePosition(this.model, this.model.get('position'));
			}
		}

	}, Constants.EnergyChunkView);

	return EnergyChunkView;
});