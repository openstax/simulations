
define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var SpringModel = require('models/spring');

    var SpringsCollection = Backbone.Collection.extend({
        model: SpringModel
    });

    return SpringsCollection;
});