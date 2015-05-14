define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');

    var Constants = require('constants');

    /**
     * A view that represents a photon
     */
    var AtomView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        /**
         * Initializes the new AtomView.
         */
        initialize: function(options) {
            this.updateMVT(options.mvt);
        },

        /**
         * Draws the atom
         */
        drawAtom: function() {
            
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawAtom();
        }

    });

    return AtomView;
});