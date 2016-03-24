define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var ExplodingNucleusView = require('views/nucleus/exploding');

    var Constants = require('constants');

    /**
     * 
     */
    var DraggableExplodingNucleusView = ExplodingNucleusView.extend({

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
         * Initializes the new DraggableExplodingNucleusView.
         */
        initialize: function(options) {
            options = _.extend({
                interactive: true
            }, options);

            this.atomCanister = options.atomCanister;
            this.interactive = options.interactive;

            ExplodingNucleusView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            ExplodingNucleusView.prototype.initGraphics.apply(this, arguments);

            this.displayObject.buttonMode = true;
        },

        dragStart: function(event) {
            if (!this.interactive)
                return;

            this.dragging = true;

            this.atomCanister.showRemoveOverlay();
        },

        drag: function(event) {
            if (this.dragging) {
                this.model.setPosition(
                    this.mvt.viewToModelX(event.data.global.x),
                    this.mvt.viewToModelY(event.data.global.y)
                );
            }
        },

        dragEnd: function(event) {
            this.dragging = false;

            this.atomCanister.hideRemoveOverlay();
            this.atomCanister.offerForDestruction(this);
        }

    }, Constants.DraggableExplodingNucleusView);


    return DraggableExplodingNucleusView;
});