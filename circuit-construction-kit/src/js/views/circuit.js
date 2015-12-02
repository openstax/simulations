define(function(require) {

    'use strict';

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');

    var Battery       = require('models/components/battery');
    var Resistor      = require('models/components/resistor');
    var Filament      = require('models/components/filament');
    var Bulb          = require('models/components/bulb');
    var SeriesAmmeter = require('models/components/series-ammeter');
    var Switch        = require('models/components/switch');
    var Capacitor     = require('models/components/capacitor');
    var Inductor      = require('models/components/inductor');
    var Wire          = require('models/components/wire');

    var WireView = require('views/components/wire');

    /**
     * A view that represents a circuit
     */
    var CircuitView = PixiView.extend({

        /**
         * Initializes the new CircuitView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.branchViews = [];

            this.initGraphics();

            this.listenTo(this.model.branches, 'add',    this.branchAdded);
            this.listenTo(this.model.branches, 'remove', this.branchRemoved);
            this.listenTo(this.model.branches, 'reset',  this.branchesReset);
        },

        initGraphics: function() {
            this.componentLayer = new PIXI.Container();
            this.junctionLayer = new PIXI.Container();

            this.displayObject.addChild(this.componentLayer);
            this.displayObject.addChild(this.junctionLayer);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        branchesReset: function(branches) {
            // Remove old branch views
            for (var i = this.branchViews.length - 1; i >= 0; i--) {
                this.branchViews[i].remove();
                this.branchViews.splice(i, 1);
            }

            // Add new branch views
            branches.each(function(branch) {
                this.createAndAddBranchView(branch);
            }, this);
        },

        branchAdded: function(branch, branches) {
            this.createAndAddBranchView(branch);
        },

        branchRemoved: function(branch, branches) {
            for (var i = this.branchViews.length - 1; i >= 0; i--) {
                if (this.branchViews[i].model === branch) {
                    this.branchViews[i].remove();
                    this.branchViews.splice(i, 1);
                    break;
                }
            }
        },

        createAndAddBranchView: function(branch) {
            var viewConstructor;

            if (branch instanceof Battery) {
                viewConstructor = BatteryView;
            }
            else if (branch instanceof Resistor) {

            }
            else if (branch instanceof Wire) {
                viewConstructor = WireView;
            }
            else if (branch instanceof Filament) {

            } 
            else if (branch instanceof Filament) {

            } 
            else if (branch instanceof Bulb) {

            }
            else if (branch instanceof Bulb) {

            }
            else if (branch instanceof SeriesAmmeter) {
                
            }
            else if (branch instanceof Switch) {
                
            }
            else if (branch instanceof Capacitor) {
                
            }
            else if (branch instanceof Inductor) {
                
            }

            var branchView = new viewConstructor({
                mvt: this.mvt,
                model: branch
            });

            this.componentLayer.addChild(branchView.displayObject);
            this.junctionLayer.addChild(branchView.junctionLayer);
            this.branchViews.push(branchView);
        }

    });

    return CircuitView;
});