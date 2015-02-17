
define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var BodyModel = require('models/body');

    var BodiesCollection = Backbone.Collection.extend({
        model: BodyModel
    });

    return BodiesCollection;
});