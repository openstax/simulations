define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');
    
    var pool = Pool({
        init: function() {
            return new IntermediateDynamicSolution();
        }
    });

    /**
     * 
     */
    var IntermediateDynamicSolution = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(IntermediateDynamicSolution.prototype, {

        init: function(mnaSolution, currentCompanions) {
            this.mnaSolution = mnaSolution;
            this.currentCompanions = currentCompanions;
        },

        getNodeVoltage: function(node) {
            return this.mnaSolution.getNodeVoltage(node);
        },

        getCurrent: function(element) {
            if (this.currentCompanions[element.id] !== undefined)
                return this.mnaSolution.getCurrent(this.currentCompanions[element.id]);
            else 
                return this.mnaSolution.getCurrent(element);
        },

        getVoltage: function(element) {
            return this.getNodeVoltage(element.node1) - this.getNodeVoltage(element.node0);
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
    _.extend(IntermediateDynamicSolution, {

        /**
         * Initializes and returns a new IntermediateDynamicSolution instance from the object pool.
         */
        create: function() {
            var solution = pool.create();
            solution.init.apply(solution, arguments);
            return solution;
        }

    });


    return IntermediateDynamicSolution;
});