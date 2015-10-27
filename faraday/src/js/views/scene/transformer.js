define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var FaradaySceneView  = require('views/scene');
    var CompassView       = require('views/compass');
    var ElectromagnetView = require('views/electromagnet');

    var BFieldInsideView = require('views/bfield/inside');
    var PickupCoilView   = require('views/pickup-coil');

    var Assets = require('assets');

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
        },

        initElectromagnet: function() {
            this.electromagnetView = new ElectromagnetView({
                mvt: this.mvt,
                model: this.simulation.electromagnet,
                simulation: this.simulation
            });

            this.bottomLayer.addChild(this.electromagnetView.backgroundLayer);
            this.topLayer.addChild(this.electromagnetView.foregroundLayer);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            FaradaySceneView.prototype._update.apply(this, arguments);

            this.electromagnetView.update(time, deltaTime, paused);
        },

        showElectromagnetElectrons: function() {
            this.electromagnetView.showElectrons();
        },

        hideElectromagnetElectrons: function() {
            this.electromagnetView.hideElectrons();
        }

    });

    return TransformerSceneView;
});
