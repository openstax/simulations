define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiToImage = require('common/v3/pixi/pixi-to-image');

    var RectangularComponentView = require('views/components/rectangular');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * A view that represents a resistor
     */
    var BatteryView = RectangularComponentView.extend({

        imagePath:     Assets.Images.BATTERY,
        maskImagePath: Assets.Images.BATTERY_MASK,

        contextMenuContent: 
            '<li><a class="change-voltage-btn"><span class="fa fa-bolt"></span>&nbsp; Change Voltage</a></li>' +
            '<li><a class="show-value-btn"><span class="fa fa-square-o"></span>&nbsp; Show Value</a></li>' +
            RectangularComponentView.prototype.contextMenuContent,

        /**
         * Initializes the new BatteryView.
         */
        initialize: function(options) {
            RectangularComponentView.prototype.initialize.apply(this, [options]);
        },

        initContextMenu: function($contextMenu) {
            RectangularComponentView.prototype.initContextMenu.apply(this, arguments);

            this.initShowValueMenuItem($contextMenu);
            this.initChangeVoltageMenuItem($contextMenu, true);
        },

    });

    return BatteryView;
});