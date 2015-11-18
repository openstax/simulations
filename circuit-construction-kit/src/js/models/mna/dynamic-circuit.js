define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');

    var Battery                     = require('models/components/battery');
    var Resistor                    = require('models/components/resistor');
    var Filament                    = require('models/components/filament');
    var Bulb                        = require('models/components/bulb');
    var SeriesAmmeter               = require('models/components/series-ammeter');
    var Switch                      = require('models/components/switch');
    var Capacitor                   = require('models/components/capacitor');
    var Inductor                    = require('models/components/inductor');
    var Wire                        = require('models/components/wire');
    var MNACircuit                  = require('models/mna/mna-circuit');
    var MNACapacitor                = require('models/mna/elements/capacitor');
    var MNAInductor                 = require('models/mna/elements/inductor');
    var MNAResistiveBattery         = require('models/mna/elements/resistive-battery');
    var MNAResistor                 = require('models/mna/elements/resistor');
    var MNACompanionResistor        = require('models/mna/elements/companion-resistor');
    var MNACompanionBattery         = require('models/mna/elements/companion-battery');
    var IntermediateDynamicSolution = require('models/mna/intermediate-dynamic-solution');
    
    var pool = Pool({
        init: function() {
            return new DynamicCircuit();
        }
    });

    var _parseInt = function(value) { return parseInt(value); };

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

            for (i = 0; i < this.resistiveBatteries.length; i++)
                this.resistiveBatteries[i].applySolution(solution);

            for (i = 0; i < this.resistors.length; i++)
                this.resistors[i].applySolution(solution);

            for (i = 0; i < this.capacitors.length; i++)
                this.capacitors[i].applySolution(solution);

            for (i = 0; i < this.inductors.length; i++)
                this.inductors[i].applySolution(solution);
        },

        solve: function(deltaTime) {
            // Elements now have IDs, so currentCompanions can just use an element's id as the key.
            var currentCompanions = [];

            // Pass the currentCompanions array in so it can be filled
            var mnaCircuit = this.toMNACircuit(deltaTime, currentCompanions);
            var mnaSolution = mnaCircuit.solve();

            var intermediateSolution = IntermediateDynamicSolution.create(mnaSolution, currentCompanions);
            return intermediateSolution;
        },

        /**
         * Creates a new MNACircuit representation of this DynamicCircuit instance
         *   with the given deltaTime and returns it.  Also fills a given array
         *   of currentCompanions with functions for getting currents from 
         *   companion components.
         */
        toMNACircuit: function(deltaTime, currentCompanions) {
            var i;

            var companionBatteries = [];
            var companionResistors = [];
            var companionCurrents  = [];

            
            // usedNodes is supposed to be a HashSet, but it's only used in this function to find
            //   out at what number to start creating node indices for inductors and capacitors,
            //   so I'm just going to make it an array but store the values as keys.
            var usedNodes = [];

            var elements = [].concat(
                this.batteries,
                this.resistors,
                this.resistiveBatteries,
                this.currents,
                this.capacitors,
                this.inductors
            );

            for (i = 0; i < elements.length; i++) {
                usedNodes[elements[i].node0] = true;
                usedNodes[elements[i].node1] = true;
            }

            // Get the starting index for the new nodes
            var newNode = _.max(_.map(_.keys(usedNodes), _parseInt)) + 1;

            // See also http://circsimproj.blogspot.com/2009/07/companion-models.html
            // See najm page 279
            // Pillage p 86

            // Each resistive battery is a resistor in series with a battery
            for (i = 0; i < this.resistiveBatteries.length; i++) {
                var b = this.resistiveBatteries[i];

                var idealBattery = MNACompanionBattery.create(b.node0, newNode, b.voltage);
                var idealResistor = MNACompanionResistor.create(newNode, b.node1, b.resistance);
                companionBatteries.push(idealBattery);
                companionResistors.push(idealResistor);
                // We need to be able to get the current for this component
                currentCompanions[b.id] = idealBattery;

                // Increment the index for new nodes
                newNode++;
            }

            var companionResistance;
            var companionVoltage;
            var battery;
            var resistor;
            var capacitor;
            var inductor;

            // Add companion models for capacitor
            for (i = 0; i < this.capacitors.length; i++) {
                capacitor = this.capacitors[i];
                // In series

                companionResistance = deltaTime / 2.0 / capacitor.capacitance;
                companionVoltage = capacitor.voltage - companionResistance * capacitor.current;

                battery = new MNACompanionBattery(capacitor.node0, newNode, companionVoltage);
                resistor = new MNACompanionResistor(newNode, capacitor.node1, companionResistance);
                companionBatteries.push(battery);
                companionResistors.push(resistor);

                // In series, so current is same through both companion components
                currentCompanions[capacitor.id] = battery;

                // Increment the index for new nodes
                newNode++;
            }

            // Add companion models for inductor
            for (i = 0; i < this.inductors.length; i++) {
                inductor = this.inductors[i];
                // In series

                companionResistance = 2 * inductor.inductance / deltaTime;
                companionVoltage = inductor.voltage + companionResistance * inductor.current;

                battery = new MNACompanionBattery(newNode, inductor.node0, companionVoltage);
                resistor = new MNACompanionResistor(newNode, inductor.node1, companionResistance);
                companionBatteries.push(battery);
                companionResistors.push(resistor);

                // In series, so current is same through both companion components
                currentCompanions[inductor.id] = battery;

                // Increment the index for new nodes
                newNode++;
            }

            // TODO: implement it --------

            var mnaCircuit = MNACircuit.create(
                this.batteries.concat(companionBatteries),
                this.resistors.concat(companionResistors),
                this.currents.concat(companionCurrents)
            );

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
            for (i = 0; i < this.inductors.length; i++)
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
                elements.splice(i, 1);
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
                branch = branches.at(i);

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