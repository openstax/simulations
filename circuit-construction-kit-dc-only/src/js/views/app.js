define(function(require) {
    
    'use strict';

    var CCKAppView = require('views/app');
    
    var DCOnlySimView = require('./sim');

    var Assets = require('assets');

    var DCOnlyAppView = CCKAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            DCOnlySimView
        ]

    });

    return DCOnlyAppView;
});
