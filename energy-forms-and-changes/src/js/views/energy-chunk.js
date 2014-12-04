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
			this.mvt = options.mvt;

			this.listenTo(this.model, 'change:visible',    this.updateVisibility);
			this.listenTo(this.model, 'change:zPosition',  this.updateTransparency);
			this.listenTo(this.model, 'change:energyType', this.updateEnergyType);
			this.listenTo(this.model, 'change:position',   this.updatePosition);

			this.initGraphics();
		},

		initGraphics: function() {
			initTextures();
			
			this.symbol = new PIXI.Sprite(Textures[this.model.get('energyType')]);
			this.symbol.anchor.x = 0.5;
			this.symbol.anchor.y = 0.5;
			this.displayObject.addChild(this.symbol);

			this.E = new PIXI.Text('E');
			this.displayObject.addChild(this.E);
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
			var viewPoint = this.mvt.modelToView(position);
			this.displayObject.x = viewPoint.x;
			this.displayObject.y = viewPoint.y;
		}

	}, Constants.EnergyChunkView);

	return EnergyChunkView;
});