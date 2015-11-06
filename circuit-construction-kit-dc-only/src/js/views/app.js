define(function(require) {
    
    'use strict';

    var DCOnlyAppView = require('views/app');
    
    var DCOnlySimView = require('./sim');

    var Assets = require('assets');

    var DCOnlyAppView = DCOnlyAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            DCOnlySimView
        ]

    });

    return DCOnlyAppView;
});
