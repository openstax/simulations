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
    var ACSourceView = RectangularComponentView.extend({

        imagePath:     Assets.Images.AC,
        maskImagePath: Assets.Images.AC_MASK,

        schematicImagePath:     Assets.Images.SCHEMATIC_AC,
        schematicMaskImagePath: Assets.Images.SCHEMATIC_AC_MASK,

        contextMenuContent: 
            '<li><a class="change-voltage-btn"><span class="fa fa-bolt"></span>&nbsp; Change Voltage</a></li>' +
            '<li><a class="change-internal-resistance-btn"><span class="fa fa-bolt"></span>&nbsp; Change Internal Resistance</a></li>' +
            '<li><a class="change-frequency-btn"><span class="fa fa-signal"></span>&nbsp; Change Frequency</a></li>' +
            '<li><a class="reverse-btn"><span class="fa fa-arrows-h"></span>&nbsp; Reverse</a></li>' +
            '<li><a class="show-value-btn"><span class="fa fa-square-o"></span>&nbsp; Show Value</a></li>' +
            '<hr>' +
            RectangularComponentView.prototype.contextMenuContent,

        /**
         * Initializes the new ACSourceView.
         */
        initialize: function(options) {
            RectangularComponentView.prototype.initialize.apply(this, [options]);
        },

        initContextMenu: function($contextMenu) {
            RectangularComponentView.prototype.initContextMenu.apply(this, arguments);

            this.initShowValueMenuItem($contextMenu);
            this.initChangeVoltageMenuItem($contextMenu);
            this.initChangeInternalResistanceMenuItem($contextMenu);
            this.initChangeFrequencyMenuItem($contextMenu);
            this.initReverseMenuItem($contextMenu);
        },

    });

    return ACSourceView;
});