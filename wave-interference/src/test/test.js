

describe('Lattice2D', function(){

	var Lattice2D;

	before(function(done) {
		require(['models/lattice2d'], function(model) {
			Lattice2D = model;
			done();
		});
	});

	it('should create a new lattice with initial values', function(){
		var h = 3;
		var w = 3;
		var val = -2;

		var data = [
			[-2, -2, -2],
			[-2, -2, -2],
			[-2, -2, -2]
		];

		var lattice = new Lattice2D({
			w: w,
			h: h,
			initialValue: val
		});

		chai.expect(lattice.h).to.equal(h);
		chai.expect(lattice.w).to.equal(w);
		chai.expect(lattice.data).to.deep.equal(data);
	});

	it('should clone a lattice', function(){
		var lattice1 = new Lattice2D();
		var lattice2 = lattice1.clone();

		chai.expect(lattice1).to.deep.equal(lattice2);
	});

	it('should copy a lattice', function(){
		var lattice1 = new Lattice2D({
			w: 3,
			h: 3,
			data: [
				[2, 0, 1],
				[0, 5, 4],
				[3, 0, 9]
			]
		});
		var lattice2 = new Lattice2D();

		lattice2.copy(lattice1);

		chai.expect(lattice1).to.deep.equal(lattice2);
	});
});

describe('The Test to End All Tests', function() {

	var appView;

	before(function(done){
		require(['jquery'], function($) {
			$(function(){
				$('#app-stylesheet').removeAttr('disabled');
				done();
			});
		});
	});

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

	after(function(done) {
		require(['jquery'], function($) {
			$(function(){
				$('#app-stylesheet').attr('disabled', 'disabled');
				done();
			});
		});
	});

	describe('App stuff', function(){
		it('Should be 1.', function() {
			chai.assert.equal(1, 1);
		});
	});

});

describe('Easy schmeezy', function(){
	it('Should be 1.', function() {
		chai.assert.equal(1, 1);
	});
});
