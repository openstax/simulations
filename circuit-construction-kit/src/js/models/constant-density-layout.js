define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var BranchSet = require('models/branch-set');
    var Electron  = require('models/electron');

    var Constants = require('constants');

    /**
     * Propagates electrons
     */
    var ConstantDensityLayout = function(particleSet, circuit) {
        this.particleSet = particleSet;
        this.circuit = circuit;
        this.branchSet = new BranchSet(circuit);

        this.listenTo(circuit, 'branches-moved', this.branchesMoved);
    };

    _.extend(ConstantDensityLayout.prototype, Backbone.Events, {

        branchesMoved: function(branches) {
            this.branchSet
                .clear()
                .addBranches(branches);

            for (var i = 0; i < branches.length; i++) {
                this.branchSet.addBranches(this.circuit.getStrongConnections(branches[i].get('startJunction')));
                this.branchSet.addBranches(this.circuit.getStrongConnections(branches[i].get('endJunction')));
            }
            
            var torelayout = this.branchSet.branches;
            this.layoutElectrons(torelayout);
        },

        layoutElectrons: function(branches) {
            if (_.isArray(branches)) {
                for (var i = 0; i < branches.length; i++) {
                    this._layoutElectrons(branches[i]);
                }    
            }
            else
                this._layoutElectrons(branches);
        },

        _layoutElectrons: function(branch) {
            this.particleSet.removeParticles(branch);

            var offset = Constants.ELECTRON_DX / 2;
            var endingPoint = branch.getLength() - offset;
            // Compress or expand, but fix a particle at startingPoint and endingPoint.
            var L = endingPoint - offset;
            var desiredDensity = 1 / Constants.ELECTRON_DX;
            var N = L * desiredDensity;
            var integralNumberParticles = Math.ceil(N);
            var density = (integralNumberParticles - 1) / L;
            var dx = 1 / density;
            if (density === 0)
                integralNumberParticles = 0;
console.log(integralNumberParticles)
            // for (var i = 0; i < integralNumberParticles; i++) {
            //     this.particleSet.addParticle(new Electron({
            //         branch: branch,
            //         distAlongWire: i * dx + offset
            //     }));
            // }
        }

    });

    return ConstantDensityLayout;
});