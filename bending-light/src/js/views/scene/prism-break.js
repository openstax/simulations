define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                      require('common/v3/pixi/dash-to');
    var PixiToImage = require('common/v3/pixi/pixi-to-image');
    var Colors      = require('common/colors/colors');

    var BendingLightSceneView = require('views/scene');
    var LaserView             = require('views/laser');
    var MediumView            = require('views/medium');
    var ProtractorView        = require('views/protractor');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var PrismBreakSceneView = BendingLightSceneView.extend({

        initialize: function(options) {
            BendingLightSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            BendingLightSceneView.prototype.initGraphics.apply(this, arguments);

        },

        getPrismIcons: function() {
            var icons = [];

            

            return icons;
        }

    });

    return PrismBreakSceneView;
});
