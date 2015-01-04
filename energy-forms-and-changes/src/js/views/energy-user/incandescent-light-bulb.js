define(function(require) {

    'use strict';

    var _ = require('underscore');
    var PIXI = require('pixi');
    var Vector2 = require('common/math/vector2');

    var Colors         = require('common/colors/colors');
    var EnergyUserView = require('views/energy-user');

    var Constants = require('constants');

    var IncandescentLightBulbView = EnergyUserView.extend({

        /**
         *
         */
        initialize: function(options) {
            EnergyUserView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:litProportion', this.updateLitProportion);
        },

        initGraphics: function() {
            EnergyUserView.prototype.initGraphics.apply(this);

            this.backLayer = new PIXI.DisplayObjectContainer();
            this.frontLayer = new PIXI.DisplayObjectContainer();

            this.initLightRays();
            this.initImages();

            this.drawDebugOrigin();

            // Make sure it's lit the right amount to start
            this.updateLitProportion(this.model, this.model.get('litProportion'));
        },

        initLightRays: function() {
            var rays = new PIXI.DisplayObjectContainer();
            this.lightRays = rays;



            this.backLayer.addChild(rays);
        },

        initImages: function() {
            var straightWire = this.createSpriteWithOffset(Assets.Images.WIRE_BLACK_62,      new Vector2(-0.036, -0.04));
            var curvedWire   = this.createSpriteWithOffset(Assets.Images.WIRE_BLACK_RIGHT,   new Vector2(-0.009, -0.016));
            var baseBack     = this.createSpriteWithOffset(Assets.Images.ELEMENT_BASE_BACK);
            var baseFront    = this.createSpriteWithOffset(Assets.Images.ELEMENT_BASE_FRONT);
            var unlitBulb    = this.createSpriteWithOffset(Assets.Images.INCANDESCENT_2,     new Vector2(0, 0.055));
            var litBulb      = this.createSpriteWithOffset(Assets.Images.INCANDESCENT_ON_3,  new Vector2(0, 0.055));
            this.litBulb = litBulb; // We need to remember this one

            // Fudging

            this.backLayer.addChild(straightWire);
            this.backLayer.addChild(curvedWire);
            this.backLayer.addChild(baseBack);

            // [ then the energy chunks layer ]

            this.frontLayer.addChild(baseFront);
            this.frontLayer.addChild(unlitBulb);
            this.frontLayer.addChild(litBulb);
        },

        updateLitProportion: function(model, litProportion) {
            this.litBulb.alpha = litProportion;
            this.lightRays.alpha = litProportion;
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.backLayer.x = this.frontLayer.x = viewPoint.x;
            this.backLayer.y = this.frontLayer.y = viewPoint.y;
        }

    });

    return IncandescentLightBulbView;
});