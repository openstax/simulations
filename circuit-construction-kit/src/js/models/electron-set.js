define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var ConstantDensityPropagator = require('models/constant-density-propagator');

    var ElectronSet = function(circuit) {
        this.circuit = circuit;
        this.particles = new Backbone.Collection();
        this.propagator = new ConstantDensityPropagator(this, circuit);

        this.listenTo(circuit.branches, 'remove', this.removeParticles);
    };

    _.extend(ElectronSet.prototype, Backbone.Events, {

        clear: function() {
            this.particles.reset();
            return this;
        },

        addParticle: function(particle) {
            if (!this.particles.contains(particle))
                this.particles.add(particle);
            return this;
        },

        addParticles: function(particles) {
            for (var i = 0; i < particles.length; i++)
                this.addParticle(particles[i]);
            return this;
        },

        removeParticles: function(branch) {
            var p = this.getParticles(branch);
            for (var i = 0; i < p.length; i++) {
                var electron = p[i];
                this.particles.remove(electron);
                electron.destroy();
            }
        },

        getParticles: function(branch) {
            var all = [];
            for (var i = 0; i < this.particles.length; i++) {
                if (this.particles.at(i).get('branch') === branch)
                    all.push(this.particles.at(i));
            }
            return all;
        },

        particleAt: function(i) {
            return this.particles.at(i);
        },

        numParticles: function() {
            return this.particles.length;
        },

        update: function(time, deltaTime) {
            this.propagator.update(time, deltaTime);
        },

        getUpperNeighborInBranch: function(myElectron) {
            var branchElectrons = this.getParticles(myElectron.get('branch'));
            var upper = null;
            var dist = Number.POSITIVE_INFINITY;
            for (var i = 0; i < branchElectrons.length; i++) {
                if (branchElectrons[i] != myElectron) {
                    var yourDist = branchElectrons[i].get('distAlongWire');
                    var myDist = myElectron.get('distAlongWire');
                    if (yourDist > myDist) {
                        var distance = yourDist - myDist;
                        if (distance < dist) {
                            dist = distance;
                            upper = branchElectrons[i];
                        }
                    }
                }
            }
            return upper;
        },

        getLowerNeighborInBranch: function(myElectron) {
            var branchElectrons = this.getParticles(myElectron.get('branch'));
            var lower = null;
            var dist = Number.POSITIVE_INFINITY;
            for (var i = 0; i < branchElectrons.length; i++) {
                if (branchElectrons[i] != myElectron) {
                    var yourDist = branchElectrons[i].get('distAlongWire');
                    var myDist = myElectron.get('distAlongWire');
                    if (yourDist < myDist) {
                        var distance = myDist - yourDist;
                        if (distance < dist) {
                            dist = distance;
                            lower = branchElectrons[i];
                        }
                    }
                }
            }
            return lower;
        }

    });

    return ElectronSet;
});