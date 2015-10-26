define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var FaradaySceneView  = require('views/scene');

    var BFieldInsideView = require('views/bfield/inside');

    var Assets = require('assets');

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

    return BarMagnetSceneView;
});
