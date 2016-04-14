define(function(require) {

    'use strict';

    var AppView       = require('common/v3/app/app');
    var PixiSceneView = require('common/v3/pixi/view/scene');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var NuclearPhysicsSceneView = PixiSceneView.extend({

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Calculates and returns the width from the space left between the other panels
         */
        getWidthBetweenPanels: function() {
            if (AppView.windowIsShort())
                return this.width - this.getLeftPadding() - this.getRightPadding() - 12 * 2;
            else
                return this.width - this.getRightPadding() - 20 * 2;
        },

        getLeftPadding: function() {
            var $leftPanel = this.$el.parents('.sim-view').find('.sim-controls-left');
            if (AppView.windowIsShort())
                return $leftPanel.outerWidth() + 12;
            else
                return 0;
        },

        getRightPadding: function() {
            var $rightPanel = this.$el.parents('.sim-view').find('.sim-controls-right');
            if ($rightPanel.length === 0)
                return 0;
            if (AppView.windowIsShort())
                return $rightPanel.outerWidth() + 12;
            else
                return $rightPanel.outerWidth() + 20;
        },

        getTopPadding: function() {
            return 0;
        },

        getBottomPadding: function() {
            return 0;
        },

        getAvailableWidth: function() {
            return this.width - this.getLeftPadding() - this.getRightPadding();
        },

        getAvailableHeight: function() {
            return this.height - this.getTopPadding() - this.getBottomPadding();
        },

    });

    return NuclearPhysicsSceneView;
});
