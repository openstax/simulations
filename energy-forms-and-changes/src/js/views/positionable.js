define(function(require) {

    'use strict';

    var _ = require('underscore');
    
    var PixiView = require('common/pixi/view');

    /**
     * A view that represents an element model
     */
    var PositionableView = PixiView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.updatePosition(this.model, this.model.get('position'));
        },

        initGraphics: function() {},

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