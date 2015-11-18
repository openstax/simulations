define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Switch              = require('models/components/switch');
    var MNAElement          = require('models/mna/elements/element');
    var MNAResistor         = require('models/mna/elements/resistor');
    var MNAResistiveBattery = require('models/mna/elements/battery');
    var MNACapacitor        = require('models/mna/elements/capacitor');
    var MNAInductor         = require('models/mna/elements/inductor');

    var Constants = require('constants');

    /**
     * Solves for unknowns in resistive circuits using the Modified Nodal Analysis (MNA) method.
     *   This method is outlined here: 
     *
     *   http://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA3.html
     *
     * Other links that are helpful for understanding:
     *   
     *   http://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA1.html
     *   http://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA2.html
     *
     * To solve for a circuit's unknowns and apply the solution back for any given point in
     *   time, use the "apply" function.
     */
    var MNACircuitSolver = function() {
        this.errorThreshold = 1E-5;
        this.minDeltaTime = 1E-5;
    };

    _.extend(MNACircuitSolver.prototype, {

        /**
         * Solves the circuit with the modified nodal analysis algorithm and re-
         *   applies the solution to the circuit.
         */
        solve: function(circuit, deltaTime) {
            // Create a DynamicCircuit representation of the simulation circuit
            var dynamicCircuit = DynamicCircuit.fromCircuit(circuit);

            // Find a solution for it using the MNA algorithm
            var solution = this._solveWithSubdivisions(dynamicCircuit, deltaTime);

            // Apply it back to the original solution
            this.applySolution(circuit, solution);

            // Clean up
            dynamicCircuit.destroy();
            solution.destroy();
        },

        /**
         * Breaks it down into smaller time increments so the solution can use
         *   averages of certain values over time.  It returns a DynamicSolution,
         *   which is made up of multiple solutions over the subdivided timesteps
         *   and which also keeps track of the intermediate states that correspond
         *   to those solutions.
         *
         * Note that this function actually creates many states through the
         *   getTimestep function that are not used and do not end up in the
         *   DynamicSolution. These temporary states should be properly destroyed.
         */
        _solveWithSubdivisions: function(dynamicCircuit, deltaTime) {
            
            var state = DynamicState.create(dynamicCircuit);
            var dynamicSolution = DynamicSolution.create();

            var elapsed = 0;
            while (elapsed < deltaTime) {
                // Use the last obtained dt as a starting value, if possible
                var seedValue = dynamicSolution.length() > 0 ? dynamicSolution.getLastTime() : deltaTime;

                // Try to increase first, in case higher dt has acceptable error
                //   but don't try to double dt if it is first state
                var startScale = dynamicSolution.length() > 0 ? 2 : 1;
                var subdivisionDeltaTime = this.getTimestep(state, seedValue * startScale);
                if (subdivisionDeltaTime + elapsed > deltaTime)
                    subdivisionDeltaTime = deltaTime - elapsed; // Don't exceed max allowed dt

                state = this.getNextState(state, subdivisionDeltaTime);
                dynamicSolution.addState(state, subdivisionDeltaTime);

                elapsed += subdivisionDeltaTime;
            }

            return dynamicSolution;
        },

        /**
         * Recursively searches for a value of dt that has acceptable error, starting with the value dt
         */
        getTimestep: function(state, deltaTime) {
            if (deltaTime < this.minDeltaTime) {
                console.warn('Time step too small');
                return this.minDeltaTime;
            }
            else if (this.errorAcceptable(state, deltaTime)) {
                return deltaTime;
            }
            else {
                return this.getTimestep(state, deltaTime / 2 );
            }
        },

        /**
         * Returns whether or not the error level is acceptible for the given
         *   state and deltaTime.  Note that it does this by actually finding
         *   the next state (three times), so it's not a trivial operation.
         */
        errorAcceptable: function(state, deltaTime) {
            var a  = this.getNextState(state, deltaTime);
            var b1 = this.getNextState(state, deltaTime / 2);
            var b2 = this.getNextState(b1,    deltaTime / 2);
            var errorAcceptable = (this.getStateDistance(a, b2) < this.errorThreshold);

            a.destroy();
            b1.destroy();
            b2.destroy();

            return errorAcceptable;
        },

        getStateDistance: function(a, b) {
            var i;

            var aCurrents = [];
            for (i = 0; i < a.dynamicCircuit.capacitors.length; i++)
                aCurrents.push(a.circuit.capacitors[i].current);
            for (i = 0; i < a.dynamicCircuit.inductors.length; i++)
                aCurrents.push(a.circuit.inductors[i].current);

            var bCurrents = [];
            for (i = 0; i < b.dynamicCircuit.capacitors.length; i++)
                bCurrents.push(b.circuit.capacitors[i].current);
            for (i = 0; i < b.dynamicCircuit.inductors.length; i++)
                bCurrents.push(b.circuit.inductors[i].current); // PhET Comment: "todo: read from companion object"

            return this.getEuclideanDistance(aCurrents, bCurrents);
        },

        getEuclideanDistance: function(x, y) {
            if (x.length != y.length)
                throw 'Vector length mismatch';
            
            var sumSqDiffs = 0;
            for (var i = 0; i < x.length; i++)
                sumSqDiffs += Math.pow(x[i] - y[i], 2);
            
            return Math.sqrt(sumSqDiffs);
        },

        /**
         * Solves the current state's circuit with the MNA algorithm and in order
         *   to get the next state.  It then returns the next state.
         */
        getNextState: function(state, deltaTime) {
            var solution = state.dynamicCircuit.solve(deltaTime);
            return state.getNextState(solution);
        },

        /**
         * Applies the found solution to the original circuit.
         */
        applySolution: function(circuit, solution) {
            // Apply the values from the final state and the final solution
            var dynamicCircuit = solution.getFinalState().dynamicCircuit;
            dynamicCircuit.applySolution(solution);

            // Zero out currents on open branches
            for (var i = 0; i < circuit.branches.length; i++ ) {
                if (circuit.branches.at(i) instanceof Switch) {
                    var sw = circuit.branches.at(i);
                    if (sw.get('closed')) {
                        sw.set('current', 0);
                        sw.set('voltageDrop', 0);
                    }
                }
            }

            circuit.set('solution', solution);
        }

    });

    return MNACircuitSolver;
});