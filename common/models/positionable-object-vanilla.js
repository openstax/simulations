define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');

    var Vector2     = require('../math/vector2');
    var PooledModel = require('../pooled-object/model');

    var vectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

var counter = 0;
    /**
     * Represents an object in 2D space and provides some helper functions
     *   for changing a position vector in a way that leverages Backbone's
     *   event system.
     */
    var VanillaPositionableObject = PooledModel.extend({

        init: function() {
            PooledModel.prototype.init.apply(this, arguments);

            this._offsetPosition = new Vector2();
        },

        defaults: {
            velocity: null,
            acceleration: null
        },

        /**
         * Called on the instance after 'create' is called to set initial values
         */
        onCreate: function(attributes, options) {
            PooledModel.prototype.onCreate.apply(this, [attributes, options]);

            this.set('position', this.createVector2().set(this.get('position')));
        },

        toJSON: function(options) {
            return _.clone(this.attributes);
        },

        createVector2: function() {
            // console.log(vectorPool.list.length)
            return vectorPool.create();
        },

        removeVector2: function(vec) {
            vectorPool.remove(vec);
        },

        getX: function(x) {
            return this.get('position').x;
        },

        getY: function(y) {
            return this.get('position').y;
        },

        setX: function(x) {
            this.setPosition(x, this.get('position').y);
        },

        setY: function(y) {
            this.setPosition(this.get('position').x, y);
        },

        translate: function(x, y) {
            if (x instanceof Vector2)
                this.get('position').add(x);
            else
                this.get('position').add(x, y);
        },

        setPosition: function(x, y) {
            if (x instanceof Vector2)
                this.get('position').set(x);
            else
                this.get('position').set(x, y);
        },

        offsetPosition: function(offset) {
            return this._offsetPosition.set(this.get('position')).add(offset);
        },

        getPosition: function() {
            return this.get('position');
        },

        destroy: function() {
            if (!this.destroyed) 
                this.removeVector2(this.get('position'));
            // if (this.destroyed) 
            //     console.log('already destroyed')
            PooledModel.prototype.destroy.apply(this, arguments);
        }

    });


    return VanillaPositionableObject;
});