define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var BodyView = require('views/body');

    var Assets = require('assets');

    /**
     * A view that represents a moon.
     */
    var MoonView = BodyView.extend({

        textureBodyWidthRatio: 0.571,

        initialize: function(options) {
            BodyView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            BodyView.prototype.initGraphics.apply(this);

            this.genericMoon = Assets.createSprite(Assets.Images.MOON_GENERIC);
        },

        updateMass: function(body, mass) {
            
        }

    });

    return MoonView;
});