define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
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
            
        },

        /**
         * Calculates and returns the width from the space left between the other panels
         */
        getWidthBetweenPanels: function() {
            var $simView = this.$el.parents('.sim-view');
            var $leftPanel  = $simView.find('.sim-controls-left');
            var $rightPanel = $simView.find('.sim-controls-right');

            if (AppView.windowIsShort())
                return this.$el.width() - $leftPanel.outerWidth() - $rightPanel.outerWidth() - 12 * 4;
            else
                return this.$el.width() - $leftPanel.outerWidth() - 20 * 3;
        }

    });

    return BetaDecaySceneView;
});
