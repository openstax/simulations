define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');
    
    var pool = Pool({
        init: function() {
            return new DynamicSolution();
        }
    });

    /**
     * This is a mix of PhET's MNAAdapter.CircuitResult and ResultSet.  I've renamed
     *   it to hint at the fact that it's supposed to be a solution to be applied to a
     *   circuit just as much as the solutions returned by the MNA algorithm.  Whereas
     *   the solutions returned from the MNA algorithm are to be applied to a single
     *   timestep (but could be applied at any level), the DynamicSolution is to be
     *   applied over the original DynamicCircuit instance as a final solution.
     */
    var DynamicSolution = function() {
        this.states = [];
        this.times = [];
    };

    /**
     * Instance functions/properties
     */
    _.extend(DynamicSolution.prototype, {

        addState: function(state, deltaTime) {
            this.states.push(state);
            this.times.push(deltaTime);
        },

        length: function() {
            return this.states.length;
        },

        getFinalState: function() {
            return this.states[this.states.length - 1];
        },

        getLastTime: function() {
            return this.times[this.times.length - 1];
        },

        getTotalTime: function() {
            var total = 0;
            for (var i = 0; i < this.times.length; i++)
                total += this.times[i];
            return total;
        },

        getTimeAverageCurrent: function(element) {
            var weightedSum = 0;
            for (var i = 0; i < this.states.length; i++)
                weightedSum += this.states[i].solution.getCurrent(element) * this.times[i];
            return weightedSum / this.getTotalTime();
        },

        getTimeAverageVoltage: function(element) {
            var weightedSum = 0;
            for (var i = 0; i < this.states.length; i++)
                weightedSum += this.states[i].solution.getVoltage(element) * this.times[i];
            return weightedSum / this.getTotalTime();
        },

        getAverageNodeVoltage: function(node) {
            var weightedSum = 0;
            for (var i = 0; i < this.states.length; i++)
                weightedSum += this.states[i].solution.getNodeVoltage(node) * this.times[i];
            return weightedSum / this.getTotalTime();
        },

        getInstantaneousCurrent: function(element) {
            return this.getFinalState().solution.getCurrent(element);
        },

        getInstantaneousVoltage: function(element) {
            return this.getFinalState().solution.getVoltage(element);
        },

        getInstantaneousNodeVoltage: function(node) {
            return this.getFinalState().solution.getNodeVoltage(node);
        },

        /**
         * Destroys all states and releases this instance to the object pool.
         */
        destroy: function() {
            var i = 0;

            // Destroy all states and clear the states array
            for (i = this.states.length - 1; i >= 0; i--) {
                this.states[i].destroy();
                this.states.splice(i, 1);
            }

            // Clear the times array
            for (i = this.times.length - 1; i >= 0; i--)
                this.times.splice(i, 1);

            pool.remove(this);
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(DynamicSolution, {

        /**
         * Initializes and returns a new DynamicSolution instance from the object pool.
         */
        create: function() {
            var solution = pool.create();
            return solution;
        }

    });


    return DynamicSolution;
});