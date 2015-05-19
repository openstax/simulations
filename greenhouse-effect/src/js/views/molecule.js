define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView = require('common/pixi/view');

    var Constants = require('constants');

    /**
     * A view that represents a molecule
     */
    var MoleculeView = PixiView.extend({

        /**
         * Initializes the new MoleculeView.
         */
        initialize: function(options) {
            this.initGraphics();
            this.updateMVT(options.mvt);
        },

        initGraphics: function() {
            
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
        }

    });

    return MoleculeView;
});