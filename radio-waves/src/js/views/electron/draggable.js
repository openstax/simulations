define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Vector2 = require('common/math/vector2');

    var ElectronView = require('views/electron');

    /**
     * An electron view that the user can interact with
     */
    var DraggableElectronView = ElectronView.extend({

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd'
        },

        /**
         * Initializes the new DraggableElectronView.
         */
        initialize: function(options) {
            // Cached objects
            this._dragOffset = new PIXI.Point();
            this._viewPosition = new Vector2();

            ElectronView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            ElectronView.prototype.initGraphics.apply(this, arguments);

            this.displayObject.buttonMode = true;
        },

        dragStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                this._viewPosition.x = data.global.x - this.dragOffset.x;
                this._viewPosition.y = data.global.y - this.dragOffset.y;

                var modelPoint = this.mvt.viewToModel(this._viewPosition);

                this.model.moveToNewPosition(modelPoint);
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

    });


    return DraggableElectronView;
});