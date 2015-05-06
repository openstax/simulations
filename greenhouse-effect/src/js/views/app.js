define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var GreenhouseSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var TemplateAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            GreenhouseSimView
        ]

    });

    return TemplateAppView;
});
