define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    /**
     * This is the main class for the CCK model, providing a representation of all
     *   the branches and junctions, and a way of updating the physics.
     */
    var Circuit = Backbone.Model.extend({

        defaults: {
            
        },

        initialize: function(attributes, options) {
            this.branches  = new Backbone.Collection();
            this.junctions = new Backbone.Collection();

            // Solution from last update, used to look up dynamic circuit properties.
            this.solution = null;

            // Cached objects
            this._splitVec = new Vector2();
            this._splitDesiredDest = new Vector2();
            this._splitDestination = new Vector2();

            this.listenTo(this.branches,  'add remove reset', this.circuitChanged);
            this.listenTo(this.junctions, 'add remove reset', this.circuitChanged);
        },

        addJunction: function(junction) {
            if (!this.junctions.contains(junction))
                junctions.add(junction);
        },

        removeJunction: function(junction) {
            this.junctions.remove(junction);
            this.junction.destroy();
        },

        getAdjacentBranches: function(junction) {
            var branches = [];
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i).hasJunction(junction))
                    branches.push(this.branches.at(i));
            }
            return branches;
        },

        hasBranch: function(a, b) {
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i).hasJunction(a) && this.branches.at(i).hasJunction(b))
                    return true;
            }
            return false;
        },

        getJunctionNeighbors: function(junction) {
            var neighbors = [];
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i).hasJunction(junction))
                    neighbors.push(this.branches.at(i).opposite(junction));
            }
            return neighbors;
        },

        replaceJunction: function(oldJunction, newJunction) {
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i).get('startJunction') === oldJunction)
                    this.branches.at(i).set('startJunction', newJunction);
                if (this.branches.at(i).get('endJunction') === oldJunction)
                    this.branches.at(i).set('endJunction', newJunction);
            }
        },

        addBranch: function(component) {
            if (!component)
                throw 'Null component added to circuit.';

            this.branches.add(component);

            this.addJunction(component.get('startJunction'));
            this.addJunction(component.get('endJunction'));
        },

        getBranchNeighbors: function(branch) {
            var n0 = this.getAdjacentBranches(branch.get('startJunction'));
            var n1 = this.getAdjacentBranches(branch.get('endJunction'));
            var neighbors = [];
            var i;
            for (i = 0; i < n0.length; i++) {
                if (n0[i] !== branch)
                    neighbors.push(n0[i]);
            }
            for (i = 0; i < n1.length; i++) {
                if (n1[i] !== branch)
                    neighbors.push(n1[i]);
            }
            
            return neighbors;
        },

        setSolution: function(solution) {
            this.solution = solution;
        },

        split: function(junction) {
            // Get the set of all branches that are connected at this junction.
            var adjacentBranches = this.getAdjacentBranches(junction);

            var newJunctions = [];
            for (var i = 0; i < adjacentBranches.length; i++) {
                var branch = adjacentBranches[i];
                var opposite = branch.opposite(junction);

                var vec = this._splitVec
                    .set(junction.get('position'))
                    .sub(opposite.get('position'));
                var curLength = vec.length();
                var newLength = Math.abs(curLength - Constants.JUNCTION_RADIUS * 1.5);
                vec.normalize().scale(newLength);

                var desiredDest = this._splitDesiredDest.set(opposite.get('position')).add(vec);
                var destination = this._splitDestination.set(desiredDest);
                if (branch instanceof CircuitComponent)
                    destination.set(junction.get('position'));

                var newJunction = new Junction(destination.x, destination.y);
                branch.replaceJunction(junction, newJunction);
                this.addJunction(newJunction);
                newJunctions.push(newJunction);

                if (branch instanceof CircuitComponent) {
                    var translation = this._splitTranslation
                        .set(desiredDest)
                        .sub(junction.get('position'));
                    var stronglyConnected = this.getStrongConnections(newJunction);
                    var bs = new BranchSet(this, stronglyConnected);
                    bs.translate(translation);
                }
            }

            // Remove what used to be the junction
            this.removeJunction(junction);

            // Trigger the junctions-split event
            this.trigger('junctions-split', junction, newJunctions);

            return newJunctions;
        },

        getStrongConnections: function(junction, wrongDir) {
            var visited = [];

            if (wrongDir)
                visited.push(wrongDir);

            this._getStrongConnections(visited, junction);

            if (wrongDir)
                visited.slice(visited.indexOf(wrongDir, 1));

            return visited;
        },

        _getStrongConnections: function(visited, junction) {
            var adjacentBranches = this.getAdjacentBranches(junction);
            for (var i = 0; i < adjacentBranches.length; i++) {
                var branch = adjacentBranches[i];
                var opposite = branch.opposite(junction);
                if (visited.indexOf(branch) === -1) {
                    if (branch instanceof CircuitComponent) {
                        visited.push(branch);
                        this._getStrongConnections(visited, opposite);
                    }//Wires end the connectivity.
                }
            }
        },

        getConnectedSubgraph: function(junction) {
            var visited = [];
            this._getConnectedSubgraph(visited, junction);
            return visited;;
        },

        _getConnectedSubgraph: function(visited, junction) {
            var adj = this.getAdjacentBranches(junction);
            for (var i = 0; i < adj.length; i++) {
                var branch = adj[i];
                if (branch instanceof Switch && !branch.isClosed()) {
                    // Skip this one.
                }
                else {
                    var opposite = branch.opposite(junction);
                    if (visited.indexOf(branch) === -1) {
                        visited.push(branch);
                        this._getConnectedSubgraph(visited, opposite);
                    }
                }
            }
        },

        removeBranch: function(branch) {
            branches.remove(branch);
            
            this.removeIfOrphaned(branch.get('startJunction'));
            this.removeIfOrphaned(branch.get('endJunction'));

            branch.destroy();
        },

        removeIfOrphaned: function(junction) {
            if (this.getAdjacentBranches(junction).length === 0)
                this.removeJunction(junction);
        },

        translate: function(components, translation) {
            for (var i = 0; i < components.length; i++)
                components[i].translate(translation);
        },

        getJunctions: function() {
            return this.junctions;
        },

        getJunctions: function(branches) {
            var list = [];
            for (var i = 0; i < branches.length; i++) {
                var branch = branches[i];
                if (list.indexOf(branch.get('startJunction') === -1)
                    list.push(branch.get('startJunction'));
                if (list.indexOf(branch.get('endJunction') === -1)
                    list.push(branch.get('endJunction'));
            }
            return list;
        },

        /**
         * Gets voltage between two connections.
         */
        getVoltage: function(a, b) {
            if (a.equals(b) || !this.getSameComponent(a.getJunction(), b.getJunction())) {
                return 0;
            }
            else {
                var va = a.getVoltageAddon();
                var vb = -b.getVoltageAddon();//this has to be negative, because on the path VA->A->B->VB, the the VB computation is VB to B.
                //used for displaying values e.g. in voltmeter and charts, so use average node voltages instead of instantaneous, see #2270 
                var avgVoltageA = solution.getAverageNodeVoltage(this.junctions.indexOf(a.getJunction()));
                var avgVoltageB = solution.getAverageNodeVoltage(this.junctions.indexOf(b.getJunction()));
                var junctionAnswer = avgVoltageB - avgVoltageA;
                return junctionAnswer + va + vb;
            }
        },

        getSameComponent: function(a, b) {
            var branches = this.getConnectedSubgraph(a);
            for (var i = 0; i < branches.length; i++) {
                if (branches[i].hasJunction(b))
                    return true;
            }
            return false;
        },

        isDynamic: function() {
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i) instanceof DynamicBranch)
                    return true;
            }
            return false;
        },

        update: function(time, deltaTime) {
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i) instanceof DynamicBranch)
                    this.branches.at(i).update(time, deltaTime);
            }
        },

        resetDynamics: function() {
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i) instanceof DynamicBranch)
                    this.branches.at(i).resetDynamics();
            }
        },

        setTime: function(time) {
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i) instanceof DynamicBranch)
                    this.branches.at(i).setTime(time);
            }
        },

        circuitChanged: function() {
            this.trigger('circuit-changed');
        }

    });

    return Circuit;
});