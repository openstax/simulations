define(function(require) {

	'use strict';

	var _ = require('underscore');

	var MovingManSimView = require('views/sim');

	var IntroSimView = MovingManSimView.extend({

		events: _.extend(MovingManSimView.prototype.events, {
			
		}),

		initialize: function(options) {
			options = _.extend({
				title: 'Introduction',
				name:  'intro'
			}, options);
			
			MovingManSimView.prototype.initialize.apply(this, [ options ]);
		}

	});

	return IntroSimView;
});
