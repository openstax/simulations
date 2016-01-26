define(function (require) {

    'use strict';

    var _ = require('underscore');

    var SubatomicParticle = require('models/subatomic-particle');

    /**
     * An electron
     */
    var Electron = SubatomicParticle.extend();

    return Electron;
});