define(function(require) {

    'use strict';

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');

    var Battery         = require('models/components/battery');
    var Resistor        = require('models/components/resistor');
    var Filament        = require('models/components/filament');
    var Bulb            = require('models/components/bulb');
    var SeriesAmmeter   = require('models/components/series-ammeter');
    var Switch          = require('models/components/switch');
    var Capacitor       = require('models/components/capacitor');
    var Inductor        = require('models/components/inductor');
    var Wire            = require('models/components/wire');
    var ACVoltageSource = require('models/components/ac-voltage-source');
    var GrabBagResistor = require('models/components/grab-bag-resistor');

    var JunctionView        = require('views/junction');
    var WireView            = require('views/components/wire');
    var ResistorView        = require('views/components/resistor');
    var BatteryView         = require('views/components/battery');
    var SwitchView          = require('views/components/switch');
    var InductorView        = require('views/components/inductor');
    var CapacitorView       = require('views/components/capacitor');
    var ACSourceView        = require('views/components/ac-source');
    var LightBulbView       = require('views/components/light-bulb');
    var GrabBagResistorView = require('views/components/grab-bag-resistor');
    var SeriesAmmeterView   = require('views/components/series-ammeter');
    var JunctionHelpView    = require('views/junction-help');
    var ComponentHelpView   = require('views/component-help');

    /**
     * A view that represents a circuit
     */
    var CircuitView = PixiView.extend({

        events: {
            'click .background' : 'clicked'
        },

        /**
         * Initializes the new CircuitView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.width = options.width;
            this.height = options.height;

            this.branchViews = [];
            this.junctionViews = [];

            this.initGraphics();

            this.listenTo(this.model.branches, 'add',    this.branchAdded);
            this.listenTo(this.model.branches, 'remove', this.branchRemoved);
            this.listenTo(this.model.branches, 'reset',  this.branchesReset);

            this.listenTo(this.model.junctions, 'add',    this.junctionAdded);
            this.listenTo(this.model.junctions, 'remove', this.junctionRemoved);
            this.listenTo(this.model.junctions, 'reset',  this.junctionsReset);

            $('body').on('click', _.bind(this.bodyClicked, this));
        },

        initGraphics: function() {
            this.background         = new PIXI.Container();
            this.solderLayer        = new PIXI.Container();
            this.componentLayer     = new PIXI.Container();
            this.junctionLayer      = new PIXI.Container();
            this.topLayer           = new PIXI.Container();
            this.effectsLayer       = new PIXI.Container();
            this.hoverLayer         = new PIXI.Container();
            this.labelLayer         = new PIXI.Container();

            this.displayObject.addChild(this.background);
            this.displayObject.addChild(this.solderLayer);
            this.displayObject.addChild(this.componentLayer);
            this.displayObject.addChild(this.junctionLayer);
            this.displayObject.addChild(this.effectsLayer);
            this.displayObject.addChild(this.hoverLayer);

            this.initHelp();

            this.background.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);

            this.updateMVT(this.mvt);
        },

        initHelp: function() {
            this.junctionHelpView = new JunctionHelpView();
            this.componentHelpView = new ComponentHelpView();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            for (var i = this.branchViews.length - 1; i >= 0; i--)
                this.branchViews[i].updateMVT(mvt);

            for (var i = this.junctionViews.length - 1; i >= 0; i--)
                this.junctionViews[i].updateMVT(mvt);
        },

        updateLabels: function() {
            for (var i = this.branchViews.length - 1; i >= 0; i--)
                this.branchViews[i].updateLabel();
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

            this.updateComponentHelp();
        },

        branchAdded: function(branch, branches) {
            this.createAndAddBranchView(branch);

            this.updateComponentHelp();
        },

        branchRemoved: function(branch, branches) {
            for (var i = this.branchViews.length - 1; i >= 0; i--) {
                if (this.branchViews[i].model === branch) {
                    this.branchViews[i].remove();
                    this.branchViews.splice(i, 1);
                    break;
                }
            }

            this.updateComponentHelp();
        },

        createAndAddBranchView: function(branch) {
            var viewConstructor;

            if (branch instanceof ACVoltageSource) {
                viewConstructor = ACSourceView;
            }
            else if (branch instanceof Battery) {
                viewConstructor = BatteryView;
            }
            else if (branch instanceof GrabBagResistor) {
                viewConstructor = GrabBagResistorView;
            }
            else if (branch instanceof Resistor) {
                viewConstructor = ResistorView;
            }
            else if (branch instanceof Wire) {
                viewConstructor = WireView;
            }
            else if (branch instanceof Filament) {

            } 
            else if (branch instanceof Bulb) {
                viewConstructor = LightBulbView;
            }
            else if (branch instanceof SeriesAmmeter) {
                viewConstructor = SeriesAmmeterView;
            }
            else if (branch instanceof Switch) {
                viewConstructor = SwitchView;
            }
            else if (branch instanceof Capacitor) {
                viewConstructor = CapacitorView;
            }
            else if (branch instanceof Inductor) {
                viewConstructor = InductorView;
            }

            var branchView = new viewConstructor({
                mvt: this.mvt,
                simulation: this.simulation,
                circuit: this.model,
                model: branch
            });

            this.componentLayer.addChild(branchView.displayObject);
            this.hoverLayer.addChild(branchView.hoverLayer);
            if (branchView.topLayer)
                this.topLayer.addChild(branchView.topLayer);
            this.labelLayer.addChild(branchView.labelLayer);
            this.effectsLayer.addChild(branchView.effectsLayer);
            this.topLayer.addChild(branchView.helpLayer);

            this.branchViews.push(branchView);
        },

        updateComponentHelp: function() {
            this.componentHelpView.remove();
            if (this.branchViews.length)
                this.componentHelpView.attachTo(this.branchViews[0].helpLayer);
            else
                this.componentHelpView.attachTo(null);
        },

        junctionsReset: function(junctions) {
            // Remove old junction views
            for (var i = this.junctionViews.length - 1; i >= 0; i--) {
                this.junctionViews[i].remove();
                this.junctionViews.splice(i, 1);
            }

            // Add new junction views
            junctions.each(function(junction) {
                this.createAndAddJunctionView(junction);
            }, this);

            this.updateJunctionHelp();
        },

        junctionAdded: function(junction, junctions) {
            this.createAndAddJunctionView(junction);

            this.updateJunctionHelp();
        },

        junctionRemoved: function(junction, junctions) {
            for (var i = this.junctionViews.length - 1; i >= 0; i--) {
                if (this.junctionViews[i].model === junction) {
                    this.junctionViews[i].remove();
                    this.junctionViews.splice(i, 1);
                    break;
                }
            }

            this.updateJunctionHelp();
        },

        createAndAddJunctionView: function(junction) {
            var junctionView = new JunctionView({
                mvt: this.mvt,
                simulation: this.simulation,
                circuit: this.model,
                model: junction,
                circuitView: this
            });

            this.solderLayer.addChild(junctionView.solderLayer);
            this.junctionLayer.addChild(junctionView.displayObject);
            this.hoverLayer.addChild(junctionView.hoverLayer);
            this.junctionViews.push(junctionView);
        },

        updateJunctionHelp: function() {
            this.junctionHelpView.remove();
            if (this.junctionViews.length)
                this.junctionHelpView.attachTo(this.junctionViews[0]);
            else
                this.junctionHelpView.attachTo(null);
        },

        clicked: function(event) {
            this.model.clearSelection();
        },

        bodyClicked: function(event) {
            for (var i = this.branchViews.length - 1; i >= 0; i--)
                this.branchViews[i].hidePopovers(event);

            for (var i = this.junctionViews.length - 1; i >= 0; i--)
                this.junctionViews[i].hidePopovers(event);
        },

        showHelp: function() {
            this.junctionHelpView.show();
            this.componentHelpView.show();
        },

        hideHelp: function() {
            this.junctionHelpView.hide();
            this.componentHelpView.hide();
        }

    });

    return CircuitView;
});