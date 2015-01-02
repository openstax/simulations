define(function(require) {

    'use strict';

    var _ = require('underscore');
    var PIXI = require('pixi');

    var EnergySystemsElementView = require('views/energy-systems-element');

    var Constants = require('constants');

    // TODO: have it actually extend EnergySourceView
    var SunView = EnergySystemsElementView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            EnergySystemsElementView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            var graphics = new PIXI.Graphics();
            graphics.beginFill(0xFFFF00, 1);
            graphics.drawRect(0, 0, 50, 50);
            graphics.endFill();
            this.displayObject.addChild(graphics);
        }

    });

    return SunView;
});