define(function(require) {
    
    'use strict';

    var AppView = require('common/app/app');

    var IntroSimView         = require('views/sim/intro');
    var EnergySystemsSimView = require('views/sim/energy-systems');

    require('less!styles/font-awesome');

    var EFCAppView = AppView.extend({

        initialize: function() {
            this.simViews = [
                new IntroSimView(),
                new EnergySystemsSimView()
            ];

            AppView.prototype.initialize.apply(this);
        }

    });

    return EFCAppView;
});
