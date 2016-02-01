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

        schematicImagePath:     Assets.Images.SCHEMATIC_BATTERY,
        schematicMaskImagePath: Assets.Images.SCHEMATIC_BATTERY_MASK,

        contextMenuContent: 
            '<li><a class="change-voltage-btn"><span class="fa fa-bolt"></span>&nbsp; Change Voltage</a></li>' +
            '<li><a class="change-internal-resistance-btn"><span class="fa fa-bolt"></span>&nbsp; Change Internal Resistance</a></li>' +
            '<li><a class="reverse-btn"><span class="fa fa-arrows-h"></span>&nbsp; Reverse</a></li>' +
            '<li><a class="show-value-btn"><span class="fa fa-square-o"></span>&nbsp; Show Value</a></li>' +
            '<hr>' +
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
            this.initChangeInternalResistanceMenuItem($contextMenu);
            this.initReverseMenuItem($contextMenu);
        },

        getLabelText: function() {
            var voltage = Math.abs(this.model.getVoltageDrop()).toFixed(2);
            var text = voltage + ' Volts';

            if (this.model.get('internalResistanceOn'))
                return text + '\n' + RectangularComponentView.prototype.getLabelText.apply(this, arguments);
            else
                return text;
        }

    });

    return BatteryView;
});