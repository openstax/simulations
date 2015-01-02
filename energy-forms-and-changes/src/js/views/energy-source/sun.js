define(function(require) {

    'use strict';

    var _ = require('underscore');
    var PIXI = require('pixi');

    var EnergySourceView = require('views/energy-source');

    var Constants = require('constants');

    var SunView = EnergySourceView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            EnergySourceView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            EnergySourceView.prototype.initGraphics.apply(this);
            
            var graphics = new PIXI.Graphics();
            graphics.beginFill(0xFFFF00, 1);
            graphics.drawRect(0, 0, 50, 50);
            graphics.endFill();
            this.displayObject.addChild(graphics);
        }

    });

    return SunView;
});