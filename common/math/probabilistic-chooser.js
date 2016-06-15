define(function (require) {

    'use strict';

    /**
     *  An object that selects from a collection of objects based on probabilities
     */
    var ProbabilisticChooser = function() {
        this.items = [];
        this.weights = [];
        this._normalizedWeights = [];

        this._dirty = false;

        return this;
    };

    /**
     * Clears all items and probabilities.
     */
    ProbabilisticChooser.prototype.clear = function() {
        this.items.splice(0, this.items.length);
        this.weights.splice(0, this.weights.length);
        this._normalizedWeights.splice(0, this._normalizedWeights.length);

        this._dirty = false;

        return this;
    };

    /**
     * Adds an item with a certain weight to the list.
     */
    ProbabilisticChooser.prototype.add = function(weight, item) {
        this.weights.push(weight);
        this.items.push(item);

        this._dirty = true;

        return this;
    };

    /**
     * Chooses an item based on probability.  A probability value
     *   can be optionally specified.
     */
    ProbabilisticChooser.prototype.get = function(p) {
        if (p === undefined)
            p = Math.random();

        if (this._dirty)
            this.update();

        var result = null;
        for (var i = 0; i < this.items.length && result == null; i++) {
            if (p <= this._normalizedWeights[i])
                result = this.items[i];
        }
        return result;
    };

    /**
     * Updates the internal normalized weights 
     */
    ProbabilisticChooser.prototype.update = function() {
        var i;

        // Get the normalization factor for the probabilities
        var pTotal = 0;
        for (i = 0; i < this.weights.length; i++)
            pTotal += this.weights[i];
        
        var fNorm = 1 / pTotal;

        // Build the internal list that is used for choosing. Each choose-able object is
        //   put in an array, with an associated probability that is the sum of its own
        //   probability plus the cummulative probability of all objects before it in
        //   the list.
        var p = 0;
        for (i = 0; i < this.weights.length; i++) {
            p += this.weights[i] * fNorm;
            this._normalizedWeights[i] = p;
        }

        this._dirty = false;

        return this;
    };


    return ProbabilisticChooser;

});