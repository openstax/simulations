define(function(require) {
    
    'use strict';

    var NuclearPhysicsAppView = require('views/app');
    
    var HalfLifeSimView    = require('radioactive-dating-game/views/sim/half-life');
    var DecayRatesSimView  = require('radioactive-dating-game/views/sim/decay-rates');
    var MeasurementSimView = require('radioactive-dating-game/views/sim/measurement');

    var Assets = require('assets');

    var RadioactiveDatingGameAppView = NuclearPhysicsAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            HalfLifeSimView,
            DecayRatesSimView,
            MeasurementSimView
        ]

    });

    return RadioactiveDatingGameAppView;
});
