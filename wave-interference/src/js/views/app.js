define(function (require) {

	'use strict';

	var _ = require('underscore');

	var PixiAppView = require('common/pixi/view/app');

	var WaterSimView = require('./sim/water');
	var SoundSimView = require('./sim/sound');
	var LightSimView = require('./sim/light');

    require('less!styles/font-awesome');

    var WaveInterferenceAppView = PixiAppView.extend({

        assets: [],

        simViewConstructors: [
            WaterSimView,
            SoundSimView,
            LightSimView
        ]

    });

	return WaveInterferenceAppView;
});
