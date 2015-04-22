define(function (require) {

    'use strict';

    var Sun       = require('models/body/sun');
    var Planet    = require('models/body/planet');
    var Moon      = require('models/body/moon');
    var Satellite = require('models/body/satellite');

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {
        PLANET:       'planet.png',
        EARTH:        'earth.png',
        SUN:          'sun.png',
        MOON:         'moon.png',
        MOON_GENERIC: 'moon-generic.png'
    };

    Assets.SpriteSheets = {};

    Assets.ImageFromModel = function(modelInstance) {
    	if (modelInstance instanceof Sun)
    	    return Assets.Images.SUN;
        if (modelInstance instanceof Planet)
    	    return Assets.Images.EARTH;
    	if (modelInstance instanceof Moon)
    	    return Assets.Images.MOON;
    	if (modelInstance instanceof Satellite)
    	    return Assets.Images.SATELLITE;
    	return Assets.Images.EARTH;
    };

    return Assets;
});
