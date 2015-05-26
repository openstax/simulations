define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Rectangle  = require('common/math/rectangle');
    var Vector2    = require('common/math/vector2');

    var BaseGreenhouseSimulation  = require('models/simulation/base-greenhouse');
    var Earth                     = require('models/earth');
    var Cloud                     = require('models/cloud');
    var Atmosphere                = require('models/atmosphere');
    var PhotonCloudCollisionModel = require('models/collision-model/photon-cloud');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * The simulation model for the "Greenhouse Effect" tab
     */
    var GreenhouseEffectSimulation = BaseGreenhouseSimulation.extend({

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

            this.initClouds();

            this.atmosphere.set('greenhouseGasConcentration', Atmosphere.GREENHOUSE_GAS_CONCENTRATION_TODAY);
        },

        /**
         * Initializes the clouds and cloud collection
         */
        initClouds: function() {
            this.clouds = new Backbone.Collection([], { model: Cloud });
            this.availableClouds = [];

            var earthPos = this.earth.get('position');

            this.availableClouds.push(this.createCloud(earthPos.x + 1,   earthPos.y + Earth.RADIUS + 7.5, 3, 0.3));
            this.availableClouds.push(this.createCloud(earthPos.x - 5,   earthPos.y + Earth.RADIUS + 5,   5, 0.5));
            this.availableClouds.push(this.createCloud(earthPos.x + 5.5, earthPos.y + Earth.RADIUS + 5.8, 6, 0.4));
        },

        createCloud: function(x, y, width, height) {
            return new Cloud({
                bounds: new Rectangle(
                    x - width  / 2,
                    y - height / 2,
                    width,
                    height
                )
            });
        },

        /**
         * Resets all component models
         */
        resetComponents: function() {
            BaseGreenhouseSimulation.prototype.resetComponents.apply(this, arguments);
            
            this.atmosphere.set('greenhouseGasConcentration', Atmosphere.GREENHOUSE_GAS_CONCENTRATION_TODAY);
            this.clouds.reset();
        },

        /**
         * Overrides base to add cloud interactions.
         */
        handlePhotonInteractions: function(photon) {
            BaseGreenhouseSimulation.prototype.handlePhotonInteractions.apply(this, arguments);

            // Check for collisions with clouds
            for (var i = 0; i < this.clouds.length; i++)
                PhotonCloudCollisionModel.handle(photon, this.clouds.at(i));
        },
        
        /**
         * If there are any available clouds to add, adds a
         *   cloud to the model.
         */
        addCloud: function() {
            if (this.clouds.length < this.availableClouds.length)
                this.clouds.add(this.availableClouds[this.clouds.length]);
        },

        /**
         * Removes a cloud from the model
         */
        removeCloud: function() {
            this.clouds.pop();
        }

    });

    return GreenhouseEffectSimulation;
});
