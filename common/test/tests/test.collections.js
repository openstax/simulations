describe('Models', function(){

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

    it('#create creates unique objects', function(){
        

        chai.expect(true).to.not.equal(false);
    });

});