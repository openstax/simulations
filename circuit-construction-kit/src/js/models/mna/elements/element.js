define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');

    var PooledObject = require('common/pooled-object/pooled-object');
    
    var elementId = 0;

    /**
     * This class represents an Element in a circuit, such as a Battery, Resistor, Capacitor, etc.
     *   Comparisons must be made based on the identity of the object, not based on the content of
     *   the object, since, e.g., two identical resistors may connect the same nodes, and they
     *   should not be treated as the same resistor.
     */
    var MNAElement = PooledObject.extend({

    /**
     * Instance functions/properties
     */

        /**
         * Initializes the MNAElement's properties with provided initial values
         */
        init: function(originalComponent, node0, node1) {
            this.originalComponent = originalComponent;
            this.node0 = node0;
            this.node1 = node1;
        },

        /**
         * Applies the final DynamicSolution back to the original component.
         */
        applySolution: function(solution) {},

        /**
         * Updates the element's attributes with values from a given MNASolution.
         */
        updateWithSolution: function(solution) {},

        /**
         * Returns whether or not the given node is part of this element.
         */
        containsNode: function(n) {
            return n === this.node0 || n === this.node1;
        },

        /**
         * Returns node0 if node1 given, and vice versa.
         */
        getOpposite: function(node) {
            if (node == this.node0)
                return this.node1;
            else if (node == this.node1)
                return this.node0;
            else
                throw 'node not found';
        },

        /**
         * Returns whether a given element is equivalent to this element.
         */
        equivalentTo: function(element) {
            if (this.node0 !== element.node0 || this.node1 !== element.node1)
                return false;
            if (this.currentSolution !== element.currentSolution)
                return false;
            return true;
        },

        /**
         * Makes a clone of this instance, applies a solution as an update, and returns it.
         */
        cloneWithSolution: function(solution) {
            var clone = this.clone();
            clone.updateWithSolution(solution);
            return clone;
        },

        /**
         * Returns a copy of this instance
         */
        clone: function() {
            return MNAElement.create(this.originalComponent, this.node0, this.node1);
        }

    }, {

    /**
     * Static functions/properties
     */

        extend: function() {
            var child = PooledObject.extend.apply(this, arguments);
            child.getPoolConfig = _.bind(this.getPoolConfig, child);
            return child;
        },

        /**
         * Returns the configuration to pass to the Pool constructor. This is meant
         *   to be overriden by child classes if necessary.
         */
        getPoolConfig: function() {
            var Constructor = this;
            return {
                init: function() {
                    var element = new Constructor();
                    element.id = elementId++;
                    return element;
                }
            };
        },

        /**
         * Creates a new MNAElement from the original circuit component and the circuit.
         *   This is basically the opposite of applySolution; it is used at the beginning
         *   to create the MNAElement, whereas applySolution applies the element's state
         *   back to the originalComponent.
         */
        fromCircuitComponent: function(circuit, branch) {
            console.log(circuit.junctions.indexOf(branch.get('startJunction')), circuit.junctions.indexOf(branch.get('endJunction')))
            var element = this.create(
                branch, 
                circuit.junctions.indexOf(branch.get('startJunction')), 
                circuit.junctions.indexOf(branch.get('endJunction'))
            );
            return element;
        }

    });


    return MNAElement;
});