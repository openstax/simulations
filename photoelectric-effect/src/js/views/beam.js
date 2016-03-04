define(function(require) {

    'use strict';

    var $    = require('jquery');
    var PIXI = require('pixi');

    var PixiView         = require('common/v3/pixi/view');
                           require('common/v3/pixi/extensions');
    var WavelengthColors = require('common/colors/wavelength');
    var Colors           = require('common/colors/colors');

    var Assets    = require('assets');
    var Constants = require('constants');

    var BeamView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            this.listenTo(this.model, 'change:wavelength',       this.drawLight);
            this.listenTo(this.model, 'change:photonsPerSecond', this.drawLight);
        },

        initGraphics: function() {
            this.lightLayer = new PIXI.Container();
            this.lightLayer.x = 380;
            this.lightLayer.y = 48;
            this.displayObject.addChild(this.lightLayer);

            this.lightGraphics = new PIXI.Graphics();
            this.lightLayer.addChild(this.lightGraphics);

            var flashlight = Assets.createSprite(Assets.Images.FLASHLIGHT);
            flashlight.anchor.x = 0.5;
            flashlight.anchor.y = 0.5;
            this.flashlight = flashlight;
            this.lightLayer.addChild(this.flashlight);

            this.lightLayer.rotation = -3.98;

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            // Transform the light-beam piecewise curve into view space and save it
            this.lightCurve = mvt.modelToView(this.model.getBounds());

            this.drawLight();
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

            graphics.clear();
            // Draw light beam
            graphics.beginFill(color, alpha);
            // graphics.drawPiecewiseCurve(this.lightCurve);
            graphics.drawPolygon(
                new PIXI.Point((this.flashlight.x+((this.flashlight.width/2)-5)),
                               -(this.flashlight.height/2)),
                new PIXI.Point((this.flashlight.x+((this.flashlight.width/2)-5)) + 275,
                               -(this.flashlight.height/2)),
                new PIXI.Point((this.flashlight.x+((this.flashlight.width/2)-5)) + 200,
                               (this.flashlight.height/2)),
                new PIXI.Point((this.flashlight.x+((this.flashlight.width/2)-5)),
                               (this.flashlight.height/2))
            );
            graphics.endFill();

            // Draw the ellipse filling the flashlight with full saturation.
            graphics.beginFill(color, 1);
            graphics.drawEllipse(
                (this.flashlight.x + (this.flashlight.width / 2) - 5.5), 0,
                5.5, (this.flashlight.height/2)
            );
            graphics.endFill();
        }

    }, Constants.BeamView);
    
    return BeamView;
});
