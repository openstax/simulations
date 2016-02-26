define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');
    var Wall    = require('common/mechanics/models/wall');

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
                    this.options.start.x, 
                    this.options.start.y,
                    this.options.end.x - this.options.start.x,
                    this.options.end.y - this.options.start.y
                ));
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