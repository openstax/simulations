define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Rectangle  = require('common/math/rectangle');
    var Vector2    = require('common/math/vector2');

    var BaseGreenhouseSimulation      = require('models/simulation/base-greenhouse');
    var GlassLayersEarth              = require('models/earth-glass-layers');
    var GlassPane                     = require('models/glass-pane');
    var PhotonGlassPaneCollisionModel = require('models/collision-model/photon-glass-pane');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * The simulation model for the "Greenhouse Effect" tab
     */
    var GlassLayersSimulation = BaseGreenhouseSimulation.extend({

        numGlassPanes: Constants.MAX_GLASS_PANES,

        defaults: _.extend(BaseGreenhouseSimulation.prototype.defaults, {
            
        }),
        
        /**
         * 
         */
        initialize: function(attributes, options) {
            BaseGreenhouseSimulation.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            BaseGreenhouseSimulation.prototype.initComponents.apply(this, arguments);

            this.initGlassPanes();

            this.atmosphere.set('greenhouseGasConcentration', 0);
        },

        /**
         * Initializes the glassPanes and glassPane collection
         */
        initGlassPanes: function() {
            this.glassPanes = new Backbone.Collection([], { model: GlassPane });
            this.availableGlassPanes = [];

            for (var i = 0; i < this.numGlassPanes; i++) {
                this.availableGlassPanes.push(new GlassPane({}, {
                    x: this.bounds.left(),
                    altitude: 5 + i * 2,
                    width: this.bounds.w,
                }));
            }

            this.listenTo(this.glassPanes, 'photon-emitted',  this.photonEmitted);
            this.listenTo(this.glassPanes, 'photon-absorbed', this.photonAbsorbed);
        },

        /**
         * Returns a new Earth instance.  Separating this out
         *   so it can be overridden.
         */
        createEarth: function(attributes, options) {
            return new GlassLayersEarth(attributes, options);
        },

        /**
         * Resets all component models
         */
        resetComponents: function() {
            BaseGreenhouseSimulation.prototype.resetComponents.apply(this, arguments);

            this.glassPanes.reset();
        },

        /**
         * Overrides base to add glassPane interactions.
         */
        handlePhotonInteractions: function(photon, deltaTime) {
            BaseGreenhouseSimulation.prototype.handlePhotonInteractions.apply(this, arguments);

            // Check for collisions with glassPanes
            for (var i = 0; i < this.glassPanes.length; i++)
                PhotonGlassPaneCollisionModel.handle(photon, this.glassPanes.at(i), deltaTime);
        },
        
        /**
         * If there are any available glassPanes to add, adds a
         *   glassPane to the model.
         */
        addGlassPane: function() {
            if (this.glassPanes.length < this.availableGlassPanes.length)
                this.glassPanes.add(this.availableGlassPanes[this.glassPanes.length]);
        },

        /**
         * Removes a glassPane from the model
         */
        removeGlassPane: function() {
            this.glassPanes.pop();
        }

    });

    return GlassLayersSimulation;
});
