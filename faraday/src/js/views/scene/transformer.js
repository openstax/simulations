define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var FaradaySceneView  = require('views/scene');
    var CompassView       = require('views/compass');
    var ElectromagnetView = require('views/electromagnet');

    // Constants
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

        _update: function(time, deltaTime, paused, timeScale) {
            FaradaySceneView.prototype._update.apply(this, arguments);

            this.electromagnetView.update(time, deltaTime, paused);
            this.pickupCoilView.update(time, deltaTime, paused);
        }

    });

    return TransformerSceneView;
});
