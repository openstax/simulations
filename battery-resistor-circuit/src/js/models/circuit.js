define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Circuit = function() {
        this.patches = [];
    };

    /**
     * Instance functions/properties
     */
    _.extend(Circuit.prototype, {

        update: function(deltaTime, system) {
            throw 'Update function not implemented.';
        },

        addWirePatch: function(wirePatch) {
            this.patches.push(wirePatch);
            return this;
        },

        getPatch: function(position) {
            var sum = 0;
            for (var i = 0; i < this.patches.length; i++) {
                sum += this.patches[i].totalDistance();
                if (position <= sum)
                    return this.patches[i];
            }
            throw 'Patch not found for position=' + position + ', length=' + this.getLength();
        },

        getLocalPosition: function(global, patch) {
            var sum = 0;
            for (var i = 0; i < this.patches.length; i++) {
                if (this.patches[i] == patch)
                    return global - sum;

                sum += this.patches[i].totalDistance();
            }
            throw 'Patch not found.';
        },

        getLength: function() {
            var sum = 0;
            for (var i = 0; i < this.patches.length; i++)
                sum += this.patches[i].totalDistance();
            return sum;
        }

    });

    return Circuit;
});
