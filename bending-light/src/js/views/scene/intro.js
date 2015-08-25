define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Colors = require('common/colors/colors');

    var BendingLightSceneView = require('views/scene');
    var LaserView             = require('views/laser');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var IntroSceneView = BendingLightSceneView.extend({

        initialize: function(options) {
            BendingLightSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            BendingLightSceneView.prototype.initGraphics.apply(this, arguments);

            var color = this.simulation.bottomMedium.color;
            var hex = Colors.rgbToHexInteger(color.r, color.g, color.b);
            var graphics = new PIXI.Graphics();
            graphics.beginFill(hex, color.a);
            graphics.drawRect(0, this.height / 2, this.width, this.height / 2);
            graphics.endFill();

            this.stage.addChild(graphics);
        },

        initLaserView: function() {
            this.laserView = new LaserView({
                model: this.simulation.laser,
                mvt: this.mvt,
                rotateOnly: true
            });

            this.topLayer.addChild(this.laserView.displayObject);
        },

    });

    return IntroSceneView;
});
