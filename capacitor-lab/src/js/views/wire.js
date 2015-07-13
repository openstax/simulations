define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

    /**
     * A view that represents a wire, which consists of one or more wire segments.
     */
    var WireView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        /**
         * Initializes the new WireView.
         */
        initialize: function(options) {
            this.color = Colors.parseHex(this.model.get('color'));

            this.listenTo(this.model, 'change:position', this.drawWire);

            this.updateMVT(options.mvt);
        },

        /**
         * Draws the wire
         */
        drawWire: function() {
            var graphics = this.displayObject;
            graphics.clear();
           
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawWire();
        },

        /**
         * Returns the y-value that should be used for sorting. Calculates the
         *   average y for all segment endpoints.
         */
        getYSortValue: function() {
            if (model typeof )
            
        }

    });

    return WireView;
});