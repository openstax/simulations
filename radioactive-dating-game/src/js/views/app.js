define(function(require) {
    
    'use strict';

    var NuclearPhysicsAppView = require('views/app');
    
    var HalfLifeSimView   = require('radioactive-dating-game/views/sim/half-life');
    var DecayRatesSimView = require('radioactive-dating-game/views/sim/decay-rates');

    var Assets = require('assets');

    var RadioactiveDatingGameAppView = NuclearPhysicsAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            HalfLifeSimView,
            DecayRatesSimView
        ]

    });

    return RadioactiveDatingGameAppView;
});
