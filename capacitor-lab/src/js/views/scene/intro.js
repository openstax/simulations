define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var CapacitorLabSceneView = require('views/scene');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var IntroSceneView = CapacitorLabSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            CapacitorLabSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            CapacitorLabSceneView.prototype.initGraphics.apply(this, arguments);

            var Capacitor = require('models/capacitor');
            var capacitor = new Capacitor({
                plateWidth: 0.1,
                plateHeight: 0.005,
                plateSeparation: 0.01
            });

            var CapacitorShapeCreator = require('shape-creators/capacitor');
            var shapeCreator = new CapacitorShapeCreator(capacitor, this.mvt);

            var graphics = new PIXI.Graphics();
            graphics.lineStyle(1, 0x000000, 1);
            graphics.beginFill(0xFF5555, 1);
            graphics.drawPiecewiseCurve(shapeCreator.createBottomPlateShape());
            graphics.endFill();

            graphics.beginFill(0x5555FF, 1);
            graphics.drawPiecewiseCurve(shapeCreator.createTopPlateShape());
            graphics.endFill();
            this.stage.addChild(graphics);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return IntroSceneView;
});
