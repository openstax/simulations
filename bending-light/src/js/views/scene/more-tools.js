define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
               require('common/v3/pixi/dash-to');

    var Colors = require('common/colors/colors');

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

            this.bottomLayer.addChild(this.waveSensorView.displayObject);
        },

    });

    return MoreToolsSceneView;
});
