define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var DeBroglieModelSubView = require('hydrogen-atom/views/atomic-model/debroglie-sub');

    var Constants = require('constants');
    
    /**
     * Represents the scene for the DeBroglieModel
     */
    var DeBroglieModelBrightnessSubView = DeBroglieModelSubView.extend({

        /**
         * Initializes the new DeBroglieModelBrightnessSubView.
         */
        initialize: function(options) {
            DeBroglieModelSubView.prototype.initialize.apply(this, arguments);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            DeBroglieModelSubView.prototype.updateMVT.apply(this, arguments);

            this.drawOrbitals(this.orbitalGraphics);
        },

        update: function(time, deltaTime, paused) {
            DeBroglieModelSubView.prototype.update.apply(this, arguments);
        }

    }, Constants.DeBroglieModelBrightnessSubView);


    return DeBroglieModelBrightnessSubView;
});