define(function(require) {
    
    'use strict';

    var AppView = require('common/app/app');

    var ProjectileMotionSimView = require('views/sim');

    require('less!styles/font-awesome');

    var ProjectileMotionAppView = AppView.extend({

        simViewConstructors: [
            ProjectileMotionSimView
        ]

    });

    return ProjectileMotionAppView;
});
