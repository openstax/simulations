define(function(require) {
    
    'use strict';

    var NuclearPhysicsAppView = require('views/app');

    var OneNucleusSimView = require('nuclear-fission/views/sim/one-nucleus');

    var Assets = require('assets');

    require('less!nuclear-fission/styles/font-awesome');

    var NuclearFissionAppView = NuclearPhysicsAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            OneNucleusSimView
        ]

    });

    return NuclearFissionAppView;
});
