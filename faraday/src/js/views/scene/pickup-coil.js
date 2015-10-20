define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var FaradaySceneView  = require('views/scene');
    var CompassView       = require('views/compass');
    var BarMagnetView     = require('views/bar-magnet');

    var BFieldInsideView = require('views/bfield/inside');
    var PickupCoilView   = require('views/pickup-coil');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var PickupCoilSceneView = FaradaySceneView.extend({

        initGraphics: function() {
            FaradaySceneView.prototype.initGraphics.apply(this, arguments);

            this.initCompass();
            this.initBarMagnet();
            this.initInsideBField();
            this.initPickupCoil();
        },

        initCompass: function() {
            this.compassView = new CompassView({
                mvt: this.mvt,
                model: this.simulation.compass,
                simulation: this.simulation
            });

            this.middleLayer.addChild(this.compassView.displayObject);
        },

        initBarMagnet: function() {
            this.barMagnetView = new BarMagnetView({
                mvt: this.mvt,
                model: this.simulation.barMagnet,
                simulation: this.simulation
            });

            this.middleLayer.addChild(this.barMagnetView.displayObject);
        },

        initInsideBField: function() {
            this.bFieldInsideView = new BFieldInsideView({
                mvt: this.mvt,
                magnetModel: this.simulation.barMagnet,
                needleWidth: Constants.GRID_NEEDLE_WIDTH
            });

            this.middleLayer.addChild(this.bFieldInsideView.displayObject);

            this.bFieldInsideView.hide();
        },

        initPickupCoil: function() {
            this.pickupCoilView = new PickupCoilView({
                mvt: this.mvt,
                model: this.simulation.pickupCoil,
                simulation: this.simulation
            });

            this.bottomLayer.addChild(this.pickupCoilView.backgroundLayer);
            this.topLayer.addChild(this.pickupCoilView.foregroundLayer);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            FaradaySceneView.prototype._update.apply(this, arguments);

        },

        showInsideBarMagnet: function() {
            this.bFieldInsideView.show();
        },

        hideInsideBarMagnet: function() {
            this.bFieldInsideView.hide();
        }

    });

    return PickupCoilSceneView;
});
