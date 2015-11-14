define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');

    var MNACircuit   = require('models/mna/mna-circuit');
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
    var DynamicCircuit = function(batteries, resistors, currents, resistiveBatteries, capacitors, inductors) {
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
        init: function(batteries, resistors, currents, resistiveBatteries, capacitors, inductors) {
            this.batteries = batteries.slice();
            this.resistors = resistors.slice();
            this.currents = currents.slice();
            this.resistiveBatteries = resistiveBatteries.slice();
            this.capacitors = capacitors.slice();
            this.inductors = inductors.slice();
        },

        /**
         * Applies the given DynamicSolution to all the appropriate elements.  Each
         *   element actually keeps its own reference to the original circuit component
         *   that it was representing, so by just applying the solution to each of the
         *   elements, we'll get a simulation circuit that matches the new solution.
         */
        applySolution: function(solution) {
            var i;

            for (var i = 0; i < this.resistiveBatteries.length; i++)
                this.resistiveBatteries[i].applySolution(solution);

            for (var i = 0; i < this.resistors.length; i++)
                this.resistors[i].applySolution(solution);

            for (var i = 0; i < this.capacitors.length; i++)
                this.capacitors[i].applySolution(solution);

            for (var i = 0; i < this.inductors.length; i++)
                this.inductors[i].applySolution(solution);
        },

        /**
         * Creates a new MNACircuit representation of this DynamicCircuit instance
         *   with the given deltaTime and returns it.
         */
        toMNACircuit: function() {
            var mnaCircuit;
            // TODO: implement it -- code found in PhET's DynamicCircuit.toMNACircuit
            return mnaCircuit;
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
            this.destroyElements(this.batteries);
            this.destroyElements(this.resistors);
            this.destroyElements(this.currents);
            this.destroyElements(this.resistiveBatteries);
            this.destroyElements(this.capacitors);
            this.destroyElements(this.inductors);
            
            pool.remove(this);
        },

        /**
         * Destroys all the elements in a given array
         */
        destroyElements: function(elements) {
            for (var i = elements.length - 1; i >= 0; i--) {
                elements[i].destroy();
                elements.slice(i, 1);
            }
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
        },

        /**
         * Creates a new DynamicCircuit from a simulation circuit. This is basically
         *   the opposite of applySolution; it is used at the beginning to create the
         *   first DynamicCircuit, while applySolution applies the dynamic circuit's
         *   final state back to the original simulation circuit.
         */
        fromCircuit: function(circuit) {
            var batteries  = [];
            var resistors  = [];
            var capacitors = [];
            var inductors  = [];

            var branches = circuit.branches;
            var branch;
            for (var i = 0; i < branches.length; i++) {
                var branch = branches.at(i);

                if (branch instanceof Battery) {
                    batteries.push(MNAResistiveBattery.fromCircuitComponent(circuit, branch));
                }
                else if (
                    branch instanceof Resistor || 
                    branch instanceof Wire     || 
                    branch instanceof Filament || 
                    branch instanceof Filament || 
                    branch instanceof Bulb     || 
                    branch instanceof Bulb     || 
                    branch instanceof SeriesAmmeter
                ) {
                    resistors.push(MNAResistor.fromCircuitComponent(circuit, branch));
                }
                else if (branch instanceof Switch) {
                    if (branch.get('closed') )
                        resistors.push(MNAResistor.fromCircuitComponent(circuit, branch));
                    // Else do nothing, since no closed circuit there; current is zeroed out at the end
                }
                else if (branch instanceof Capacitor) {
                    capacitors.push(MNACapacitor.fromCircuitComponent(circuit, branch));
                }
                else if (branch instanceof Inductor) {
                    inductors.push(MNAInductor.fromCircuitComponent(circuit, branch));
                }
            }

            var dynamicCircuit = DynamicCircuit.create([], resistors, [], batteries, capacitors, inductors);
            return dynamicCircuit;
        }

    });


    return DynamicCircuit;
});