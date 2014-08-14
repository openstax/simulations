

describe('The Test to End All Tests', function() {

	var appView;

	beforeEach(function(done) {
		require(['jquery', 'views/app'], function($, AppView) {
			$(function(){
				appView = new AppView();

				// Render main app view
				appView.render();

				// Prepend to body
				$('body').prepend(appView.el);

				// Trigger window resize to update canvases
				$(window).trigger('resize');

				done();
			});
		});
	});

	afterEach(function() {
		appView.remove();
	});

	it('Should be 1.', function() {
		chai.assert.equal(1, 1);
	});

});

describe('The 2nd Test to End All Tests', function() {

	it('Should be 1.', function() {
		chai.assert.equal(1, 1);
	});

});