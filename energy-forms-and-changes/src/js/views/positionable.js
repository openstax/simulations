define(function(require) {

    'use strict';

    var _ = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');

    /**
     * A view that represents an element model
     */
    var PositionableView = PixiView.extend({

        /**
         *
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.updatePosition(this.model, this.model.get('position'));
        },

        initGraphics: function() {},

        drawDebugOrigin: function(parent, color) {
            var origin = new PIXI.Graphics();
            origin.beginFill(color !== undefined ? color : 0x0000FF, 1);
            origin.drawCircle(0, 0, 3);
            origin.endFill();
            if (parent === undefined)
                this.displayObject.addChild(origin);
            else
                parent.addChild(origin);
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.displayObject.x = viewPoint.x;
            this.displayObject.y = viewPoint.y;
        },

        update: function(time, deltaTime) {

        }

    });

    return PositionableView;
});