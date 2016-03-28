
define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var _ = require('underscore');

    var Rectangle = require('common/math/rectangle');
    var AlphaParticleModel = require('rutherford-scattering/models/alpha-particle');

    var AlphaParticlesCollection = Backbone.Collection.extend({
        model: AlphaParticleModel,

        initialize: function(attributes, options) {
            this._bounds = this.makeCullBounds(options.bounds);
        },

        makeCullBounds: function(bounds){
            var boundTolerance = 10;
            var boundOffset = boundTolerance/2;
            var boundX = bounds.x - boundOffset;
            var boundY = bounds.y - boundOffset;
            var boundWidth = bounds.w + boundTolerance;
            var boundHeight = bounds.h + boundTolerance;

            return new Rectangle(boundX, boundY, boundWidth, boundHeight);
        },

        isParticleActive: function(particle){
            return !particle.get('remove') && this._bounds.contains(particle.getPosition());
        },

        pluck: function(propertyName){
            return _.pluck(this.models, propertyName);
        },

        cullParticles: function() {
            var inactiveParticles = this.reject(this.isParticleActive, this);
            _.each(inactiveParticles, _.partial(this.remove, _, {silent: true}), this);
            return this;
        }
    });

    return AlphaParticlesCollection;
});