define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');
    var Pool    = require('object-pool');

    var Constants = require('constants');

    /**
     * Because Backbone models only see shallow changes, we need to
     *   create new objects when assigning a new value to an attribute
     *   if we want the event system to pick up the change.  Creating
     *   and destroying objects is expensive in a real-time system,
     *   especially when it's happening each frame on a lot of objects,
     *   so we're going to use an object pool to reuse old objects
     *   instead of just throwing them away.
     */
    var vectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

    /**
     * 
     */
    var IntensityMeter = Backbone.Model.extend({

        defaults: {
            enabled: false,
            bodyPosition: null,
            sensorPosition: null,
            sensorRadius: 1.5e-6,
            reading: null
        },
        
        initialize: function(attributes, options) {
            // Create vectors
            this.set('bodyPosition',   vectorPool.create().set(this.get('bodyPosition')));
            this.set('sensorPosition', vectorPool.create().set(this.get('sensorPosition')));

            this.rayReadings = [];
        },

        addRayReading: function(reading) {
            this.rayReadings.push(reading);
            this.updateReading();
        },

        clearRayReadings: function() {
            this.rayReadings = [];
            this.set('reading', null);
        },

        updateReading: function() {
            var total = 0;
            var hit = false;

            for (var i = 0; i < this.rayReadings.length; i++) {
                if (this.rayReadings[i] !== null) {
                    total += this.rayReadings[i];
                    hit = true;
                }
            }

            if (hit)
                this.set('reading', total);
            else
                this.set('reading', null);
        },

        setBodyX: function(x) {
            this.setBodyPosition(x, this.get('bodyPosition').y);
        },

        setBodyY: function(y) {
            this.setBodyPosition(this.get('bodyPosition').x, y);
        },

        translateBody: function(x, y) {
            var oldBodyPosition = this.get('bodyPosition');
            var newBodyPosition = vectorPool.create().set(this.get('bodyPosition'));

            if (x instanceof Vector2)
                this.set('bodyPosition', newBodyPosition.add(x));
            else
                this.set('bodyPosition', newBodyPosition.add(x, y));
            
            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldBodyPosition);
        },

        setBodyPosition: function(x, y) {
            var oldBodyPosition = this.get('bodyPosition');
            
            if (x instanceof Vector2)
                this.set('bodyPosition', vectorPool.create().set(x));
            else
                this.set('bodyPosition', vectorPool.create().set(x, y));

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldBodyPosition);
        },

        setSensorX: function(x) {
            this.setSensorPosition(x, this.get('sensorPosition').y);
        },

        setSensorY: function(y) {
            this.setSensorPosition(this.get('sensorPosition').x, y);
        },

        translateSensor: function(x, y) {
            var oldSensorPosition = this.get('sensorPosition');
            var newSensorPosition = vectorPool.create().set(this.get('sensorPosition'));

            if (x instanceof Vector2)
                this.set('sensorPosition', newSensorPosition.add(x));
            else
                this.set('sensorPosition', newSensorPosition.add(x, y));
            
            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldSensorPosition);
        },

        setSensorPosition: function(x, y) {
            var oldSensorPosition = this.get('sensorPosition');
            
            if (x instanceof Vector2)
                this.set('sensorPosition', vectorPool.create().set(x));
            else
                this.set('sensorPosition', vectorPool.create().set(x, y));

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldSensorPosition);
        },

        /**
         * We need to make sure we release the model's vector
         *   back into the vector pool or we get memory leaks,
         *   so destroy must be called on all bodyPositionable
         *   objects when we're done with them.
         */
        destroy: function(options) {
            this.trigger('destroy', this, this.collection, options);
            vectorPool.remove(this.get('bodyPosition'));
            vectorPool.remove(this.get('sensorPosition'));
        }

    }, Constants.IntensityMeter);

    return IntensityMeter;
});
