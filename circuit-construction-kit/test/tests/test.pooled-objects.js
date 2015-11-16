
describe('Pooled Objects', function(){

	var Pooled;
	var Term;

	before(function(done) {
		require(['models/mna/pooled', 'models/mna/term'], function(pooled, term) {
			Pooled = pooled;
			Term = term;
			done();
		});
	});

	it('pooled objects get added to owner\'s array', function(){
		var owner = {};
		var object = Pooled.createWithOwner(owner);

		chai.expect(Pooled._ownedObjects.length).to.equal(1);
		chai.expect(Pooled._ownedObjects[owner.__ownerId][0]).to.equal(object);
	});

	it('#destroyAllOwned destroys all objects owned by a specified object', function(){
		var owner = {};
		var n = 10;
		for (var i = 0; i < n; i++)
			Pooled.createWithOwner(owner);

		chai.expect(Pooled._ownedObjects[owner.__ownerId].length).to.equal(n);

		Pooled.destroyAllOwned(owner);

		chai.expect(Pooled._ownedObjects[owner.__ownerId].length).to.equal(0);
	});

});