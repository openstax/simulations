describe('VanillaCollection', function(){

    var VanillaCollection;
    var PooledModel;

    before(function(done) {
        require([
            'collections/vanilla',
            'pooled-object/model'
        ], function(vanillaCollection, pooledModel) {
            VanillaCollection = vanillaCollection;
            PooledModel = pooledModel;
            done();
        });
    });

    it('#add works', function(){
        var collection = new VanillaCollection();
        var model1 = PooledModel.create({ name: 'Model 1' });
        var model2 = PooledModel.create({ name: 'Model 2' });
        var object1 = { name: 'Object 1' };
        var object2 = { name: 'Object 2' };

        collection.add(model1);

        chai.expect(collection.length).to.equal(1);
        chai.expect(collection.get(model1)).to.equal(model1);

        collection.add([object1, object2]);
        chai.expect(collection.length).to.equal(3);
        chai.expect(collection.get(model1)).to.equal(model1);
        chai.expect(collection.get(object1)).to.equal(object1);
        chai.expect(collection.get(object2)).to.equal(object2);
        chai.expect(collection.get(model2)).to.equal(null);

        collection.add(model1);
        chai.expect(collection.length).to.equal(3);

        collection.add([object1, object2]);
        chai.expect(collection.length).to.equal(3);
    });

    it('#remove works', function(){
        var collection = new VanillaCollection();
        var model1 = PooledModel.create({ name: 'Model 1' });
        var model2 = PooledModel.create({ name: 'Model 2' });
        var object1 = { name: 'Object 1' };
        var object2 = { name: 'Object 2' };

        collection.add([ model1, model2 ]);

        collection.remove(model1)
        chai.expect(collection.length).to.equal(1);

    });

});