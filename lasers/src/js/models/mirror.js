define(function (require) {

    'use strict';

    var Wall      = require('common/mechanics/models/wall');
    var Rectangle = require('common/math/rectangle');

    /**
     * This class represents various sorts of mirrors. The mirror is conditioned
     *   by ReflectionStrategies that are added to it that determine whether the
     *   mirror will reflect a particular photon. A Mirror treats ReflectionStrategies
     *   conjunctively. I.e., all have to be true for the mirror to reflect a photon.
     * 
     * Examples of ReflectionStrategies are
     *   - LeftReflecting
     *   - RightReflecting
     *   - BandPass
     */
    var Mirror = Wall.extend({

        /**
         * Initializes the Mirror object
         */
        initialize: function(attributes, options) {
            if (options && options.start && options.end) {
                this.set('bounds', new Rectangle(
                    options.start.x, 
                    options.start.y,
                    options.end.x - options.start.x,
                    options.end.y - options.start.y
                ));

                this.set('position', options.start);
            }

            Wall.prototype.initialize.apply(this, [attributes, options]);

            this.reflectionStrategies = [];
        },

        addReflectionStrategy: function(strategy) {
            this.reflectionStrategies.push(strategy);
        },

        /**
         * Tells if the mirror reflects a specified photon, based on the mirror's
         *   ReflectionStrategies. All strategies must return true to their
         *   reflects(photon) function for the mirror to return true.
         */
        reflects: function(photon) {
            var result = true;
            for (var i = 0; i < this.reflectionStrategies.length && result === true; i++)
                result &= this.reflectionStrategies[i].reflects(photon);
            return result;
        }

    });

    return Mirror;
});