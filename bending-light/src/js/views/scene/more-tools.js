define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                             require('common/v3/pixi/dash-to');
    var PixiToImage        = require('common/v3/pixi/pixi-to-image');
    var Colors             = require('common/colors/colors');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var WaveSensor = require('models/wave-sensor');

    var IntroSceneView        = require('views/scene/intro');
    var LaserView             = require('views/laser');
    var MediumView            = require('views/medium');
    var ProtractorView        = require('views/protractor');
    var WaveSensorView        = require('views/wave-sensor');

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
        },

        initWaveSensorView: function() {
            this.waveSensorView = new WaveSensorView({
                model: this.simulation.waveSensor,
                mvt: this.mvt
            });
            //this.waveSensorView.hide();

            this.topLayer.addChild(this.waveSensorView.displayObject);
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
        }

    });

    return MoreToolsSceneView;
});
