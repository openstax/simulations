define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var FaradaySceneView = require('views/scene');
    var CompassView      = require('views/compass');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var BarMagnetSceneView = FaradaySceneView.extend({

        initGraphics: function() {
            FaradaySceneView.prototype.initGraphics.apply(this, arguments);

            this.initCompass();
        },

        initCompass: function() {
            this.compassView = new CompassView({
                mvt: this.mvt,
                model: this.simulation.compass
            });

            this.stage.addChild(this.compassView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            

        },

    });

    return BarMagnetSceneView;
});
