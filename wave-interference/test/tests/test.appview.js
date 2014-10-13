define(function(require) {

	describe('AppView', function() {

		var $ = require('jquery');
		var AppView = require('../../src/js/views/app.js');

		var before = function() {
			$('#app-stylesheet').removeAttr('disabled');

			appView = new AppView();
			appView.render();

			$('body').prepend(appView.el);

			// Trigger window resize to update canvases
			$(window).trigger('resize');
		};

		var beforeEach = function() {
			
		};

		var afterEach = function() {
			
		};

		var after = function() {
			appView.remove();
			$('#app-stylesheet').attr('disabled', 'disabled');
		};

		describe('Tabs', function() {

			before(before);
			//beforeEach(beforeEach);

			after(after);
			//afterEach(afterEach);

			var $tab  = appView.$('.sim-tab').last();
			var $tab2 = appView.$('.sim-tab').first();

			var tabSpy   = sinon.spy();
			var childSpy = sinon.spy();

			$tab.bind('tab-selected', function(){
				console.log('hey');
			});

			$tab.bind('tab-selected', tabSpy);
			appView.tabClicked({target: $tab[0]});

			// Activate another tab to deactivate the testing one
			appView.tabClicked({target: $tab2[0]});

			$tab.bind('tab-selected', childSpy);
			appView.tabClicked({target: $tab.children().first()[0]});

			it('should trigger "tab-selected" event on tab click', function() {
				// Called once for child and once on self
				chai.expect(tabSpy.callCount).to.equal(2);
			});

			it('should trigger "tab-selected" event one time when a child is clicked', function() {
				chai.expect(childSpy.calledOnce).to.be.ok;
			});
		});

	});
});


describe('Easy schmeezy', function(){
	it('Should be 1.', function() {
		chai.assert.equal(1, 1);
	});
});
