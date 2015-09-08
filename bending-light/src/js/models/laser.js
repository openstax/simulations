define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Pool     = require('object-pool');

    var Vector2 = require('common/math/vector2');

    var vectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * 
     */
    var Laser = Backbone.Model.extend({

        defaults: {
            emissionPoint: null, // Where the light comes from
            pivotPoint: null,    // Point to be pivoted about, and at which the laser points
            on: false,           // True if the laser is activated and emitting light
            wave: false,
            wavelength: Constants.WAVELENGTH_RED
        },

        /**
         * Initializes new Laser object.  Required options are:
         *   distanceFromPivot (number)
         *   angle (number)
         *   topLeftQuadrant (boolean)
         */
        initialize: function(attributes, options) {
            this.topLeftQuadrant = options.topLeftQuadrant;

            this._vec = new Vector2();

            this.set('pivotPoint', new Vector2(this.get('pivotPoint')));
            this.set('emissionPoint', 
                new Vector2(options.distanceFromPivot, 0).rotate(options.angle)
            );

            this.on('change:wave', this.clampAngle);
        },

        clampAngle: function() {
            if (this.get('wave') && this.getAngle() > Laser.MAX_ANGLE_IN_WAVE_MODE && this.topLeftQuadrant)
                this.setAngle(Laser.MAX_ANGLE_IN_WAVE_MODE);
        },

        /**
         * Rotate about the fixed pivot
         */
        setAngle: function(angle) {
            var distFromPivot = this.get('pivotPoint').distance(this.get('emissionPoint'));
            var offset = this._vec
                .set(distFromPivot, 0)
                .rotate(angle);
            this.setEmissionPoint(offset.add(this.get('pivotPoint')));
        },

        getAngle: function() {
            return this.getDirectionUnitVector().angle() + Math.PI;
        },

        getDirectionUnitVector: function() {
            return this._vec
                .set(this.get('pivotPoint'))
                .sub(this.get('emissionPoint'))
                .normalize();
        },

        getDistanceFromPivot: function() {
            return this._vec
                .set(this.get('pivotPoint'))
                .sub(this.get('emissionPoint'))
                .length();
        },

        getWavelength: function() {
            return this.get('wavelength');
        },

        getFrequency: function() {
            return Constants.SPEED_OF_LIGHT / this.get('wavelength');
        },

        translate: function(dx, dy) {
            this.translateEmissionPoint(dx, dy);
            this.translatePivotPoint(dx, dy);
        },

        translateEmissionPoint: function(x, y) {
            var oldEmissionPoint = this.get('emissionPoint');
            var newEmissionPoint = vectorPool.create().set(this.get('emissionPoint'));

            if (x instanceof Vector2)
                this.set('emissionPoint', newEmissionPoint.add(x));
            else
                this.set('emissionPoint', newEmissionPoint.add(x, y));
            
            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldEmissionPoint);
        },

        setEmissionPoint: function(x, y) {
            var oldEmissionPoint = this.get('emissionPoint');
            //console.log(vectorPool.list.length);
            
            if (x instanceof Vector2)
                this.set('emissionPoint', vectorPool.create().set(x));
            else
                this.set('emissionPoint', vectorPool.create().set(x, y));

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldEmissionPoint);
        },

        translatePivotPoint: function(x, y) {
            var oldPivotPoint = this.get('pivotPoint');
            var newPivotPoint = vectorPool.create().set(this.get('pivotPoint'));

            if (x instanceof Vector2)
                this.set('pivotPoint', newPivotPoint.add(x));
            else
                this.set('pivotPoint', newPivotPoint.add(x, y));
            
            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldPivotPoint);
        },

        setPivotPoint: function(x, y) {
            var oldPivotPoint = this.get('pivotPoint');
            
            if (x instanceof Vector2)
                this.set('pivotPoint', vectorPool.create().set(x));
            else
                this.set('pivotPoint', vectorPool.create().set(x, y));

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldPivotPoint);
        },

        /**
         * We need to make sure we release the model's vectors
         *   back into the vector pool or we get memory leaks,
         *   so destroy must be called on all positionable
         *   objects when we're done with them.
         */
        destroy: function(options) {
            this.trigger('destroy', this, this.collection, options);
            vectorPool.remove(this.get('pivotPoint'));
            vectorPool.remove(this.get('emissionPoint'));
        }

    }, Constants.Laser);

    return Laser;
});
