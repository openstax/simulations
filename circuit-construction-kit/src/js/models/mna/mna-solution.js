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

    var DEFAULT_EPSILON = 1E-6;

    /**
     * 
     */
    var MNASolution = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(MNASolution.prototype, {

        /**
         * nodeVoltages is an array of voltage solutions indexed by the node number.
         * branchCurrents is an array of arrays that hold the element and the current
         *   solution, in that order.
         */
        init: function(nodeVoltages, branchCurrents) {
            this.nodeVoltages = nodeVoltages;
            this.branchCurrents = branchCurrents;
        },

        getNodeVoltage: function(node) {
            return this.nodeVoltages[node];
        },

        numbersApproxEqual: function(a, b, epsilon) {
            return Math.abs(a - b) <= epsilon;
        },

        getNodes: function() {
            return _.keys(this.nodeVoltages);
        },

        getBranches: function() {
            return _.values(this.branchCurrents);
        },

        arraysEqual: function(a, b) {
            return _.difference(a, b).length === 0;
        },

        branchArraysEqual: function(a, b, epsilon) {
            var i;
            for (i = 0; i < a.length; i++) {
                if (!this.arrayContainsBranch(b, a[i], epsilon))
                    return false;
            }
            for (i = 0; i < b.length; i++) {
                if (!this.arrayContainsBranch(a, b[i], epsilon))
                    return false;
            }
            return true;
        },

        arrayContainsBranch: function(array, branch, epsilon) {
            return (this.indexOfEquivalentBranch(array, branch, epsilon) !== -1);
        },

        indexOfEquivalentBranch: function(array, branch, epsilon) {
            for (var i in array) {
                if (array.hasOwnProperty(i) && array[i].equivalentTo(branch, epsilon))
                    return i;
            }
            return -1;
        },

        approxEquals: function(solution, epsilon) {
            if (epsilon === undefined)
                epsilon = DEFAULT_EPSILON;

            if (!this.arraysEqual(this.getNodes(), solution.getNodes()) || 
                !this.branchArraysEqual(this.getBranches(), solution.getBranches(), epsilon)
            ) {
                return false;
            }
            else {
                var sameVoltages = true;
                for (var node in this.nodeVoltages) {
                    if (this.nodeVoltages.hasOwnProperty(node) && 
                        !this.numbersApproxEqual(
                            this.nodeVoltages[node], 
                            solution.getNodeVoltage(node), 
                            epsilon
                        )
                    ) {
                        sameVoltages = false;
                        break;
                    }
                }
                var sameCurrents = true;
                for (var elementId in this.branchCurrents) {
                    if (this.branchCurrents.hasOwnProperty(elementId) && 
                        !this.numbersApproxEqual(
                            this.branchCurrents[elementId].currentSolution, 
                            solution.getCurrent(this.branchCurrents[elementId]), 
                            epsilon
                        )
                    ) {
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
            var branchIndex = this.indexOfEquivalentBranch(this.branchCurrents, e, DEFAULT_EPSILON);
            if (branchIndex !== -1) {
                return this.branchCurrents[branchIndex].currentSolution;
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
                if (this.nodeVoltages.hasOwnProperty(node)) {
                    distanceVoltage +=  Math.abs(this.nodeVoltages[node] - solution.getNodeVoltage(node));
                    totalNodes++;
                }
            }
 
            var averageVoltDist = (totalNodes > 0) ? distanceVoltage / totalNodes : 0;

            return averageVoltDist + Math.abs(this.getAverageCurrentMags() - solution.getAverageCurrentMags());
        },

        getAverageCurrentMags: function() {
            var totalElements = 0;
            var c = 0;
            for (var elementId in this.branchCurrents) {
                if (this.branchCurrents.hasOwnProperty(elementId)) {
                    c += Math.abs(this.branchCurrents[elementId]);
                    totalElements++;
                }
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
            solution.init.apply(solution, arguments);
            return solution;
        }

    });


    return MNASolution;
});