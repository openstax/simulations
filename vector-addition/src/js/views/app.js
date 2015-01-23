define(function(require) {

    'use strict';

    var Assets = require('assets');
    var PixiAppView = require('common/pixi/view/app');
    var VectorAdditionSimView = require('views/sim');
    require('less!styles/font-awesome');

    var VectorAdditionAppView = PixiAppView.extend({

       assets: Assets.getAssetList(),

        simViewConstructors: [
          VectorAdditionSimView
        ]

    });

    return VectorAdditionAppView;
});
