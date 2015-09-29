define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var CoreView = require('views/core');

    /**
     * A view that represents an electron
     */
    var CoresView = PixiView.extend({

        /**
         * Initializes the new CoresView.
         */
        initialize: function(options) {
            this.simulation = options.simulation;
            this.cores = this.simulation.resistance.cores;

            this.coreViews = [];

            this.updateMVT(options.mvt);

            this.listenTo(this.simulation, 'change:coreCount', this.coreCountChanged);
            this.coreCountChanged(this.simulation, this.simulation.get('coreCount'));
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            for (var i = 0; i < this.coreViews.length; i++)
                this.coreViews[i].updateMVT(mvt);
        },

        update: function() {
            for (var i = 0; i < this.coreViews.length; i++)
                this.coreViews[i].update();
        },

        coreCountChanged: function(simulation, coreCount) {
            // Remove the views for the old cores
            for (var i = 0; i < this.coreViews.length; i++) {
                this.coreViews[i].removeFrom(this.displayObject);
                this.coreViews.splice(i, 1);
            }
            
            // Create new core views
            for (var i = 0; i < this.cores.length; i++) {
                var coreView = new CoreView({
                    mvt: this.mvt,
                    model: this.cores[i]
                });
                this.coreViews.push(coreView);
                this.displayObject.addChild(coreView.displayObject);
            }
        }

    });


    return CoresView;
});