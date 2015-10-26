define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var FaradaySceneView  = require('views/scene');

    var BFieldInsideView = require('views/bfield/inside');
    var PickupCoilView   = require('views/pickup-coil');

    var Assets = require('assets');

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

            this.pickupCoilView.update(time, deltaTime, paused);
        },

        showInsideBarMagnet: function() {
            this.bFieldInsideView.show();
        },

        hideInsideBarMagnet: function() {
            this.bFieldInsideView.hide();
        },

        showPickupCoilElectrons: function() {
            this.pickupCoilView.showElectrons();
        },

        hidePickupCoilElectrons: function() {
            this.pickupCoilView.hideElectrons();
        }

    });

    return PickupCoilSceneView;
});
