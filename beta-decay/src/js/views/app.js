define(function(require) {
    
    'use strict';

    var NuclearPhysicsAppView = require('views/app');
    
    var MultiNucleusBetaDecaySimView  = require('beta-decay/views/sim/multiple');
    var SingleNucleusBetaDecaySimView = require('beta-decay/views/sim/single');

    var Assets = require('assets');

    var BetaDecayAppView = NuclearPhysicsAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            MultiNucleusBetaDecaySimView,
            SingleNucleusBetaDecaySimView
        ]

    });

    return BetaDecayAppView;
});
