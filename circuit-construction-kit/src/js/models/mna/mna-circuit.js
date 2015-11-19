define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');

    var Matrix = require('common/math/matrix');

    var UnknownCurrent = require('models/mna/unknown-current');
    var UnknownVoltage = require('models/mna/unknown-voltage');
    var Term           = require('models/mna/term');
    var Equation       = require('models/mna/equation');
    var MNASolution    = require('models/mna/mna-solution');
    
    var pool = Pool({
        init: function() {
            return new MNACircuit();
        }
    });

    var debug = false;

    /**
     * 
     */
    var MNACircuit = function(batteries, resistors, currentSources) {
        // Call init with any arguments passed to the constructor
        if (batteries !== undefined)
            this.init.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(MNACircuit.prototype, {

        /**
         * Initializes the MNACircuit's properties with provided initial values
         */
        init: function(batteries, resistors, currentSources) {
            this.batteries = batteries.slice();
            this.resistors = resistors.slice();
            this.currentSources = currentSources.slice();

            this.elements = batteries.concat(resistors, currentSources);
        },

        getElements: function() {
            return this.elements;
        },

        getNodeCount: function() {
            return this.getNodeSet().length;
        },

        getCurrentCount: function() {
            var zeroResistors = 0;
            for (var i = this.resistors.length - 1; i >= 0; i--) {
                if (this.resistors[i] === 0)
                    zeroResistors++;
            }
            return this.batteries.length + zeroResistors;
        },

        getNodeSet: function() {
            // Get the unique set of all nodes in the circuit
            if (!this.nodeSet) {
                var nodeSet = [];
                for (var i = 0; i < this.elements.length; i++) {
                    nodeSet[this.elements[i].node0] = this.elements[i].node0;
                    nodeSet[this.elements[i].node1] = this.elements[i].node1;
                }
                this.nodeSet = _.values(nodeSet);
            }
            return this.nodeSet;
        },

        getNumVars: function() {
            return this.getNodeCount() + this.getCurrentCount();
        },

        sumConductances: function(nodeIndex) {
            var sum = 0;
            for (var i = this.resistors.length - 1; i >= 0; i--) {
                if (this.resistors[i].containsNode(nodeIndex))
                    sum += this.resistors[i].conductance;
            }
            return sum;
        },

        getConductance: function(node1, node2) {
            // Conductances sum:
            var sum = 0;
            for (var i = this.resistors.length - 1; i >= 0; i--) {
                if (this.resistors[i].containsNode(node1) && this.resistors[i].containsNode(node2))
                    sum += this.resistors[i].conductance;
            }
            return sum;
        },

        sumIncomingCurrents: function(nodeIndex) {
            var sum = 0;
            for (var i = 0; i < this.currentSources.length; i++) {
                var cs = this.currentSources[i];
                if (cs.node1 == nodeIndex)
                    sum += cs.current;
            }
            return sum;
        },

        getRHS: function(node) {
            var sum = 0;
            for (var i = 0; i < this.currentSources.length; i++) {
                var c = this.currentSources[i];
                if (c.node1 == node) {
                    // Positive current is entering the node
                    // PhET Comment: "TODO: these signs seem backwards, shouldn't incoming current add?"
                    sum = sum - c.current;
                }
                if (c.node0 == node) {
                    // Positive current is leaving the node
                    sum = sum + c.current;
                }
            }
            return sum;
        },

        /**
         * Incoming current is negative, outgoing is positive
         */
        getIncomingCurrentTerms: function(node) {
            var batteries = this.batteries;
            var resistors = this.resistors;
            var nodeTerms = [];
            var i;

            for (i = 0; i < batteries.length; i++) {
                if (batteries[i].node1 === node)
                    nodeTerms.push(Term.createWithOwner(this, -1, UnknownCurrent.createWithOwner(this, batteries[i])));
            }

            for (i = 0; i < resistors.length; i++) {
                // Treat resistors with R=0 as having unknown current and v1=v2
                if (resistors[i].node1 === node && resistors[i].resistance === 0)
                    nodeTerms.push(Term.createWithOwner(this, -1, UnknownCurrent.createWithOwner(this, resistors[i])));
            }

            for (i = 0; i < resistors.length; i++) {
                if (resistors[i].node1 === node && resistors[i].resistance !== 0) {
                    nodeTerms.push(Term.createWithOwner(this,  1 / resistors[i].resistance, UnknownVoltage.createWithOwner(this, resistors[i].node1)));
                    nodeTerms.push(Term.createWithOwner(this, -1 / resistors[i].resistance, UnknownVoltage.createWithOwner(this, resistors[i].node0)));
                }
            }
            
            return nodeTerms;
        },

        /**
         * Outgoing currents are negative so that incoming + outgoing = 0
         */
        getOutgoingCurrentTerms: function(node) {
            var batteries = this.batteries;
            var resistors = this.resistors;
            var nodeTerms = [];
            var i;

            for (i = 0; i < batteries.length; i++) {
                if (batteries[i].node0 === node)
                    nodeTerms.push(Term.createWithOwner(this, 1, UnknownCurrent.createWithOwner(this, batteries[i])));
            }

            for (i = 0; i < resistors.length; i++) {
                // Treat resistors with R=0 as having unknown current and v1=v2
                if (resistors[i].node0 === node && resistors[i].resistance === 0)
                    nodeTerms.push(Term.createWithOwner(this, 1, UnknownCurrent.createWithOwner(this, resistors[i])));
            }

            for (i = 0; i < resistors.length; i++) {
                if (resistors[i].node0 === node && resistors[i].resistance !== 0) {
                    nodeTerms.push(Term.createWithOwner(this, -1 / resistors[i].resistance, UnknownVoltage.createWithOwner(this, resistors[i].node1)));
                    nodeTerms.push(Term.createWithOwner(this,  1 / resistors[i].resistance, UnknownVoltage.createWithOwner(this, resistors[i].node0)));
                }
            }

            return nodeTerms;
        },

        getCurrentConservationTerms: function(node) {
            var nodeTerms = [].concat(
                this.getIncomingCurrentTerms(node),
                this.getOutgoingCurrentTerms(node)
            );
            return nodeTerms;
        },

        /**
         * Obtain one node for each connected component to have the reference voltage of 0
         */
        getReferenceNodes: function() {
            var remaining = this.getNodeSet().slice();
            var referenceNodes = [];

            remaining.sort();

            while (remaining.length > 0) {
                referenceNodes.push(remaining[0]);
                var connected = this.getConnectedNodes(remaining[0]);

                // Remove all the connected nodes from the remaining nodes
                for (var i = remaining.length - 1; i >= 0; i--) {
                    if (connected.indexOf(remaining[i]) !== -1)
                        remaining.splice(i, 1);
                }
            }

            return referenceNodes;
        },

        getConnectedNodes: function(node) {
            var visited = [];
            var toVisit = [node];
            var connectedNodes = this._getConnectedNodes(visited, toVisit);
            return connectedNodes;
        },

        _getConnectedNodes: function(visited, toVisit) {
            var elements = this.elements;
            while (toVisit.length > 0) {
                var n = toVisit[0];
                visited.push(n);

                for (var i = 0; i < elements.length; i++) {
                    var opposite = elements[i].getOpposite(n);
                    // Only add connected nodes that we haven't visited yet or don't yet plan to
                    if (elements[i].containsNode(n) && visited.indexOf(opposite) === -1 && toVisit.indexOf(opposite) === -1)
                        toVisit.push(opposite);
                }
                
                toVisit.shift();
            }
            return visited;
        },

        getEquations: function() {
            var list = [];
            var i;

            var referenceNodes = this.getReferenceNodes();
            var nodeSet = this.getNodeSet();
            var batteries = this.batteries;
            var resistors = this.resistors;

            // Reference node in each connected component has a voltage of 0
            for (i = 0; i < referenceNodes.length; i++)
                list.push(Equation.createWithOwner(this, 0, Term.createWithOwner(this, 1, UnknownVoltage.createWithOwner(this, referenceNodes[i]))));

            // For each node, charge is conserved
            for (i = 0; i < nodeSet.length; i++)
                list.push(Equation.createWithOwner(this, this.getRHS(nodeSet[i]), this.getCurrentConservationTerms(nodeSet[i])));

            // For each battery, voltage drop is given
            for (i = 0; i < batteries.length; i++) {
                list.push(
                    Equation.createWithOwner(
                        this, 
                        batteries[i].voltage, 
                        Term.createWithOwner(this, -1, UnknownVoltage.createWithOwner(this, batteries[i].node0)), 
                        Term.createWithOwner(this,  1, UnknownVoltage.createWithOwner(this, batteries[i].node1))
                    )
                );
            }

            // If resistor has no resistance, node0 and node1 should have same voltage
            for (i = 0; i < resistors.length; i++) {
                if (resistors[i].resistance === 0) {
                    list.push(
                        Equation.createWithOwner(
                            this, 
                            0, 
                            Term.createWithOwner(this,  1, UnknownVoltage.createWithOwner(this, resistors[i].node0)), 
                            Term.createWithOwner(this, -1, UnknownVoltage.createWithOwner(this, resistors[i].node1))
                        )
                    );    
                }
            }

            return list;
        },

        getUnknownVoltages: function() {
            if (!this.unknownVoltages) {
                var nodeSet = this.getNodeSet();
                var v = [];
                for (var i = 0; i < nodeSet.length; i++)
                    v.push(UnknownVoltage.createWithOwner(this, nodeSet[i]));
                this.unknownVoltages = v;
            }
            
            return this.unknownVoltages;
        },

        getUnknownCurrents: function() {
            if (!this.unknownCurrents) {
                var i;

                var unknowns = [];
                for (i = 0; i < this.batteries.length; i++)
                    unknowns.push(UnknownCurrent.createWithOwner(this, this.batteries[i]));

                // Treat resistors with R=0 as having unknown current and v1=v2
                for (i = 0; i < this.resistors.length; i++) {
                    if (this.resistors[i].resistance === 0)
                        unknowns.push(UnknownCurrent.createWithOwner(this, this.resistors[i]));
                }

                this.unknownCurrents = unknowns;
            }
            
            return this.unknownCurrents;
        },

        getUnknowns: function() {
            var all = [].concat(
                this.getUnknownCurrents(),
                this.getUnknownVoltages()
            );
            return all;
        },

        solve: function() {
            var equations = this.getEquations();

            var A = new Matrix(equations.length, this.getNumVars());
            var z = new Matrix(equations.length, 1);
            var unknowns = this.getUnknowns(); // Store the unknown list for index lookup
            for (var i = 0; i < equations.length; i++)
                equations[i].stamp(i, A, z, unknowns); // TODO: Instead of passing in a function for looking up the index, I'm just going to pass the array, because this is the only place where the stamp function is called anyway

            if (debug) {
                console.log(equations);
                console.log('a=', A);
                console.log('z=', z);
                console.log('unknowns=', this.getUnknowns());
            }

            var x = A.solve(z);
            var unknownVoltages = this.getUnknownVoltages();
            var unknownCurrents = this.getUnknownCurrents();

            var voltageMap = [];
            for (var v = 0; v < unknownVoltages.length; v++)
                voltageMap[unknownVoltages[v].node] = x.get(unknowns.indexOf(unknownVoltages[v]), 0);

            var currentMap = [];
            for (var c = 0; c < unknownCurrents.length; c++)
                currentMap[unknownCurrents[c].element.id] = x.get(unknowns.indexOf(unknownCurrents[c]), 0);

            if (debug) {
                console.log('x=', x);
            }

            return MNASolution.create(voltageMap, currentMap);
        },

        /**
         * Destroys elements and releases this instance to the object pool.
         */
        destroy: function() {
            this.destroyElements(this.batteries);
            this.destroyElements(this.resistors);
            this.destroyElements(this.currentSources);

            // Destroy all terms, equations, and unknowns
            Term.destroyAllOwnedBy(this);
            Equation.destroyAllOwnedBy(this);
            UnknownCurrent.destroyAllOwnedBy(this);
            UnknownVoltage.destroyAllOwnedBy(this);
            
            pool.remove(this);
        },

        /**
         * Destroys all the elements in a given array
         */
        destroyElements: function(elements) {
            for (var i = elements.length - 1; i >= 0; i--) {
                elements[i].destroy();
                elements.splice(i, 1);
            }
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(MNACircuit, {

        /**
         * Initializes and returns a new MNACircuit instance from the object pool.
         *   Accepts the normal constructor parameters and passes them on to
         *   the created instance.
         */
        create: function() {
            var circuit = pool.create();
            circuit.init.apply(circuit, arguments);
            return circuit;
        }

    });


    return MNACircuit;
});