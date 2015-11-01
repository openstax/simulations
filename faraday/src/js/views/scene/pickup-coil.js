define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var FaradaySceneView  = require('views/scene');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var PickupCoilSceneView = FaradaySceneView.extend({

        initialize: function(options) {
            FaradaySceneView.prototype.initialize.apply(this, arguments);

            this.magnetModel = this.simulation.barMagnet;
        },

        initGraphics: function() {
            FaradaySceneView.prototype.initGraphics.apply(this, arguments);

            this.initCompass();
            this.initBarMagnet();
            this.initInsideBField();
            this.initPickupCoil();

            this.hideCompass();
        },

        reset: function() {
            this.pickupCoilView.reset();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            FaradaySceneView.prototype._update.apply(this, arguments);

            this.pickupCoilView.update(time, deltaTime, paused);
        }

    });

    return PickupCoilSceneView;
});
