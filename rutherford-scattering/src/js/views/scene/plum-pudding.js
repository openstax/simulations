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
    var PlumPuddingSceneView = RutherfordScatteringSceneView.extend({
        initMVT: function(){
            RutherfordScatteringSceneView.prototype.initMVT.apply(this, arguments);

            this.scale = this.spaceBoxSize/300;

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                this.scale
            );
        }
    });

    return PlumPuddingSceneView;
});
