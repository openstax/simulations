define(function (require) {

    'use strict';

    var Constants = require('constants');

    var MediumProperties = require('models/medium-properties');

    // Media that can be selected
    var MediumPropertiesPresets = {};

    MediumPropertiesPresets.AIR       = new MediumProperties('Air',       1.000293);
    MediumPropertiesPresets.WATER     = new MediumProperties('Water',     1.333);
    MediumPropertiesPresets.GLASS     = new MediumProperties('Glass',     1.5);
    MediumPropertiesPresets.DIAMOND   = new MediumProperties('Diamond',   Constants.DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT);
    MediumPropertiesPresets.MYSTERY_A = new MediumProperties('Mystery A', Constants.DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT, true);
    MediumPropertiesPresets.MYSTERY_B = new MediumProperties('Mystery B', 1.4, true);

    return MediumPropertiesPresets;
});