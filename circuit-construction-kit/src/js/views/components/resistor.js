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
    var ResistorView = RectangularComponentView.extend({

        imagePath:     Assets.Images.RESISTOR,
        maskImagePath: Assets.Images.RESISTOR_MASK,

        contextMenuContent: 
            '<li><a class="change-resistance-btn"><span class="fa fa-bolt"></span>&nbsp; Change Resistance</a></li>' +
            '<li><a class="show-value-btn"><span class="fa fa-square-o"></span>&nbsp; Show Value</a></li>' +
            RectangularComponentView.prototype.contextMenuContent,

        /**
         * Initializes the new ResistorView.
         */
        initialize: function(options) {
            RectangularComponentView.prototype.initialize.apply(this, [options]);
        },

        initContextMenu: function($contextMenu) {
            RectangularComponentView.prototype.initContextMenu.apply(this, arguments);

            this.initShowValueMenuItem($contextMenu);
            this.initChangeResistanceMenuItem($contextMenu);
        }

    });

    return ResistorView;
});