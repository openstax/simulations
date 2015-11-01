define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var FaradaySceneView  = require('views/scene');

    var Constants = require('constants');

    /**
     *
     */
    var TransformerSceneView = FaradaySceneView.extend({

        initialize: function(options) {
            FaradaySceneView.prototype.initialize.apply(this, arguments);

            this.magnetModel = this.simulation.electromagnet;
        },

        initGraphics: function() {
            FaradaySceneView.prototype.initGraphics.apply(this, arguments);

            this.initCompass();
            this.initFieldMeter();
            this.initElectromagnet();
            this.initPickupCoil();

            this.hideCompass();
        },

        reset: function() {
            FaradaySceneView.prototype.reset.apply(this, arguments);

            this.electromagnetView.reset();
            this.pickupCoilView.reset();
            this.hideCompass();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            FaradaySceneView.prototype._update.apply(this, arguments);

            this.electromagnetView.update(time, deltaTime, paused);
            this.pickupCoilView.update(time, deltaTime, paused);
        }

    });

    return TransformerSceneView;
});
