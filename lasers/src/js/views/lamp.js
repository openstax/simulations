define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView         = require('common/v3/pixi/view');
    var WavelengthColors = require('common/colors/wavelength');
    var Colors           = require('common/colors/colors');

    var Assets = require('assets');

    var LampView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            this.listenTo(this.model, 'change:wavelength',       this.drawLight);
            this.listenTo(this.model, 'change:photonsPerSecond', this.drawLight);
        },

        initGraphics: function() {
            this.lampLightGraphics = new PIXI.Graphics();

            this.flashlight = Assets.createSprite(Assets.Images.FLASHLIGHT);
            this.flashlight.anchor.x = 1;
            this.flashlight.anchor.y = 0.5;
            
            this.flashlightLayer = new PIXI.Container();
            this.flashlightLayer.addChild(this.lampLightGraphics);
            this.flashlightLayer.addChild(this.flashlight);

            this.displayObject.addChild(this.flashlightLayer);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            // Position and rotation of the flashlight layer
            this.updatePosition(this.model, this.model.get('position'));
            this.updateRotation();

            // Update the flashlight position and scale relative to the flashlight layer
            var targetWidth = this.mvt.modelToViewDeltaX(100);
            var scale = targetWidth / this.flashlight.width;
            this.flashlight.scale.x = scale;
            this.flashlight.scale.y = scale;
            this.flashlight.x = this.getLampRadiusA();

            this.drawLight();
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.flashlightLayer.x = viewPosition.x;
            this.flashlightLayer.y = viewPosition.y;
        },

        updateRotation: function() {
            this.flashlightLayer.rotation = this.model.getDirection();
        },

        drawLight: function() {
            var graphics = this.lightGraphics;
            var color = Colors.parseHex(WavelengthColors.nmToHex(this.model.get('wavelength')));

            this.lampLightGraphics.clear();

            // Draw the ellipse filling the flashlight with full saturation.
            var radiusA = this.getLampRadiusA();
            this.lampLightGraphics.beginFill(color, 1);
            this.lampLightGraphics.drawEllipse(0, 0, radiusA, this.flashlight.height / 2);
            this.lampLightGraphics.endFill();
        },

        getLampRadiusA: function() {
            return this.flashlight.width * (6 / 161);
        }

    });
    
    return LampView;
});
