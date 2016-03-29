define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var RutherfordScatteringSceneView = require('rutherford-scattering/views/scene');
    var AtomNodeView = require('rutherford-scattering/views/atom-node');

    // Constants
    var Constants = require('constants');
    /**
     *
     */
    var RutherfordAtomSceneView = RutherfordScatteringSceneView.extend({
        initAtomNodeView: function() {

            this.atomNodeView = new AtomNodeView({
                mvt: this.mvt,
                particleMVT: this.particleMVT,
                model: this.simulation.atomNode,
                simulation: this.simulation,
                scale: this.scale
            });

            this.middleLayer.addChild(this.atomNodeView.displayObject);
        }
    });

    return RutherfordAtomSceneView;
});
