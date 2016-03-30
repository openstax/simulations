define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var RutherfordScatteringSceneView = require('rutherford-scattering/views/scene');
    var AtomView = require('rutherford-scattering/views/atom');

    // Constants
    var Constants = require('constants');
    /**
     *
     */
    var RutherfordAtomSceneView = RutherfordScatteringSceneView.extend({
        initAtomView: function() {
            this.atomNodeView = new AtomView({
                mvt: this.mvt,
                particleMVT: this.particleMVT,
                model: this.simulation.atomNode,
                simulation: this.simulation,
                scale: this.scale,
                maskBox: this.spaceBoxView.maskBox
            });

            this.bottomLayer.addChild(this.atomNodeView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            RutherfordScatteringSceneView.prototype._update.call(this, arguments);
            this.atomNodeView._update(time, deltaTime, paused, timeScale);
        }
    });

    return RutherfordAtomSceneView;
});
