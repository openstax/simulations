define(function(require) {
    
    'use strict';

    var NuclearPhysicsAppView = require('views/app');
    
    var RadioactiveDatingGameDecaySimView = require('radioactive-dating-game/views/sim/half-life');

    var Assets = require('assets');

    var RadioactiveDatingGameAppView = NuclearPhysicsAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            RadioactiveDatingGameDecaySimView
        ]

    });

    return RadioactiveDatingGameAppView;
});
