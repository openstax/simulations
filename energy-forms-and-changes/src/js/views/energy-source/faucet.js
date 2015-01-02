define(function(require) {

    'use strict';

    var _ = require('underscore');
    var PIXI = require('pixi');

    var EnergySourceView = require('views/energy-source');

    var Constants = require('constants');

    var FaucetView = EnergySourceView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            EnergySourceView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            this.waterLayer = new PIXI.DisplayObjectContainer();
            this.displayObject.addChild(this.waterLayer);

            var faucetFront = Assets.createSprite(Assets.Images.FAUCET_FRONT);
            var faucetPipe  = Assets.createSprite(Assets.Images.FAUCET_PIPE);
            var faucet = new PIXI.DisplayObjectContainer();
            faucet.addChild(faucetFront);
            faucet.addChild(faucetPipe);
            this.displayObject.addChild(faucet);
        }

    });

    return FaucetView;
});