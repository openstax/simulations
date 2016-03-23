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
                
            }, options);

            this.atomCanister = options.atomCanister;

            ExplodingNucleusView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            ExplodingNucleusView.prototype.initGraphics.apply(this, arguments);
        },

        dragStart: function(data) {
            this.dragging = true;

            this.atomCanister.showDestroyOverlay();
        },

        drag: function(data) {
            if (this.dragging) {

            }
        },

        dragEnd: function(data) {
            this.dragging = false;

            this.atomCanister.hideDestroyOverlay();
        }

    }, Constants.DraggableExplodingNucleusView);


    return DraggableExplodingNucleusView;
});