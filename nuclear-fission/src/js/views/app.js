define(function(require) {
    
    'use strict';

    var NuclearPhysicsAppView = require('views/app');

    var OneNucleusSimView     = require('nuclear-fission/views/sim/one-nucleus');
    var ChainReactionSimView  = require('nuclear-fission/views/sim/chain-reaction');
    var NuclearReactorSimView = require('nuclear-fission/views/sim/nuclear-reactor');

    var Assets = require('assets');

    require('less!nuclear-fission/styles/font-awesome');

    var NuclearFissionAppView = NuclearPhysicsAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            OneNucleusSimView,
            ChainReactionSimView,
            NuclearReactorSimView
        ]

    });

    return NuclearFissionAppView;
});
