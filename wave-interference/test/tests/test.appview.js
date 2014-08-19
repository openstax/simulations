

describe('AppView', function() {

	var appView, $;

	before(function(done){
		require(['jquery'], function(jQuery) {
			$ = jQuery;

			$('#app-stylesheet').removeAttr('disabled');

			done();
		});
	});

	beforeEach(function(done) {
		require(['jquery', 'views/app'], function(jQuery, AppView) {
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

	afterEach(function() {
		appView.remove();
	});

	after(function(done) {
		require(['jquery'], function($) {
			$('#app-stylesheet').attr('disabled', 'disabled');
			done();
		});
	});

	describe('Tabs', function(done) {
		require(['jquery', 'views/app'], function($, AppView) {
			$('#app-stylesheet').removeAttr('disabled');
			appView = new AppView();

			// Render main app view
			appView.render();

			// Prepend to body
			$('body').prepend(appView.el);

			// Trigger window resize to update canvases
			$(window).trigger('resize');





			var $tab = appView.$('.sim-tab').last();

			var tabSpy   = sinon.spy();
			var childSpy = sinon.spy();

			$tab.bind('tab-selected', tabSpy);
			$tab.click();

			$tab.bind('tab-selected', childSpy);
			$tab.children().first().click();

			it('should trigger "tab-selected" event one time on tab click', function() {
				chai.expect(tabSpy.calledOnce).to.be.ok;
			});

			it('should trigger "tab-selected" event one time when a child is clicked', function() {
				chai.expect(childSpy.calledOnce).to.be.ok;
			});

			done();
		});
	});

});

describe('Easy schmeezy', function(){
	it('Should be 1.', function() {
		chai.assert.equal(1, 1);
	});
});
