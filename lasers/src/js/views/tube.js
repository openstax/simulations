define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('../constants');

    /**
     * 
     */
    var TubeView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        /**
         * Initializes the new TubeView.
         */
        initialize: function(options) {
            options = _.extend({
                color: '#000'
            }, options);

            this.color = Colors.parseHex(options.color);

            this.updateMVT(options.mvt);

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(tube, position) {
            var viewPosition = this.mvt.modelToView(position);
            // this.displayObject.x = viewPosition.x;
            // this.displayObject.y = viewPosition.y;
        },

        draw: function() {
            var mirrorPerspecitveWidth = this.mvt.modelToViewDeltaX(Constants.MIRROR_THICKNESS);
            var minX   = this.mvt.modelToViewX(this.model.getMinX());
            var minY   = this.mvt.modelToViewY(this.model.getMinY());
            var maxX   = this.mvt.modelToViewX(this.model.getMaxX());
            var maxY   = this.mvt.modelToViewY(this.model.getMaxY());
            var width  = this.mvt.modelToViewDeltaX(this.model.getWidth());
            var height = this.mvt.modelToViewDeltaY(this.model.getHeight());

            var graphics = this.displayObject;
            graphics.clear();
            graphics.lineStyle(2, this.color, 1);

            graphics.moveTo(minX, minY);
            graphics.lineTo(minX + width, minY);

            this.fixGraphics(graphics);

            graphics.moveTo(minX, maxY);
            graphics.lineTo(minX + width, maxY);

            this.fixGraphics(graphics);

            graphics.drawEllipse(minX, (maxY + minY) / 2, mirrorPerspecitveWidth / 2, height / 2);

            this.fixGraphics(graphics);

            graphics.drawEllipse(minX + width, (maxY + minY) / 2, mirrorPerspecitveWidth / 2, height / 2);
        },

        fixGraphics: function(graphics) {
            if (graphics.currentPath && graphics.currentPath.shape)
                graphics.currentPath.shape.closed = false;
        }

    });


    return TubeView;
});