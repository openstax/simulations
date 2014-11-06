define(function(require) {
	
	'use strict';

	var AppView = require('common/app/app');

	var FriendlyScaleSimView = require('views/sim/friendly-scale');
	var ToScaleSimView       = require('views/sim/to-scale');

	require('less!styles/font-awesome');

	var GOAppView = AppView.extend({

		initialize: function() {
			this.simViews = [
				new FriendlyScaleSimView(),
				new ToScaleSimView()
			];

			AppView.prototype.initialize.apply(this);
		}

	});

	return GravityAndOrbitsAppView;
});
