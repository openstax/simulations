
define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var AlphaParticleModel = require('rutherford-scattering/models/alpha-particle');

    var AlphaParticlesCollection = Backbone.Collection.extend({
        model: AlphaParticleModel
    });

    return AlphaParticlesCollection;
});