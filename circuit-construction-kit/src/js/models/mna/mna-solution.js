define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');

    var MNAResistor          = require('models/mna/elements/resistor');
    var MNACompanionResistor = require('models/mna/elements/companion-resistor');
    
    var pool = Pool({
        init: function() {
            return new MNASolution();
        }
    });

    /**
     * 
     */
    var MNASolution = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(MNASolution.prototype, {

        init: function(nodeVoltages, branchCurrents) {
            this.nodeVoltages = nodeVoltages;
            this.branchCurrents = branchCurrents;
        },

        getNodeVoltage: function(node) {
            return this.nodeVoltages[node];
        },

        numbersApproxEqual: function(a, b, delta) {
            return Math.abs(a - b) < delta;
        },

        getNodes: function() {
            return _.keys(nodeVoltages);
        },

        getBranches: function() {
            return _.keys(branchCurrents);
        },

        arraysEqual: function(a, b) {
            return _.difference(a, b).length === 0;
        },

        approxEquals: function(solution, delta) {
            if (delta === undefined)
                delta = 1E-6;

            if (!this.arraysEqual(this.getNodes(), solution.getNodes()) || !this.arraysEqual(this.getBranches(), solution.getBranches())) {
                return false;
            }
            else {
                var sameVoltages = true;
                for (var node in this.nodeVoltages) {
                    if (!this.numbersApproxEqual(nodeVoltages[node], solution.getNodeVoltage(node), delta)) {
                        sameVoltages = false;
                        break;
                    }
                }
                var sameCurrents = true;
                for (var elementId in this.branchCurrents) {
                    if (!this.numbersApproxEqual(this.branchCurrents[elementId], solution.getCurrent(elementId), delta)) {
                        sameCurrents = false;
                        break;
                    }
                }

                return sameVoltages && sameCurrents;
            }
        },

        getVoltage: function(e) {
            return this.nodeVoltages[e.node1] - this.nodeVoltages[e.node0];
        },

        getCurrent: function(e) {
            // If it was a battery or resistor (of R=0), look up the answer
            if (this.branchCurrents[e.id] !== undefined) {
                return this.branchCurrents[e.id];
            }
            // Else compute based on V=IR
            else {
                if (e instanceof MNAResistor || e instanceof MNACompanionResistor) {
                    return -this.getVoltage(e) / e.resistance;
                }
                else {
                    throw 'Solution does not contain current for element: ' + e;
                }
            }
        },

        distance: function(solution) {
            var totalNodes = 0;
            var distanceVoltage = 0;
            for (var node in this.nodeVoltages) {
                distanceVoltage +=  Math.abs(this.nodeVoltages[node] - solution.getNodeVoltage(node));
                totalNodes++;
            }
 
            var averageVoltDist = (totalNodes > 0) ? distanceVoltage / totalNodes : 0;

            return averageVoltDist + Math.abs(this.getAverageCurrentMags() - solution.getAverageCurrentMags());
        },

        getAverageCurrentMags: function() {
            var totalElements = 0;
            var c = 0;
            for (var elementId in this.branchCurrents) {
                c += Math.abs(this.branchCurrents[elementId]);
                totalElements++;
            }
            return (totalElements > 0) ? c / totalElements : 0;
        },

        /**
         * Destroys all states and releases this instance to the object pool.
         */
        destroy: function() {
            pool.remove(this);
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(MNASolution, {

        /**
         * Initializes and returns a new MNASolution instance from the object pool.
         */
        create: function() {
            var solution = pool.create();
            return solution;
        }

    });


    return MNASolution;
});