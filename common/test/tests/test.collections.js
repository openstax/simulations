describe('VanillaCollection', function(){

    var VanillaCollection;
    var PooledModel;
    var Backbone;

    before(function(done) {
        require([
            'collections/vanilla',
            'pooled-object/model',
            'backbone'
        ], function(vanillaCollection, pooledModel, backbone) {
            VanillaCollection = vanillaCollection;
            PooledModel = pooledModel;
            Backbone = backbone;
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

        collection.add([ model1, model2 ]);

        collection.remove(model1);
        chai.expect(collection.length).to.equal(1);

        collection.remove([model2, object1]);
        chai.expect(collection.length).to.equal(0);
    });

    it('triggers work', function(){
        var collection = new VanillaCollection();
        var object = {};
        var eventAdded = false;
        var eventModel = null;
        var eventCollection = null;

        _.extend(object, Backbone.Events);

        object.listenTo(collection, 'add', function(model, coll, options) {
            eventAdded = true;
            eventModel = model;
            eventCollection = coll;
        });

        var model = { name: 'model1' };
        collection.add(model);

        chai.expect(eventAdded).to.be.true;
        chai.expect(eventModel).to.equal(model);
        chai.expect(eventCollection).to.equal(collection);

        object.stopListening(collection);

        var eventRemoved = false;
        eventModel = null;
        eventCollection = null;

        object.listenTo(collection, 'remove', function(model, coll, options) {
            eventRemoved = true;
            eventModel = model;
            eventCollection = coll;
        });

        collection.remove(model);

        chai.expect(eventRemoved).to.be.true;
        chai.expect(eventModel).to.equal(model);
        chai.expect(eventCollection).to.equal(collection);

        object.stopListening(collection);

        var eventReset = false;
        eventCollection = null;

        object.listenTo(collection, 'reset', function(coll, options) {
            eventReset = true;
            eventCollection = coll;
        });

        collection.reset([PooledModel.create(), PooledModel.create()]);

        chai.expect(eventReset).to.be.true;
        chai.expect(eventCollection.length).to.equal(2);
        chai.expect(eventCollection).to.equal(collection);
    });

});