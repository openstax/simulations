define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var setOptions = { add: true, remove: true, merge: true };
    var addOptions = { add: true, remove: false, merge: false };
    var unshiftOptions = _.extend({ at: 0 }, addOptions);
    var emptyOptions = {};
    var silentOptions = { silent: true };

    var splice = function(array, insert, at) {
        at = Math.min(Math.max(at, 0), array.length);
        var tail = Array(array.length - at);
        var length = insert.length;
        for (var i = 0; i < tail.length; i++) tail[i] = array[i + at];
        for (i = 0; i < length; i++) array[i + at] = insert[i];
        for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
    };

    /**
     * This is a replacement for Backbone.Collection that can be used with
     *   vanilla JavaScript objects but with some of the benefits that the
     *   Backbone version offers, like events for adding and removing.
     *   Note that this is not meant to be a complete replacement for the
     *   Backbone version, but it should at least use the same interface
     *   for the features that it does replace so it can be swapped out
     *   without changing much code.  Features should be added to this as
     *   needed.
     *
     * Much of this code is from the original Backbone.Collection source
     *   or is a modified version of it.  The original is distributed
     *   under the MIT license.
     */
    var VanillaCollection = function(models, options) {
        options || (options = {});
        if (options.comparator !== undefined) 
            this.comparator = options.comparator;
        this._reset();
        this.initialize.apply(this, arguments);
        if (models) 
            this.reset(models);
    };

    /**
     * Instance functions/properties
     */
    _.extend(VanillaCollection.prototype, Backbone.Events, {

        initialize: function() {
            this._pushOptions = _.extend({ at: this.length }, addOptions);
        },

        add: function(models, options) {
            if (options)
                return this.set(models, _.extend(addOptions, options));
            else
                return this.set(models, addOptions);
        },

        push: function(model, options) {
            // Calling `set` instead of `add` is a design decision.  I've pre-combined the
            //   'push' and 'add' options to avoid calling `extend` if it's unnecessary.
            this._pushOptions.at = this.length;
            if (options)
                return this.set(model, _.extend(this._pushOptions, options));
            else
                return this.set(model, this._pushOptions);
        },

        pop: function(options) {
            var model = this.at(this.length - 1);
            return this.remove(model, options);
        },

        unshift: function(model, options) {
            // Calling `set` instead of `add` is a design decision.  I've pre-combined the
            //   'push' and 'add' options to avoid calling `extend` if it's unnecessary.
            if (options)
                return this.set(model, _.extend(unshiftOptions, options));
            else
                return this.set(model, unshiftOptions);
        },

        shift: function(options) {
            var model = this.at(0);
            return this.remove(model, options);
        },

        set: function(models, options) {
            if (models == null) return;

            options = _.defaults({}, options, setOptions);
            if (options.parse && !this._isModel(models)) models = this.parse(models, options);

            var singular = !_.isArray(models);
            models = singular ? [models] : models.slice();

            var at = options.at;
            if (at != null) at = +at;
            if (at < 0) at += this.length + 1;

            var toAdd = [];
            var toRemove = [];
            var modelMap = {};

            var add = options.add;
            var merge = options.merge;
            var remove = options.remove;

            var sort = false;
            var sortable = this.comparator && (at == null) && options.sort !== false;
            var sortAttr = _.isString(this.comparator) ? this.comparator : null;

            // Add models that aren't already in the collection to toAdd
            var model, i;
            for (i = 0; i < models.length; i++) {
                model = models[i];

                // If a duplicate is found, prevent it from being added
                var existing = this.get(model);
                if (!existing && add) {
                    toAdd.push(model);
                    this._addReference(model);
                }
            }

            // Remove stale models.
            if (remove) {
                // If the `remove` option was set, we want to remove all
                // models that aren't in the current set of models being
                // added or set
                for (i = 0; i < this.length; i++) {
                    model = this.models[i];
                    if (models.indexOf(model) === -1) 
                        toRemove.push(model);
                }
                if (toRemove.length)
                    this._removeModels(toRemove, options);
            }

            // See if sorting is needed, update `length` and splice in new models.
            if (toAdd.length) {
                if (sortable)
                    sort = true;
                splice(this.models, toAdd, at == null ? this.length : at);
                this.length = this.models.length;
            }

            // Silently sort the collection if appropriate.
            if (sort)
                this.sort(silentOptions);

            // Unless silenced, it's time to fire all appropriate add/sort/update events.
            if (!options.silent) {
                for (i = 0; i < toAdd.length; i++) {
                    if (at != null) options.index = at + i;
                    model = toAdd[i];
                    this.trigger('add', model, this, options);
                }

                if (sort) 
                    this.trigger('sort', this, options);

                if (toAdd.length || toRemove.length) {
                    options.changes = {
                        added: toAdd,
                        removed: toRemove
                    };
                    this.trigger('update', this, options);
                }
            }

            // Return the added (or merged) model (or models).
            return singular ? models[0] : models;
        },

        remove: function(models, options) {
            if (!options)
                options = emptyOptions;
            var singular = !_.isArray(models);
            models = singular ? [models] : _.clone(models);
            var removed = this._removeModels(models, options);
            if (!options.silent && removed) this.trigger('update', this, options);
            return singular ? removed[0] : removed;
        },

        reset: function(models, options) {
            options = options ? _.clone(options) : {};
            // Remove references in each model to this collection
            for (var i = 0; i < this.models.length; i++)
                this._removeReference(this.models[i]);
            // Reset and add models
            this._reset();
            models = this.add(models, _.extend({silent: true}, options));
            // Trigger the reset event
            if (!options.silent)
                this.trigger('reset', this, options);
            return models;
        },

        get: function(obj) {
            if (obj == null) return void 0;
            for (var i = 0; i < this.models.length; i++) {
                if (obj === this.models[i])
                    return obj;
            }
            return null;
        },

        at: function(index) {
            if (index < 0) index += this.length;
            return this.models[index];
        },

        sort: function(options) {
            var comparator = this.comparator;
            if (!comparator) throw new Error('Cannot sort a set without a comparator');
            options || (options = {});

            var length = comparator.length;
            if (_.isFunction(comparator)) comparator = _.bind(comparator, this);

            // Run sort based on type of `comparator`.
            if (length === 1 || _.isString(comparator)) {
                this.models = this.sortBy(comparator);
            } else {
                this.models.sort(comparator);
            }
            if (!options.silent) this.trigger('sort', this, options);
            return this;
        },

        _removeModels: function(models, options) {
            var removed = [];
            for (var i = 0; i < models.length; i++) {
                var model = this.get(models[i]);
                if (!model)
                    continue;

                var index = this.indexOf(model);
                this.models.splice(index, 1);
                this.length--;

                if (!options.silent) {
                    options.index = index;
                    this.trigger('remove', model, this, options);
                }

                removed.push(model);
                this._removeReference(model, options);
            }
            return removed.length ? removed : false;
        },

        _reset: function() {
            this.length = 0;
            this.models = [];
        },

        _addReference: function(model) {
            model.collection = this;
        },

        _removeReference: function(model) {
            if (this === model.collection) 
                delete model.collection;
        },

        // Underscore methods
        forEach:     Backbone.Collection.prototype.forEach,
        each:        Backbone.Collection.prototype.each,
        map:         Backbone.Collection.prototype.map,
        collect:     Backbone.Collection.prototype.collect,
        reduce:      Backbone.Collection.prototype.reduce,
        foldl:       Backbone.Collection.prototype.foldl,
        inject:      Backbone.Collection.prototype.inject,
        reduceRight: Backbone.Collection.prototype.ight,
        foldr:       Backbone.Collection.prototype.foldr,
        find:        Backbone.Collection.prototype.find,
        detect:      Backbone.Collection.prototype.detect,
        filter:      Backbone.Collection.prototype.filter,
        select:      Backbone.Collection.prototype.select,
        reject:      Backbone.Collection.prototype.reject,
        every:       Backbone.Collection.prototype.every,
        all:         Backbone.Collection.prototype.all,
        some:        Backbone.Collection.prototype.some,
        any:         Backbone.Collection.prototype.any,
        include:     Backbone.Collection.prototype.include,
        includes:    Backbone.Collection.prototype.includes,
        contains:    Backbone.Collection.prototype.contains,
        invoke:      Backbone.Collection.prototype.invoke,
        max:         Backbone.Collection.prototype.max,
        min:         Backbone.Collection.prototype.min,
        toArray:     Backbone.Collection.prototype.toArray,
        size:        Backbone.Collection.prototype.size,
        first:       Backbone.Collection.prototype.first,
        head:        Backbone.Collection.prototype.head,
        take:        Backbone.Collection.prototype.take,
        initial:     Backbone.Collection.prototype.initial,
        rest:        Backbone.Collection.prototype.rest,
        tail:        Backbone.Collection.prototype.tail,
        drop:        Backbone.Collection.prototype.drop,
        last:        Backbone.Collection.prototype.last,
        without:     Backbone.Collection.prototype.without,
        difference:  Backbone.Collection.prototype.difference,
        indexOf:     Backbone.Collection.prototype.indexOf,
        shuffle:     Backbone.Collection.prototype.shuffle,
        lastIndexOf: Backbone.Collection.prototype.lastIndexOf,
        isEmpty:     Backbone.Collection.prototype.isEmpty,
        chain:       Backbone.Collection.prototype.chain,
        sample:      Backbone.Collection.prototype.sample,
        partition:   Backbone.Collection.prototype.partition,
        groupBy:     Backbone.Collection.prototype.groupBy,
        countBy:     Backbone.Collection.prototype.countBy,
        sortBy:      Backbone.Collection.prototype.sortBy,
        indexBy:     Backbone.Collection.prototype.indexBy,

    });


    return VanillaCollection;
});