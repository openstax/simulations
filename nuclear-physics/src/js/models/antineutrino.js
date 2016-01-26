define(function (require) {

    'use strict';

    var _ = require('underscore');

    var SubatomicParticle = require('models/subatomic-particle');

    /**
     * An antineutrino
     */
    var Antineutrino = SubatomicParticle.extend();

    return Antineutrino;
});