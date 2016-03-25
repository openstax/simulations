
define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Rectangle = require('common/math/rectangle');
    var AlphaParticleModel = require('rutherford-scattering/models/alpha-particle');

    var AlphaParticlesCollection = Backbone.Collection.extend({
        model: AlphaParticleModel,

        initialize: function(attributes, options) {
            this._bounds = this.makeCullBounds(options.bounds);
            this.listenTo(this, 'change:position', this.cullParticles);
            this.listenTo(this, 'change:remove', this.remove);
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

        cullParticles: function(particle, position) {
          if(!this._bounds.contains(position)){
            this.remove(particle);
          }

        }
    });

    return AlphaParticlesCollection;
});