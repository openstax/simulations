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

        schematicImagePath:     Assets.Images.SCHEMATIC_SERIES_AMMETER,
        schematicMaskImagePath: Assets.Images.SCHEMATIC_SERIES_AMMETER_MASK,

        /**
         * Initializes the new SeriesAmmeterView.
         */
        initialize: function(options) {
            RectangularComponentView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:current', this.updateAmperage);
        },

        detach: function() {
            RectangularComponentView.prototype.detach.apply(this, arguments);

            if (this.topLayer.parent)
                this.topLayer.parent.removeChild(this.topLayer);
        },

        initGraphics: function() {
            this.topLayer = new PIXI.Container();

            RectangularComponentView.prototype.initGraphics.apply(this, arguments);

            this.initLabels();
        },

        initComponentGraphics: function() {
            this.topTexture = Assets.Texture(this.topImagePath);

            this.topSprite = new PIXI.Sprite(this.topTexture);
            this.topSprite.anchor.x = this.anchorX;
            this.topSprite.anchor.y = this.anchorY;

            this.topLayer.addChild(this.topSprite);

            RectangularComponentView.prototype.initComponentGraphics.apply(this, arguments);
        },

        initLabels: function() {
            var ammeter = new PIXI.Text('Ammeter', {
                font: '32px Helvetica Neue',
                fill: '#000'
            });
            ammeter.resolution = this.getResolution();
            ammeter.anchor.x = 0.5;
            ammeter.anchor.y = 0.5;
            ammeter.x = this.topSprite.width / 2;
            ammeter.y = -54;
            ammeter.alpha = 0.4;

            this.topLayer.addChild(ammeter);

            var amperage = new PIXI.Text('0.00 AMPS', {
                font: 'bold 40px Helvetica Neue',
                fill: '#000'
            });
            amperage.resolution = this.getResolution();
            amperage.anchor.x = 1;
            amperage.anchor.y = 0.5;
            amperage.x = this.topSprite.width - 124;
            amperage.y = 41;

            this.amperage = amperage;

            this.topLayer.addChild(amperage);
        },

        updateComponentGraphics: function() {
            this.topLayer.visible = !this.circuit.get('schematic');

            RectangularComponentView.prototype.updateComponentGraphics.apply(this, arguments);
        },

        updateGraphics: function() {
            RectangularComponentView.prototype.updateGraphics.apply(this, arguments);

            this.topLayer.scale.x = this.displayObject.scale.x;
            this.topLayer.scale.y = this.displayObject.scale.y;
            this.topLayer.x = this.displayObject.x;
            this.topLayer.y = this.displayObject.y;
            this.topLayer.rotation = this.displayObject.rotation;
        },

        updateAmperage: function(model, current) {
            if (Math.abs(current) > 9999)
                current = current.toFixed(0);
            else if (Math.abs(current) > 999)
                current = current.toFixed(1);
            else
                current = current.toFixed(2);
            this.amperage.text = current + ' AMPS';
        },

        showHoverGraphics: function() {
            RectangularComponentView.prototype.showHoverGraphics.apply(this, arguments);
            this.topLayer.visible = false; 
        },

        hideHoverGraphics: function() {
            RectangularComponentView.prototype.hideHoverGraphics.apply(this, arguments);
            this.topLayer.visible = !this.circuit.get('schematic'); 
        },

    });

    return SeriesAmmeterView;
});