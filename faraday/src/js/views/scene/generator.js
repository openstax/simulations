define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var FaradaySceneView  = require('views/scene');

    var Constants = require('constants');

    /**
     *
     */
    var GeneratorSceneView = FaradaySceneView.extend({

        initialize: function(options) {
            FaradaySceneView.prototype.initialize.apply(this, arguments);

            this.magnetModel = this.simulation.barMagnet;
        },

        initGraphics: function() {
            FaradaySceneView.prototype.initGraphics.apply(this, arguments);

            this.initCompass();
            this.initFieldMeter();
            this.initPickupCoil();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            FaradaySceneView.prototype._update.apply(this, arguments);

            this.pickupCoilView.update(time, deltaTime, paused);
        }

    });

    return GeneratorSceneView;
});
