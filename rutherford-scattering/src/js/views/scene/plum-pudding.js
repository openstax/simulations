define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var RutherfordScatteringSceneView = require('rutherford-scattering/views/scene');

    // Constants
    var Constants = require('constants');
    /**
     *
     */
    var PlumPuddingSceneView = RutherfordScatteringSceneView.extend({});

    return PlumPuddingSceneView;
});
