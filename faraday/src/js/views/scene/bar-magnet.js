define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var FaradaySceneView = require('views/scene');
    var WiggleMeView     = require('views/wiggle-me');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var BarMagnetSceneView = FaradaySceneView.extend({

        initialize: function(options) {
            FaradaySceneView.prototype.initialize.apply(this, arguments);

            this.magnetModel = this.simulation.barMagnet;
        },

        initGraphics: function() {
            FaradaySceneView.prototype.initGraphics.apply(this, arguments);

            this.initCompass();
            this.initBarMagnet();
            this.initInsideBField();
            this.initWiggleMeView();
        },

        initWiggleMeView: function() {
            this.wiggleMeView = new WiggleMeView({
                mvt: this.mvt,
                simulation: this.simulation
            });

            this.topLayer.addChild(this.wiggleMeView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            FaradaySceneView.prototype._update.apply(this, arguments);

            this.wiggleMeView.update(time, deltaTime, paused);
        }

    });

    return BarMagnetSceneView;
});
