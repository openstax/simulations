
describe('Modified Nodal Analysis', function(){

	var Term;

	before(function(done) {
		require(['models/mna/term'], function(term) {
			Term = term;
			done();
		});
	});

	it('Term objects extend PooledObject functionality', function(){
		var owner = {};
		var obj = Term.createWithOwner(owner, 3, 'x');

		chai.expect(Term._ownedObjects.length).to.equal(1);
		chai.expect(obj.coefficient).to.equal(3);
		chai.expect(obj.variable).to.equal('x');
		chai.expect(Term._pool.list.length).to.equal(1);

		Term.destroyAllOwned(owner);

		chai.expect(Term._ownedObjects[owner.__ownerId].length).to.equal(0);
		chai.expect(Term._pool.reserve.length).to.equal(1);
		chai.expect(Term._pool.list.length).to.equal(0);
	});
	
});