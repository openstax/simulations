define(function(require) {
    
    'use strict';

    var AppView = require('common/app/app');

    var IntroSimView  = require('views/sim/intro');
    var ChartsSimView = require('views/sim/charts');

    require('less!styles/font-awesome');

    var MovingManAppView = AppView.extend({

        simViewConstructors: [
            IntroSimView,
            ChartsSimView
        ]

    });

    return MovingManAppView;
});
