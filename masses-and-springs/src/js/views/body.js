
define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    // var Colors   = require('common/colors/colors');
    // var Vector2  = require('common/math/vector2');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents a movable target model
     */
    var Body = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            // this.listenTo(this.model, 'change:state', this.updateState);

            this.updateMVT(this.mvt);
        },

        initGraphics: function() {
            // this.graphics = new PIXI.Graphics();
            // this.drawBody();
            // this.displayObject.addChild(this.graphics);

            // this.bodySprite = Assets.createSprite(Assets.Images.BODY);
            // this.displayObject.addChild(this.bodySprite);

        },

        drawBody : function(){


            this.graphics.clear();
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            // this.updatePosition();
            this.drawBody();
        }

    });

    return Body;
});
