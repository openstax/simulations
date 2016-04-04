define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var RutherfordScatteringSceneView = require('rutherford-scattering/views/scene');
    var PlumPuddingView = require('rutherford-scattering/views/plum-pudding');

    // Constants
    var Constants = require('constants');
    /**
     *
     */
    var PlumPuddingSceneView = RutherfordScatteringSceneView.extend({
        initAtomView: function() {
            this.atomNodeView = new PlumPuddingView({
                mvt: this.mvt,
                particleMVT: this.particleMVT,
                model: this.simulation.atomNode,
                simulation: this.simulation,
                scale: this.scale,
                maskBox: this.spaceBoxView.maskBox
            });

            this.bottomLayer.addChild(this.atomNodeView.displayObject);
        }
    });

    return PlumPuddingSceneView;
});
