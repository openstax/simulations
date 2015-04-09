define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var TemplateSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var CollisionLabAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            TemplateSimView
        ]

    });

    return CollisionLabAppView;
});
