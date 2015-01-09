define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Colors     = require('common/colors/colors');
    var SliderView = require('common/pixi/view/slider');
    var Rectangle  = require('common/math/rectangle');

    var EnergySourceView = require('views/energy-source');
    var BurnerView       = require('views/element/burner');
    var BurnerStandView  = require('views/element/burner-stand');

    var Constants = require('constants');

    var Assets = require('assets');

    var TeapotView = EnergySourceView.extend({

        initialize: function(options) {
            EnergySourceView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            EnergySourceView.prototype.initGraphics.apply(this);

            var teapotBounds = this.initTeapot();

            var burnerStandWidth = teapotBounds.w * 0.9;
            var burnerStandHeight = burnerStandWidth * 0.7;
            var burnerStandRect = new Rectangle(
                teapotBounds.center().x - burnerStandWidth / 2,
                teapotBounds.top() - 35,
                burnerStandWidth,
                burnerStandHeight
            );
            
            this.initBurnerView(burnerStandRect);
            this.initBurnerStandView(burnerStandRect);
            this.initSteam();
        },

        initTeapot: function() {
            var teapotSprite = this.createSpriteWithOffset(Assets.Images.TEAPOT_LARGE, Constants.Teapot.TEAPOT_OFFSET);
            this.displayObject.addChild(teapotSprite);

            var teapotSpriteBounds = teapotSprite.getBounds();

            return new Rectangle(
                teapotSprite.x,
                teapotSprite.y,
                teapotSprite.width,
                teapotSprite.height
            );
        },

        initBurnerView: function(burnerStandRect) {
            var burnerView = new BurnerView({
                model: this.model,
                mvt: this.mvt,
                width:  TeapotView.BURNER_WIDTH,
                height: TeapotView.BURNER_HEIGHT,
                openingHeight: TeapotView.BURNER_OPENING_HEIGHT,
                energyChunkCollection: this.model.energyChunks,
                coolingEnabled: false,
                sliderReturnsToCenter: false
            });
            this.burnerView = burnerView;

            this.displayObject.addChildAt(burnerView.frontLayer, 0);
            this.displayObject.addChildAt(burnerView.energyChunkLayer, 0);
            this.displayObject.addChildAt(burnerView.backLayer, 0);

            burnerView.setPosition(
                burnerStandRect.center().x,
                burnerStandRect.top() + 5
            );
        },

        initBurnerStandView: function(burnerStandRect) {
            var burnerStandView = new BurnerStandView({
                model: this.model,
                mvt: this.mvt,
                rectangle: burnerStandRect,
                projectedEdgeLength: burnerStandRect.w * 0.2
            });

            burnerStandView.stopListening(this.model, 'change:position');
            burnerStandView.setPosition(0, burnerStandRect.h);

            this.displayObject.addChildAt(burnerStandView.displayObject, 0);
        },

        initSteam: function() {

        },

        showEnergyChunks: function() {
            EnergySourceView.prototype.showEnergyChunks.apply(this);
            this.burnerView.showEnergyChunks();
        },

        hideEnergyChunks: function() {
            EnergySourceView.prototype.hideEnergyChunks.apply(this);
            this.burnerView.hideEnergyChunks();
        },

    }, Constants.TeapotView);

    return TeapotView;
});