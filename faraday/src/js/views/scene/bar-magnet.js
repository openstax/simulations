define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Rectangle = require('common/math/rectangle');

    var FaradaySceneView  = require('views/scene');
    var CompassView       = require('views/compass');
    var BFieldOutsideView = require('views/bfield/outside');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var BarMagnetSceneView = FaradaySceneView.extend({

        initGraphics: function() {
            FaradaySceneView.prototype.initGraphics.apply(this, arguments);

            this.initOutsideBField();
            this.initCompass();
        },

        initOutsideBField: function() {
            this.bFieldOutsideView = new BFieldOutsideView({
                mvt: this.mvt,
                magnetModel: this.simulation.barMagnet,
                xSpacing:    Constants.GRID_SPACING, 
                ySpacing:    Constants.GRID_SPACING,
                needleWidth: Constants.GRID_NEEDLE_WIDTH,
                bounds: new Rectangle(0, 0, this.width, this.height)
            });

            this.stage.addChild(this.bFieldOutsideView.displayObject);
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
