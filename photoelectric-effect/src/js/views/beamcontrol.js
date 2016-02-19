define(function(require) {

    'use strict';

    var $          = require('jquery');
    var PIXI       = require('pixi');
    var NoUiSlider = require('nouislider');
                     require('wnumb');

    var PixiView         = require('common/v3/pixi/view');
    var WavelengthColors = require('common/colors/wavelength');

    var Assets    = require('assets');
    var Constants = require('constants');

    // CSS
    // require('css!../../../bower_components/nouislider/distribute/nouislider.min.css');
    require('less!styles/beamcontrol.less');

    var BeamControlView = PixiView.extend({
        events: {},

        initialize: function(options) {
            this.mvt = options.mvt;

            this.initBeamControl();
            this.initGraphics();

            this.listenTo(this.model, 'change:wavelength', this.drawLightRect);
            this.listenTo(this.model, 'change:intensity', this.drawLightRect);
        },

        initBeamControl: function() {
            var intensitySlider = $('.intensitySlider')[0];
            var intensitySliderLabel = $('.intensitySliderLabel')[0];
            var wavelengthSlider = $('.wavelengthSlider')[0];
            var wavelengthSliderLabel = $('.wavelengthSliderLabel')[0];
            var model = this.model;

             NoUiSlider.create(wavelengthSlider, {
                start: 400,
                step: 1,
                range: {
                    'min': 100,
                    'max': 850
                },
                format: wNumb({
                    'decimals': 0,
                    'postfix': ' nm'
                })
            });
            wavelengthSlider.noUiSlider.on('update', function(values, handle) {
                // '571 nm' -> 571
                var wavelength = values[handle].replace(/(^\d+)(.+$)/i,'$1');
                wavelengthSliderLabel.innerHTML = values[handle];
                model.set('wavelength', wavelength);

                $('.intensitySlider').css('background', 'linear-gradient(to right, #000000 0%, ' +
                                          WavelengthColors.nmToHex(wavelength) + ' 100%)');
            });
            $('.wavelengthSlider').css(
                'background', 
                'linear-gradient(to right, #5b5b5b 0%, ' + '#5b5b5b 30%, ' +
                    WavelengthColors.nmToHex(380) + ' 30%, ' +
                    WavelengthColors.nmToHex(415) + ' 35%, ' +
                    WavelengthColors.nmToHex(435) + ' 40%, ' +
                    WavelengthColors.nmToHex(485) + ' 46%, ' +
                    WavelengthColors.nmToHex(515) + ' 51%, ' +
                    WavelengthColors.nmToHex(575) + ' 57%, ' +
                    WavelengthColors.nmToHex(650) + ' 65%, ' +
                    WavelengthColors.nmToHex(780) + ' 80%, ' +
                    '#5b5b5b 80%, #5b5b5b 100%)'
            );

            NoUiSlider.create(intensitySlider, {
                start: 0,
                range: {
                    'min': 0,
                    'max': 100
                },
                format: wNumb({
                    'decimals': 0,
                    'postfix': '%'
                })
            });

            intensitySlider.noUiSlider.on('update', function(values, handle) {
                model.set('intensity', values[handle].replace(/(^\d+)(.+$)/i,'$1'));
                intensitySliderLabel.innerHTML = values[handle];
            });
        },

        initGraphics: function() {
            var beamControlBackground = Assets.createSprite(Assets.Images.PEBEAMCONTROL);
            beamControlBackground.x = 350;
            beamControlBackground.y = 25;
            this.beamControlBackground = beamControlBackground;
            this.displayObject.addChild(this.beamControlBackground);

            this.lightLayer = new PIXI.Container();
            this.lightLayer.x = 380;
            this.lightLayer.y = 48;
            this.displayObject.addChild(this.lightLayer);

            var flashlight = Assets.createSprite(Assets.Images.FLASHLIGHT);
            flashlight.anchor.x = 0.5;
            flashlight.anchor.y = 0.5;
            this.flashlight = flashlight;
            this.lightLayer.addChild(this.flashlight);

            this.lightLayer.rotation = -3.98

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawLightRect();
        },

        drawLightRect: function() {
            var lightRect = new PIXI.Graphics();
            var color = parseInt(WavelengthColors.nmToHex(this.model.get('wavelength')).substring(1), 16);
            var intensity = this.model.get('intensity');
            intensity = (intensity>45) ? 45 : intensity; // Visually, these colors are not
                                                         // entirely saturated.

            // Draw light rect.
            lightRect.beginFill(color, (intensity/100));
            lightRect.drawPolygon(
                new PIXI.Point((this.flashlight.x+((this.flashlight.width/2)-5)),
                               -(this.flashlight.height/2)),
                new PIXI.Point((this.flashlight.x+((this.flashlight.width/2)-5)) + 275,
                               -(this.flashlight.height/2)),
                new PIXI.Point((this.flashlight.x+((this.flashlight.width/2)-5)) + 200,
                               (this.flashlight.height/2)),
                new PIXI.Point((this.flashlight.x+((this.flashlight.width/2)-5)),
                               (this.flashlight.height/2))
            );
            lightRect.endFill();

            // Draw the ellipse filling the flashlight with
            // full saturation.
            lightRect.beginFill(color, 1);
            lightRect.drawEllipse((this.flashlight.x + (this.flashlight.width/2)-5.5),
                                  0,
                                  5.5,
                                  (this.flashlight.height/2));
            lightRect.endFill();

            if (this.lightRect) this.lightLayer.removeChild(this.lightRect);
            this.lightRect = lightRect;
            this.lightLayer.addChild(this.lightRect);

            // Re-order such that the flashlight is drawn on top.
            var tmp = this.flashlight;
            this.lightLayer.removeChild(tmp);
            this.lightLayer.addChild(tmp);
        }
    }, Constants.BeamControlView);
    
    return BeamControlView;
});
