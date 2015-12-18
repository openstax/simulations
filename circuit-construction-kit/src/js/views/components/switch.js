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
    var SwitchView = RectangularComponentView.extend({

        imagePath:     Assets.Images.SWITCH_BASE,
        maskImagePath: Assets.Images.SWITCH_MASK,

        anchorY: 0.68,

        /**
         * Initializes the new SwitchView.
         */
        initialize: function(options) {
            RectangularComponentView.prototype.initialize.apply(this, [options]);
        },

        initComponentGraphics: function() {
            RectangularComponentView.prototype.initComponentGraphics.apply(this, arguments);

            this.handle = Assets.createSprite(Assets.Images.SWITCH_HANDLE);
            this.handle.anchor.x = 1;
            this.handle.anchor.y = 0.5;
            this.handle.x = 305;
            this.handle.y = -61;
            this.handle.buttonMode = true;
            this.handle.defaultCursor = 'move';

            this.pivot = Assets.createSprite(Assets.Images.SWITCH_BASE_PIVOT);
            this.pivot.anchor.y = 1;
            this.pivot.x = 290;
            this.pivot.y = -31;

            this.sprite.addChild(this.handle);
            this.sprite.addChild(this.pivot);
        },

    });

    return SwitchView;
});