define(function(require) {
    
    'use strict';

    var CCKAppView = require('views/app');
    
    var BetaDecaySimView = require('beta-decay/views/sim');

    var Assets = require('assets');

    var BetaDecayAppView = CCKAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            BetaDecaySimView
        ]

    });

    return BetaDecayAppView;
});
