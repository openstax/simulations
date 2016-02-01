
describe('Pooled Objects', function(){

	var PooledObject;

	before(function(done) {
		require(['pooled-object/pooled-object'], function(pooledObject) {
			PooledObject = pooledObject;
			done();
		});
	});

	it('#create creates unique objects', function(){
		var object1 = PooledObject.create();
		var object2 = PooledObject.create();

		chai.expect(object1).to.not.equal(object2);
	});

	it('Pooled objects get added to owner\'s array', function(){
		var owner = {};
		var object = PooledObject.createWithOwner(owner);

		chai.expect(PooledObject._ownedObjects.length).to.equal(1);
		chai.expect(PooledObject._ownedObjects[PooledObject._getOwnerId(owner)][0]).to.equal(object);
	});

	it('#destroyAllOwnedBy destroys all objects owned by a specified object', function(){
		var owner = {};
		var n = 10;
		for (var i = 0; i < n; i++)
			PooledObject.createWithOwner(owner);

		chai.expect(PooledObject._ownedObjects[PooledObject._getOwnerId(owner)].length).to.equal(n);

		PooledObject.destroyAllOwnedBy(owner);

		chai.expect(PooledObject._ownedObjects[PooledObject._getOwnerId(owner)].length).to.equal(0);
	});

	it('#extend creates subclasses', function(){
		var Subclass = PooledObject.extend(function(name) {
			this.cachedObject = { option: 2 };
		}, {
			init: function(name) {
				this.name = name;
			},

			instanceFunction: function() {
				return this.name + ' is special.';
			}
		}, {
			staticFunction: function() {
				return 'Subclass';
			}
		});

		var obj = Subclass.create('Bob');

		chai.expect(Subclass.staticFunction()).to.equal('Subclass');
		chai.expect(obj.name).to.equal('Bob');
		chai.expect(obj.cachedObject).to.deep.equal({ option: 2 });
		chai.expect(obj.instanceFunction()).to.equal('Bob is special.');
	});

	it('subclass #create creates unique objects', function(){
		var Subclass = PooledObject.extend();
		var object1 = Subclass.create();
		var object2 = Subclass.create();

		chai.expect(object1).to.not.equal(object2);
	});

	it('Multiple subclasses\' pools don\'t collide', function(){
		var SubclassA = PooledObject.extend();
		var SubclassB = PooledObject.extend();

		var owner = {};
		var obj = SubclassB.createWithOwner(owner, 'Bob');

		chai.expect(SubclassB._ownedObjects.length).to.equal(1);
		chai.expect(SubclassA._ownedObjects).to.equal(undefined);
	});

	it('#createWithOwner passes arguments to init correctly', function(){
		var Subclass = PooledObject.extend({
			init: function(name) {
				this.name = name;
			}
		});

		var owner = {};
		var obj = Subclass.createWithOwner(owner, 'Bob');

		chai.expect(obj.name).to.equal('Bob');
	});

});