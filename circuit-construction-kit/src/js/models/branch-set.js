define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var BranchSet = function() {
        this.circuit = undefined;
        this.branches = [];
        this.junctions = [];
    };

    _.extend(BranchSet.prototype, {

        clear: function() {
            this.circuit = undefined;
            var i = 0;
            for (i = this.branches.length - 1; i >= 0; i--)
                this.branches.splice(i, 1);
            for (i = this.junctions.length - 1; i >= 0; i--)
                this.junctions.splice(i, 1);
            return this;
        },

        setCircuit: function(circuit) {
            this.circuit = circuit;
            return this;
        },

        addBranch: function(branch) {
            if (this.branches.indexOf(branch) === -1)
                this.branches.push(branch);
            return this;
        },

        addBranches: function(branches) {
            for (var i = 0; i < branches.length; i++)
                this.addBranch(branches[i]);
            return this;
        },

        addJunction: function(junction) {
            if (this.junctions.indexOf(junction) === -1)
                this.junctions.push(junction);
            return this;
        },

        addJunctions: function(junctions) {
            for (var i = 0; i < junctions.length; i++)
                this.addBranch(junctions[i]);
            return this;
        },

        translate: function(x, y) {
            if (x instanceof Vector2) {
                y = x.y;
                x = x.x;
            }

            var i;

            var junctionSet = this.junctions.slice();
            for (i = 0; i < this.branches.length; i++) {
                var branch = this.branches[i];

                if (junctionSet.indexOf(branch.get('startJunction')) === -1)
                    junctionSet.push(branch.get('startJunction'));
                
                if (junctionSet.indexOf(branch.get('endJunction')) === -1)
                    junctionSet.push(branch.get('endJunction'));
            }

            for (i = 0; i < junctionSet.length; i++) {
                // Can't do one-at-a-time, because intermediate notifications get inconsistent data.
                junctionSet[i].get('position').add(x, y);
            }

            for (i = 0; i < junctionSet.length; i++)
                junctionSet[i].setPosition(junctionSet[i].get('position'));
            
            return this;
        }

    });

    return BranchSet;
});