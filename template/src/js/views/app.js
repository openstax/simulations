define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var TemplateSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var TemplateAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            TemplateSimView
        ]

    });

    return TemplateAppView;
});
