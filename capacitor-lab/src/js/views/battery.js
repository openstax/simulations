define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Vector2   = require('common/math/vector2');

    //var BatteryShapeCreator = require('shape-creators/battery');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var BatteryView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                
            }, options);

            this.mvt = options.mvt;

            // Initialize graphics
            this.initGraphics();

            // Listen for model events
            this.listenTo(this.model, 'change:position',  this.updatePosition);
        },

        initGraphics: function() {
            this.batteryUp   = Assets.createSprite(Assets.Images.BATTERY_UP);
            this.batteryDown = Assets.createSprite(Assets.Images.BATTERY_DOWN);

            this.batteryUp.anchor.x = this.batteryUp.anchor.y = 0.5;
            this.batteryDown.anchor.x = this.batteryDown.anchor.y = 0.5;
            this.batteryDown.visible = false;

            this.displayObject.addChild(this.batteryUp);
            this.displayObject.addChild(this.batteryDown);
            
            this.updateMVT(this.mvt);
        },

        updatePosition: function(model, position) {
            var viewPos = this.mvt.modelToView(position);
            this.displayObject.x = viewPos.x;
            this.displayObject.y = viewPos.y;
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetSpriteWidth = this.mvt.modelToViewDeltaY(this.model.getBodyWidth()); // in pixels
            var scale = targetSpriteWidth / this.batteryUp.texture.width;
            this.batteryUp.scale.x = scale;
            this.batteryUp.scale.y = scale;
            this.batteryDown.scale.x = scale;
            this.batteryDown.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
        },

        /**
         * Returns the y-value that should be used for sorting.
         */
        getYSortValue: function() {
            return this.displayObject.y;
        }

    });

    return BatteryView;
});