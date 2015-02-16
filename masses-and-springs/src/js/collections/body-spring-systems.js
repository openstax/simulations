
define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var BodySpringSystemModel = require('models/body-spring-system');

    var BodySpringSystemsCollections = Backbone.Collection.extend({
        model: BodySpringSystemModel
    });

    return BodySpringSystemsCollections;
});