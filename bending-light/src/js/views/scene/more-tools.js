define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                             require('common/v3/pixi/dash-to');
    var PixiToImage        = require('common/v3/pixi/pixi-to-image');
    var Colors             = require('common/colors/colors');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var WaveSensor     = require('models/wave-sensor');
    var VelocitySensor = require('models/velocity-sensor');

    var IntroSceneView        = require('views/scene/intro');
    var LaserView             = require('views/laser');
    var MediumView            = require('views/medium');
    var ProtractorView        = require('views/protractor');
    var WaveSensorView        = require('views/wave-sensor');
    var VelocitySensorView    = require('views/velocity-sensor');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var MoreToolsSceneView = IntroSceneView.extend({

        initialize: function(options) {
            IntroSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            IntroSceneView.prototype.initGraphics.apply(this, arguments);

            this.initWaveSensorView();
            this.initVelocitySensorView();
        },

        initWaveSensorView: function() {
            this.waveSensorView = new WaveSensorView({
                model: this.simulation.waveSensor,
                mvt: this.mvt
            });
            this.waveSensorView.hide();

            this.topLayer.addChild(this.waveSensorView.displayObject);
        },

        initVelocitySensorView: function() {
            this.velocitySensorView = new VelocitySensorView({
                model: this.simulation.velocitySensor,
                mvt: this.mvt
            });
            //this.velocitySensorView.hide();

            this.topLayer.addChild(this.velocitySensorView.displayObject);
        },

        getWaveSensorIcon: function() {
            var mvt = new ModelViewTransform.createSinglePointScaleMapping(new Vector2(0, 0), new Vector2(0, 0), 1);

            var waveSensor = new WaveSensor({
                probe1Position: new Vector2(-25, 0),
                probe2Position: new Vector2(-25, 40),
                bodyPosition:   new Vector2(25, 0)
            });

            var waveSensorView = new WaveSensorView({
                model: waveSensor,
                mvt: mvt
            });

            return PixiToImage.displayObjectToDataURI(waveSensorView.displayObject);
        },

        getVelocitySensorIcon: function() {
            var mvt = new ModelViewTransform.createSinglePointScaleMapping(new Vector2(0, 0), new Vector2(0, 0), 1);

            var velocitySensor = new VelocitySensor({
                position:   new Vector2(0, 0)
            });

            var velocitySensorView = new VelocitySensorView({
                model: velocitySensor,
                mvt: mvt
            });

            return PixiToImage.displayObjectToDataURI(velocitySensorView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            IntroSceneView.prototype._update.apply(this, arguments);

            this.waveSensorView.drawGraphs();
        },

    });

    return MoreToolsSceneView;
});
