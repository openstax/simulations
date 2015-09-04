define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Rectangle        = require('common/math/rectangle');
    var Vector2          = require('common/math/vector2');
    var LineIntersection = require('common/math/line-intersection');

    var BendingLightSimulation = require('models/simulation');
    var Medium                 = require('models/medium');
    var LightRay               = require('models/light-ray');

    /**
     * Constants
     */
    var Constants = require('constants');
    var MediumPropertiesPresets = require('medium-properties-presets');

    /**
     * Wraps the update function in 
     */
    var PrismBreakSimulation = BendingLightSimulation.extend({

        defaults: _.extend(BendingLightSimulation.prototype.defaults, {
            manyRays: false,       // Show multiple beams to help show how lenses work
            showReflections: false // If false, will hide non TIR reflections
        }),
        
        initialize: function(attributes, options) {
            BendingLightSimulation.prototype.initialize.apply(this, [attributes, options]);

            
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            BendingLightSimulation.prototype.initComponents.apply(this, arguments);

            this.intersections = [];
            this.prisms = new Backbone.Collection();

            this.environment = new Medium({
                shape: new Rectangle(-1, 0, 2, 1), // In Meters, very large compared to visible model region in the stage
                mediumProperties: MediumPropertiesPresets.AIR
            });

            this.prismMedium = new Medium({
                shape: new Rectangle(-1, -1, 2, 1), // In Meters, very large compared to visible model region in the stage
                mediumProperties: MediumPropertiesPresets.GLASS
            });

            this.listenTo(this.environment, 'change',           this.mediumChanged);
            this.listenTo(this.prisms,      'change',           this.prismChanged);
            this.listenTo(this.prisms,      'add remove reset', this.prismChanged);
        },

        addPrism: function(prism) {
            this.prisms.add(prism);
        },

        removePrism: function() {
            this.prisms.remove(prism);
        },

        /**
         * Algorithm that computes the trajectories of the rays throughout the system
         */
        propagateRays: function() {
            
        },

        /**
         * Starts the ray propagation from a new starting location
         */
        propagateFrom: function(tail, directionUnitVector, power, laserInPrism) {

        },

        /**
         * Recursive algorithm to compute the pattern of rays in the system.  This is
         *   the main computation of this model, rays are cleared beforehand and this
         *   algorithm adds them as it goes
         */
        propagateRay: function() {

        },

        isLaserInPrism: function() {
            for (var i = 0; i < this.prisms.length; i++) {
                if (this.prisms.at(i).contains(this.laser.get('emissionPoint')))
                    return true;
            }
            return false;
        },

        /**
         * Responds to changes in mediums by telling the simulation to update
         */
        mediumChanged: function() {
            this.updateOnNextFrame();
        },

        prismChanged: function() {
            this.updateOnNextFrame();
        }

    });

    return PrismBreakSimulation;
});
