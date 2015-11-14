define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');

    var MNACapacitor = require('models/mna/elements/capacitor');
    var MNAInductor  = require('models/mna/elements/inductor');
    
    var pool = Pool({
        init: function() {
            return new DynamicCircuit();
        }
    });

    /**
     * 
     */
    var DynamicCircuit = function() {
        // Call init with any arguments passed to the constructor
        this.init.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(DynamicCircuit.prototype, {

        /**
         * Initializes the DynamicCircuit's properties with provided initial values
         */
        init: function() {
            
        },

        /**
         * Clones the circuit and then updates the dynamic elements with a given MNASolution.
         */
        cloneWithSolution: function(solution) {
            var i;

            var updatedCapacitors = [];
            for (i = 0; i < this.capacitors.length; i++)
                updatedCapacitors.push(this.capacitors[i].cloneWithSolution(solution));

            var updatedInductors = [];
            for (var i = 0; i < this.inductors.length; i++)
                updatedCapacitors.push(this.inductors[i].cloneWithSolution(solution));

            return this.create(
                this.batteries, 
                this.resistors, 
                this.currents, 
                this.resistiveBatteries, 
                updatedCapacitors, 
                updatedInductors
            );
        },

        /**
         * Destroys elements and releases this instance to the object pool.
         */
        destroy: function() {
            
            pool.remove(this);
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(DynamicCircuit, {

        /**
         * Initializes and returns a new DynamicCircuit instance from the object pool.
         *   Accepts the normal constructor parameters and passes them on to
         *   the created instance.
         */
        create: function() {
            var circuit = pool.create();
            circuit.init.apply(circuit, arguments);
            return circuit;
        }

    });


    return DynamicCircuit;
});