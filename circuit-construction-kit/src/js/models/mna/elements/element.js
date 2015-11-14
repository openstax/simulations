define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');
    
    var pool = Pool({
        init: function() {
            return new MNAElement();
        }
    });

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * This class represents an Element in a circuit, such as a Battery, Resistor, Capacitor, etc.
     *   Comparisons must be made based on the identity of the object, not based on the content of
     *   the object, since, e.g., two identical resistors may connect the same nodes, and they
     *   should not be treated as the same resistor.
     */
    var MNAElement = function(originalComponent, node0, node1) {
        // Call init with any arguments passed to the constructor
        this.init.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(MNAElement.prototype, {

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
        },

        /**
         * Releases this instance to the object pool.
         */
        destroy: function() {
            pool.remove(this);
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(MNAElement, {

        /**
         * Initializes and returns a new MNAElement instance from the object pool.
         *   Accepts the normal constructor parameters and passes them on to
         *   the created instance.
         */
        create: function() {
            var element = pool.create();
            element.init.apply(element, arguments);
            return element;
        }

    });


    return MNAElement;
});