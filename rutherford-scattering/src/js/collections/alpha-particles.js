
define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Rectangle = require('common/math/rectangle');
    var AlphaParticleModel = require('rutherford-scattering/models/alpha-particle');

    var AlphaParticlesCollection = Backbone.Collection.extend({
        model: AlphaParticleModel,

        initialize: function(attributes, options) {
            this._bounds = new Rectangle(attributes.bounds.x, attributes.bounds.y, attributes.bounds.w, attributes.bounds.h);
            this.listenTo(this, 'change:position', this.cullParticles);
        },

        cullParticles: function(particle, position) {
          if(!this._bounds.contains(position)){
            this.remove(particle);
          }

        }
    });

    return AlphaParticlesCollection;
});