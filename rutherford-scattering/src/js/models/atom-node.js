define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Constants = require('constants');
    var C = Constants.AtomNodeModel.MIN_NUCLEUS_RADIUS / Math.pow( Constants.AtomNodeModel.MIN_PARTICLE_COUNT, Constants.AtomNodeModel.PARTICLE_COUNT_EXP );

    var AtomNode = Backbone.Model.extend({

        defaults: {
            protonCount: Constants.DEFAULT_PROTON_COUNT,
            neutronCount: Constants.DEFAULT_NEUTRON_COUNT
        },

        initialize: function(attributes, options) {
            Backbone.Model.prototype.initialize.apply(this, [attributes, options]);
            this.updateRadius(options.simulation);
        },

        updateRadius: function(simulation) {
            var protonCount = simulation.get('protonCount');
            var neutronCount = simulation.get('neutronCount');

            var currentParticles = protonCount + neutronCount;
            var radius = C * Math.pow( currentParticles, Constants.AtomNodeModel.PARTICLE_COUNT_EXP );

            this.set({
                protonCount: protonCount,
                neutronCount: neutronCount,
                radius: radius
            });
        }

    });

    return AtomNode;
});
