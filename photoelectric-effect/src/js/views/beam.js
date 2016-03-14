define(function(require) {

    'use strict';

    var $    = require('jquery');
    var PIXI = require('pixi');

    var PixiView         = require('common/v3/pixi/view');
                           require('common/v3/pixi/extensions');
    var WavelengthColors = require('common/colors/wavelength');
    var Colors           = require('common/colors/colors');

    var PEffectSimulation = require('models/simulation');

    var Assets    = require('assets');
    var Constants = require('constants');

    var BeamView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.model, 'change:wavelength',       this.drawLight);
            this.listenTo(this.model, 'change:photonsPerSecond', this.drawLight);

            this.listenTo(this.simulation, 'change:viewMode', this.drawLight);
        },

        initGraphics: function() {
            this.beamLightGraphics = new PIXI.Graphics();
            this.lampLightGraphics = new PIXI.Graphics();
            this.mask = new PIXI.Graphics();

            this.flashlight = Assets.createSprite(Assets.Images.FLASHLIGHT);
            this.flashlight.anchor.x = 1;
            this.flashlight.anchor.y = 0.5;
            
            this.flashlightLayer = new PIXI.Container();
            this.flashlightLayer.addChild(this.lampLightGraphics);
            this.flashlightLayer.addChild(this.flashlight);

            this.displayObject.addChild(this.beamLightGraphics);
            this.displayObject.addChild(this.flashlightLayer);
            this.displayObject.addChild(this.mask);

            this.displayObject.mask = this.mask;

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            // Update mask
            this.mask.clear();
            this.mask.beginFill();
            this.mask.drawRect(this.mvt.modelToViewX(this.simulation.leftHandPlate.getX()), 0, 2000, 2000);
            this.mask.endFill();

            // Position and rotation of the flashlight layer
            this.updatePosition(this.model, this.model.get('position'));
            this.updateRotation();

            // Update the flashlight position and scale relative to the flashlight layer
            var targetWidth = this.mvt.modelToViewDeltaX(161);
            var scale = targetWidth / this.flashlight.width;
            this.flashlight.scale.x = scale;
            this.flashlight.scale.y = scale;
            this.flashlight.x = this.getLampRadiusA();

            // Transform the light-beam piecewise curve into view space and save it
            this.lightCurve = mvt.modelToView(this.model.getBounds());

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
            var beam = this.model;
            var color = Colors.parseHex(WavelengthColors.nmToHex(beam.get('wavelength')));
            var minLevel = 200;
            var colorMax = 255;
            // The power function here controls the ramp-up of actualColor intensity
            var level = Math.max(minLevel, colorMax - Math.floor((colorMax - minLevel) * Math.pow((beam.get('photonsPerSecond') / beam.get('maxPhotonsPerSecond')), 0.3)));
            var alpha = (colorMax - level) / colorMax;

            this.beamLightGraphics.clear();
            this.lampLightGraphics.clear();

            if (this.simulation.get('viewMode') === PEffectSimulation.BEAM_VIEW) {
                // Draw light beam
                this.beamLightGraphics.beginFill(color, alpha);
                this.beamLightGraphics.drawPiecewiseCurve(this.lightCurve);
                this.beamLightGraphics.endFill();
            }

            // Draw the ellipse filling the flashlight with full saturation.
            var radiusA = this.getLampRadiusA();
            this.lampLightGraphics.beginFill(color, 1);
            this.lampLightGraphics.drawEllipse(0, 0, radiusA, this.flashlight.height / 2);
            this.lampLightGraphics.endFill();
        },

        getLampRadiusA: function() {
            return this.flashlight.width * (6 / 161);
        }

    }, Constants.BeamView);
    
    return BeamView;
});
