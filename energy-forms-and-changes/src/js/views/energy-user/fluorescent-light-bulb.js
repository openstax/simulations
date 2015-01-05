define(function(require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var LightBulbView = require('views/energy-user/light-bulb');

    var Assets = require('assets');

    var Constants = require('constants');

    var FluorescentLightBulbView = LightBulbView.extend({

        initialize: function(options) {
            var bulbTexture = Assets.Texture(Assets.Images.FLUORESCENT_ON_FRONT_2);

            options = _.extend({
                lightRayColor: FluorescentLightBulbView.RAY_COLOR,
                lightRayCenter: new Vector2(0, -bulbTexture.height * 0.55)
            }, options);

            LightBulbView.prototype.initialize.apply(this, [options]);
        },

        initImages: function() {
            var bulbOffset = new Vector2(0, 0.04);

            var straightWire = this.createSpriteWithOffset(Assets.Images.WIRE_BLACK_62,          new Vector2(-0.036, -0.04));
            var curvedWire   = this.createSpriteWithOffset(Assets.Images.WIRE_BLACK_RIGHT,       new Vector2(-0.009, -0.016));
            var baseBack     = this.createSpriteWithOffset(Assets.Images.ELEMENT_BASE_BACK);
            var bulbBackOff  = this.createSpriteWithOffset(Assets.Images.FLUORESCENT_BACK_2,     bulbOffset);
            var bulbBackOn   = this.createSpriteWithOffset(Assets.Images.FLUORESCENT_ON_BACK_2,  bulbOffset);
            var baseFront    = this.createSpriteWithOffset(Assets.Images.ELEMENT_BASE_FRONT);
            var bulbFrontOff = this.createSpriteWithOffset(Assets.Images.FLUORESCENT_FRONT_2,    bulbOffset);
            var bulbFrontOn  = this.createSpriteWithOffset(Assets.Images.FLUORESCENT_ON_FRONT_2, bulbOffset);

            this.litBulbBack = bulbBackOn; // We need to remember this one
            this.litBulb     = bulbFrontOn; 

            // Fudging
            straightWire.x += 4;

            this.backLayer.addChild(straightWire);
            this.backLayer.addChild(curvedWire);
            this.backLayer.addChild(baseBack);
            this.backLayer.addChild(bulbBackOff);
            this.backLayer.addChild(bulbBackOn);

            // [ then the energy chunks layer ]

            this.frontLayer.addChild(baseFront);
            this.frontLayer.addChild(bulbFrontOff);
            this.frontLayer.addChild(bulbFrontOn);
        },

        updateLitProportion: function(model, litProportion) {
            LightBulbView.prototype.updateLitProportion.apply(this, [model, litProportion]);
            this.litBulbBack.alpha = litProportion;
        },

    }, Constants.FluorescentLightBulbView);

    return FluorescentLightBulbView;
});