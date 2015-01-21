define(function(require) {

    'use strict';

    var AppView = require('common/app/app');

    var VectorAdditionSimView = require('views/sim');

    require('less!styles/font-awesome');

    var VectorAdditionAppView = AppView.extend({

        simViewConstructors: [
          VectorAdditionSimView
        ]

    });

    return VectorAdditionAppView;
});
