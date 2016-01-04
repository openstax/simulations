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
    var SeriesAmmeterView = RectangularComponentView.extend({

        imagePath:     Assets.Images.SERIES_AMMETER,
        maskImagePath: Assets.Images.SERIES_AMMETER_MASK,
        topImagePath:  Assets.Images.SERIES_AMMETER_TOP,

        schematicImagePath:     Assets.Images.SCHEMATIC_BATTERY,
        schematicMaskImagePath: Assets.Images.SCHEMATIC_BATTERY_MASK,

        /**
         * Initializes the new SeriesAmmeterView.
         */
        initialize: function(options) {
            RectangularComponentView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            this.topLayer = new PIXI.Container();

            RectangularComponentView.prototype.initGraphics.apply(this, arguments);
        },

        initComponentGraphics: function() {
            this.topTexture = Assets.Texture(this.topImagePath);

            this.topSprite = new PIXI.Sprite(this.topTexture);
            this.topSprite.anchor.x = this.anchorX;
            this.topSprite.anchor.y = this.anchorY;

            this.topLayer.addChild(this.topSprite);

            RectangularComponentView.prototype.initComponentGraphics.apply(this, arguments);
        },

        updateComponentGraphics: function() {
            // this.sprite.texture = this.circuit.get('schematic') ? this.schematicTexture : this.texture;
            RectangularComponentView.prototype.updateComponentGraphics.apply(this, arguments);
        },

        update: function() {
            RectangularComponentView.prototype.update.apply(this, arguments);

            this.topLayer.scale.x = this.displayObject.scale.x;
            this.topLayer.scale.y = this.displayObject.scale.y;
            this.topLayer.x = this.displayObject.x;
            this.topLayer.y = this.displayObject.y;
            this.topLayer.rotation = this.displayObject.rotation;
        },

    });

    return SeriesAmmeterView;
});