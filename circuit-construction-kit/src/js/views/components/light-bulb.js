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
    var LightBulbView = RectangularComponentView.extend({

        imagePath:     Assets.Images.BULB_OFF,
        maskImagePath: Assets.Images.BULB_MASK,

        contextMenuContent: 
            '<li><a class="change-resistance-btn"><span class="fa fa-bolt"></span>&nbsp; Change Resistance</a></li>' +
            '<li><a class="flip-btn"><span class="fa fa-arrows-h"></span>&nbsp; Show Connection at Left</a></li>' +
            '<li><a class="show-value-btn"><span class="fa fa-square-o"></span>&nbsp; Show Value</a></li>' +
            '<hr>' +
            RectangularComponentView.prototype.contextMenuContent,

        /**
         * Initializes the new LightBulbView.
         */
        initialize: function(options) {
            RectangularComponentView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            this.onSprite = Assets.createSprite(Assets.Images.BULB_ON);
            this.onSprite.anchor.y = 0.5;
            this.onSprite.alpha = 0;

            RectangularComponentView.prototype.initGraphics.apply(this, arguments);

            this.displayObject.addChild(this.onSprite);
        },

        initContextMenu: function($contextMenu) {
            RectangularComponentView.prototype.initContextMenu.apply(this, arguments);

            this.initShowValueMenuItem($contextMenu);
            this.initChangeResistanceMenuItem($contextMenu);
        },

    });

    return LightBulbView;
});