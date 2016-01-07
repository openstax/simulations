define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');
    var Pool     = require('object-pool');
    var SAT      = require('sat');

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var Branch           = require('models/branch');
    var BranchSet        = require('models/branch-set');
    var Junction         = require('models/junction');
    var Connection       = require('models/connection');
    var CircuitComponent = require('models/components/circuit-component');
    var Switch           = require('models/components/switch');
    var Wire             = require('models/components/wire');
    
    var Constants = require('constants');

    var matchPool = Pool({
        init: function() {
            return {
                target: undefined,
                source: undefined,
                distance: 0,
                getVector: function() {
                    if (!this._vec)
                        this._vec = new Vector2();
                    return this._vec
                        .set(this.target.get('position'))
                        .sub(this.source.get('position'));
                },
                destroy: function() {
                    matchPool.remove(this);
                }
            };
        }
    });

    /**
     * This is the main class for the CCK model, providing a representation of all
     *   the branches and junctions, and a way of updating the physics.
     */
    var Circuit = Backbone.Model.extend({

        defaults: {
            schematic: false
        },

        initialize: function(attributes, options) {
            this.branches  = new Backbone.Collection();
            this.junctions = new Backbone.Collection();

            // Solution from last update, used to look up dynamic circuit properties.
            this.solution = null;

            // Create a reusable BranchSet
            this.branchSet = new BranchSet(this);

            // Cached objects
            this._splitVec = new Vector2();
            this._splitDestination = new Vector2();
            this._splitTranslation = new Vector2();
            this._bestDragMatchVec = new Vector2();
            this._getBranchRect = new Rectangle();

            this.listenTo(this.branches,  'add remove reset', this.circuitChanged);
            this.listenTo(this.junctions, 'add remove reset', this.circuitChanged);
        },

        addJunction: function(junction) {
            if (!this.junctions.contains(junction))
                this.junctions.add(junction);
        },

        removeJunction: function(junction) {
            this.junctions.remove(junction);
            junction.destroy();
            this.fireKirkhoffChanged();
        },

        numJunctions: function() {
            return this.junctions.length;
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

        numBranches: function() {
            return this.branches.length;
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

                var destination = this._splitDestination.set(opposite.get('position')).add(vec);
                if (branch instanceof CircuitComponent)
                    destination.set(junction.get('position'));

                var newJunction = new Junction({
                    position: new Vector2(destination.x, destination.y)
                });
                branch.replaceJunction(junction, newJunction);
                this.addJunction(newJunction);
                newJunctions.push(newJunction);

                if (branch instanceof CircuitComponent) {
                    var translation = this._splitTranslation
                        .set(destination)
                        .sub(junction.get('position'));
                    var strongConnections = this.getStrongConnections(newJunction);
                    this.branchSet
                        .clear()
                        .addBranches(strongConnections)
                        .translate(translation);
                }
            }

            // Remove what used to be the junction
            this.removeJunction(junction);

            // Trigger the junction-split event
            this.trigger('junction-split', junction, newJunctions);

            return newJunctions;
        },

        getStrongConnections: function(junction, wrongDir) {
            var visited = [];

            if (wrongDir)
                visited.push(wrongDir);

            this._getStrongConnections(visited, junction);

            if (wrongDir)
                visited.splice(visited.indexOf(wrongDir, 1));

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
            return visited;
        },

        _getConnectedSubgraph: function(visited, junction) {
            var adj = this.getAdjacentBranches(junction);
            for (var i = 0; i < adj.length; i++) {
                var branch = adj[i];
                // Skip open branches
                if (!(branch instanceof Switch && !branch.get('closed'))) {
                    var opposite = branch.opposite(junction);
                    if (visited.indexOf(branch) === -1) {
                        visited.push(branch);
                        this._getConnectedSubgraph(visited, opposite);
                    }
                }
            }
        },

        removeBranch: function(branch) {
            this.branches.remove(branch);
            
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

        getJunctions: function(branches) {
            var list = [];
            for (var i = 0; i < branches.length; i++) {
                var branch = branches[i];
                if (list.indexOf(branch.get('startJunction')) === -1)
                    list.push(branch.get('startJunction'));
                if (list.indexOf(branch.get('endJunction')) === -1)
                    list.push(branch.get('endJunction'));
            }
            return list;
        },

        /**
         * Gets voltage between components touching two polygons.
         */
        getVoltage: function(polygonA, polyonB) {
            if (SAT.testPolygonPolygon(polygonA, polygonB)) {
                // They touch each other, short-circuiting it.
                return 0;
            }
            else {
                var connectionA = this.getConnection(polygonA);
                var connectionB = this.getConnection(polygonB);

                //Ignore wires & components loaded into a black box.
                // if (connectionA  && connectionA.isBlackBox())
                //     connectionA = null;
                // if (connectionB && connectionB.isBlackBox())
                //     connectionB = null;

                var voltage;

                if (!connectionA || !connectionB)
                    voltage = NaN;
                else
                    voltage = this._getVoltage(connectionA, connectionB); // dfs from one branch to the other, counting the voltage drop.

                if (connectionA)
                    connectionA.destroy();
                if (connectionB)
                    connectionB.destroy();

                return voltage;
            }
        },

        /**
         * Gets voltage between two connections.
         */
        _getVoltage: function(a, b) {
            if (a.equals(b) || !this.getSameComponent(a.getJunction(), b.getJunction())) {
                return 0;
            }
            else {
                var va = a.getVoltageAddon();
                var vb = -b.getVoltageAddon();//this has to be negative, because on the path VA->A->B->VB, the the VB computation is VB to B.
                //used for displaying values e.g. in voltmeter and charts, so use average node voltages instead of instantaneous, see #2270 
                var avgVoltageA = this.get('solution').getAverageNodeVoltage(this.junctions.indexOf(a.getJunction()));
                var avgVoltageB = this.get('solution').getAverageNodeVoltage(this.junctions.indexOf(b.getJunction()));
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

        setSelection: function(component) {
            this.clearSelection();
            component.select();
            this.fireSelectionChanged();
        },

        fireSelectionChanged: function() {
            this.trigger('selection-changed');
        },

        clearSelection: function() {
            var i;
            for (i = 0; i < this.branches.length; i++)
                this.branches.at(i).deselect();
            for (i = 0; i < this.junctions.length; i++)
                this.junctions.at(i).deselect();
            this.fireSelectionChanged();
        },

        getSelectedBranches: function() {
            var sel = [];
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i).get('selected'))
                    sel.push(this.branches.at(i));
            }
            return sel;
        },

        getSelectedJunctions: function() {
            var sel = [];
            for (var i = 0; i < this.junctions.length; i++) {
                if (this.junctions.at(i).get('selected'))
                    sel.push(this.junctions.at(i));
            }
            return sel;
        },

        selectAll: function() {
            var i;
            for (i = 0; i < this.branches.length; i++)
                this.branches.at(i).select();
            for (i = 0; i < this.junctions.length; i++)
                this.junctions.at(i).select();
        },

        isDynamic: function() {
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i).hasOwnProperty('resetDynamics'))
                    return true;
            }
            return false;
        },

        update: function(time, deltaTime) {
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i).hasOwnProperty('resetDynamics'))
                    this.branches.at(i).update(time, deltaTime);
            }
        },

        resetDynamics: function() {
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i).hasOwnProperty('resetDynamics'))
                    this.branches.at(i).resetDynamics();
            }
        },

        setTime: function(time) {
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i).hasOwnProperty('resetDynamics'))
                    this.branches.at(i).setTime(time);
            }
        },

        setState: function(newCircuit) {
            this.clear();
            newCircuit.junctions.each(this.addJunction, this);
            newCircuit.branches.each(this.addBranch, this);
        },

        clear: function() {
            while (this.branches.length > 0)
                this.removeBranch(this.branches.first());
            while (this.junctions.length > 0)
                this.removeJunction(this.junctions.first());
        },

        wouldConnectionCauseOverlappingBranches: function(a, b) {
            var neighborsOfA = this.getJunctionNeighbors(a);
            var neighborsOfB = this.getJunctionNeighbors(b);
            for (var i = 0; i < neighborsOfA.length; i++) {
                for (var j = 0; j < neighborsOfB.length; j++) {
                    if (neighborsOfA[i] === neighborsOfB[j])
                        return true;
                }
            }
            return false;
        },

        collapseJunctions: function(j1, j2) {
            if (!j1.get('position').equals(j2.get('position'), Constants.EPSILON))
                throw 'Junctions not at same coordinates.';
            
            this.removeJunction(j1);
            this.removeJunction(j2);
            var replacement = new Junction({ position: new Vector2(j1.get('position').x, j1.get('position').y) });
            this.addJunction(replacement);
            this.replaceJunction(j1, replacement);
            this.replaceJunction(j2, replacement);

            // Fire notification events so that any listeners are informed.
            this.fireKirkhoffChanged();
            this.trigger('junctions-collapsed', j1, j2, replacement);
        },

        getBestDragMatch: function(draggedJunctions, dx) {
            // If draggedJunctions is actually an array of branches, interpret them as strong connections
            if (draggedJunctions.length && draggedJunctions[0] instanceof Branch)
                draggedJunctions = this.getJunctions(draggedJunctions);

            var all = this.junctions.models;
            var potentialMatches = _.difference(all, draggedJunctions);

            // Make internal nodes ungrabbable for black box, see https://phet.unfuddle.com/a#/projects/9404/tickets/by_number/3602
            for (var i = 0; i < all.length; i++) {
                if (all[i].fixed && this.getAdjacentBranches(all[i]) > 1) {
                    var junctionIndex = potentialMatches.indexOf(all[i]);
                    if (junctionIndex !== -1)
                        potentialMatches.splice(junctionIndex, 1);
                }
            }

            // Now we have all the junctions that are moving,
            // And all the junctions that aren't moving, so we can look for a best match.
            var best = null;
            var draggedJunction;
            var loc = this._bestDragMatchVec;
            var source;
            var target;
            var distance;

            for (var j = 0; j < draggedJunctions.length; j++) {
                draggedJunction = draggedJunctions[j];
                loc.set(draggedJunction.get('position')).add(dx);
                var bestForJunction = this._getBestDragMatch(draggedJunction, loc, potentialMatches);
                if (bestForJunction) {
                    source = draggedJunction;
                    target = bestForJunction;
                    distance = source.getDistance(target);
                    if (best === null || distance < best.distance) {
                        if (best === null)
                            best = matchPool.create();
                        best.source = source;
                        best.target = target;
                        best.distance = distance;
                    }
                }
            }
            return best;
        },

        _getBestDragMatch: function(dragging, loc, targets) {
            var strong = this.getStrongConnections( dragging );
            var closestJunction = null;
            var closestValue = Number.POSITIVE_INFINITY;

            for (var i = 0; i < targets.length; i++) {
                var target = targets[i];
                var dist = loc.distance(target.get('position'));
                if (target !== dragging && !this.hasBranch(dragging, target) && !this.wouldConnectionCauseOverlappingBranches(dragging, target)) {
                    if (closestJunction === null || dist < closestValue) {
                        var legal = !this.contains(strong, target);
                        var STICKY_THRESHOLD = 0.5;
                        if (dist <= STICKY_THRESHOLD && legal) {
                            closestValue = dist;
                            closestJunction = target;
                        }
                    }
                }
            }

            return closestJunction;
        },

        removedUnusedJunctions: function(junctions) {
            var out = this.getAdjacentBranches(junctions);
            if (out.length === 0)
                this.removeJunction(junctions);
        },

        deleteSelectedBranches: function() {
            for (var i = 0; i < this.branches.length; i++) {
                var branch = this.branches.at(i);
                if (branch.get('selected')) {
                    this.removeBranch(branch);
                    i--;
                }
            }
        },

        contains: function(branches, j) {
            for (var i = 0; i < branches.length; i++) {
                if (branches[i].hasJunction(j))
                    return true;
            }
            return false;
        },

        getConnection: function(tipShape) {
            // If we're on a junction, that's ideal, so take that option first
            var junction = this.getIntersectingJunction(tipShape);
            if (junction)
                return Connection.JunctionConnection.create(junction);

            // If we're on a wire, that's a little more complex of a problem
            var wire = this.getIntersectingWire(tipShape);
            if (wire) {
                // PhET: We could choose the closest junction, but we want a potentiometer.

                // Patrick: I'm going to stray a bit from the original to simplify, because I
                //   don't even think this specialized code is being taken advantage of anyway.
                var tipPosition = this._tipPosition
                    .set(tipShape.pos.x, tipShape.pos.y)
                    .scale(1 / Constants.SAT_SCALE);

                var dist = tipPosition.distance(wire.getStartPosition());

                return Connection.BranchConnection.create(branch, dist);
            }
        },

        getWires: function() {
            var list = [];
            for (var i = 0; i < this.branches.length; i++) {
                if (this.branches.at(i) instanceof Wire)
                    list.push(this.branches.at(i));
            }
            return list;
        },

        bumpAway: function(junction) {
            for (var i = 0; i < 2; i++)
                this.bumpOnce(junction);
        },

        bumpOnce: function(junction) {
            console.log('we\'re not ready for the bump functionality yet');
            return;

            var branches = this.branches;
            var strongConnections = this.getStrongConnections(junction);
            for (var i = 0; i < branches.length; i++) {
                var branch = branches.at(i);
                if (!branch.hasJunction(junction)) {
                    if (branch.getShape().intersects(junction.getShape())) {
                        var vec = branch.getDirectionVector();
                        vec.set(vec.y, -vec.x); // Make it perpendicular to the original
                        vec.normalize().scale(junction.getShape().w);
                        this.branchSet
                            .clear()
                            .addBranches(strongConnections)
                            .addJunction(junction)
                            .translate(vec);
                        break;
                    }
                }
            }
        },

        fireKirkhoffChanged: function() {
            this.trigger('kirkhoff-changed');
            this.circuitChanged();
        },

        fireBranchesMoved: function(branches) {
            this.trigger('branches-moved', branches);
        },

        circuitChanged: function() {
            this.trigger('circuit-changed');
        },

        /**
         * Returns the first branch that intersects with the given SAT.Polygon or SAT.Vector object.
         */
        getIntersectingBranch: function(polygon) {
            var branches = this.branches;

            if (polygon instanceof SAT.Vector) {
                var point = polygon;
                for (var i = 0; i < branches.length; i++) {
                    if (branches.at(i).containsPoint(point))
                        return branches.at(i);
                }
            }
            else {
                for (var i = 0; i < branches.length; i++) {
                    if (branches.at(i).intersectsPolygon(polygon))
                        return branches.at(i);
                }
            }
            
            return null;
        },

        getIntersectingWire: function(polygon) {
            var branches = this.branches;

            for (var i = 0; i < branches.length; i++) {
                if (branches.at(i) instanceof Wire && branches.at(i).intersectsPolygon(polygon))
                    return branches.at(i);
            }
            
            return null;
        },

        getIntersectingJunction: function(polygon) {
            var junctions = this.junctions;

            for (var i = 0; i < junctions.length; i++) {
                if (junctions.at(i).intersectsPolygon(polygon))
                    return junctions.at(i);
            }
            
            return null;
        }

    });

    return Circuit;
});