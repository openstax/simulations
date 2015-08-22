define(function (require) {

    'use strict';

    var Medium = require('models/medium');

    // Mediums that can be selected
    var Mediums = {};

    Mediums.AIR       = new Medium('Air',       1.000293);
    Mediums.WATER     = new Medium('Water',     1.333);
    Mediums.GLASS     = new Medium('Glass',     1.5);
    Mediums.DIAMOND   = new Medium('Diamond',   Constants.DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT);
    Mediums.MYSTERY_A = new Medium('Mystery A', Constants.DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT, true);
    Mediums.MYSTERY_B = new Medium('Mystery B', 1.4, true);

    return Mediums;
});