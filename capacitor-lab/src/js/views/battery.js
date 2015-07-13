define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Vector2   = require('common/math/vector2');

    //var BatteryShapeCreator = require('shape-creators/battery');

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
            var graphics = new PIXI.Graphics();
            graphics.beginFill(0xEF9114, 1);
            graphics.drawCircle(0, 0, 10);
            graphics.endFill();
            this.displayObject.addChild(graphics);
            
            this.updateMVT(this.mvt);
        },

        updatePosition: function(model, position) {
            var viewPos = this.mvt.modelToView(position);
            this.displayObject.x = viewPos.x;
            this.displayObject.y = viewPos.y;
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

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