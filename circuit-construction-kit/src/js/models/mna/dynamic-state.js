define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');
    
    var pool = Pool({
        init: function() {
            return new DynamicState();
        }
    });

    /**
     * 
     */
    var DynamicState = function(dynamicCircuit, solution) {
        // Call init with any arguments passed to the constructor
        this.init.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(DynamicState.prototype, {

        /**
         * Initializes the DynamicState's properties with provided initial values
         */
        init: function(dynamicCircuit, solution) {
            this.dynamicCircuit = dynamicCircuit;
            this.solution = solution; // The previous solution that got us here
        },

        /**
         * Returns a new state that uses this state's circuit and applies the given solution.
         */
        nextState: function(solution) {
            var nextDynamicCircuit = this.dynamicCircuit.cloneWithSolution(solution);
            return DynamicState.create(nextDynamicCircuit, solution);
        },

        /**
         * Destroys circuit and solution and releases this instance to the object pool.
         */
        destroy: function() {
            this.dynamicCircuit.destroy();
            this.solution.destroy();

            pool.remove(this);
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(DynamicState, {

        /**
         * Initializes and returns a new DynamicState instance from the object pool.
         *   Accepts the normal constructor parameters and passes them on to
         *   the created instance.
         */
        create: function() {
            var state = pool.create();
            state.init.apply(state, arguments);
            return state;
        }

    });


    return DynamicState;
});