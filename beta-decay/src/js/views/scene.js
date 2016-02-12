define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    // CSS
    require('less!beta-decay/styles/scene');

    /**
     *
     */
    var BetaDecaySceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        }

    });

    return BetaDecaySceneView;
});
