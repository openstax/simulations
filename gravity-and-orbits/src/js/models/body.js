define(function (require) {

    'use strict';

    var _ = require('underscore');

    var ForceAndMotionObject = require('common/models/force-and-motion-object');

    var BodyStateRecord = require('models/body-state-record');

    /**
     * 
     */
    var Body = ForceAndMotionObject.extend({

        defaults: _.extend({}, ForceAndMotionObject.prototype.defaults, {
            // Aesthetic qualities and meta data
            name:  'space debris',
            color: '#aaa',
            massSettable:     true,

            // Static physical properties
            minMass:  0,
            maxMass:  0,
            radius:   1,
            density:  1,
            fixed:    false, // True if the object doesn't move when the physics engine runs
            
            // State properties
            userControlled: false, // Whether the user is currently controlling the position
            collided:       false,
            clockTicksSinceExplosion: 0,

            // Associated Information
            /**
             * Though the user can change the mass of these bodies, they are by default set
             *   to a value that corresponds to an object that most users are familiar with.
             *   For example, the "planet" body would have a referenceMassLabel of "Earth" 
             *   and a referenceMass of the earth's mass.
             */
            referenceMass: 1,
            referenceMassLabel: 'a Model-T'
        }),
        
        initialize: function(attributes, options) {
            
            // Derived properties
            this.set('minMass', this.get('mass') / 2);
            this.set('maxMass', this.get('mass') * 2);
            this.set('density', this.get('mass') / this.getVolume());

            // A temporary place to store the state of the model during updates
            this.updateState = new BodyStateRecord();

            this.on('change:mass', this.massChanged);
        },

        /**
         * 
         */
        // update: function(time, delta) {

            
        // },


        /**
         * Returns whether or not the given body is close
         *   enough to collide with this one.
         */
        collidesWith: function(body) {
            var distance = this.get('position').distance(body.get('position'));
            var radiiSum = this.get('radius') + body.get('radius');
            return distance < radiiSum;
        },

        /**
         * Returns the body's volume.
         */
        getVolume: function() {
            return 4 / 3 * Math.PI * Math.pow(this.get('radius'), 3);
        },

        /**
         * Returns diameter of body.
         */
        getDiameter: function() {
            return this.get('radius') * 2;
        },

        /**
         * Updates everything that is dependent on the mass.
         */
        massChanged: function(body, mass) {
            // Derived from: density = mass/volume, and volume = 4/3 pi r r r
            var radius = Math.pow(
                3 * mass / 4 / Math.PI / density, 
                1 / 3
            );
            this.set('radius', radius);
        }

    });

    return Body;
});
