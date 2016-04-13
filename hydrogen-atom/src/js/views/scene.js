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
    var HydrogenAtomSceneView = RutherfordScatteringSceneView.extend({
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

        initBoxMVT: function(){
            if (AppView.windowIsShort()) {
                this.viewOriginX = Math.round((this.width - 220) / 2);
                this.viewOriginY = Math.round((this.height - 50)/ 2);
                this.spaceBoxSize = Constants.BOX_SIZE_SMALL;
            }
            else {
                this.viewOriginX = Math.round((this.width - 220) / 2);
                this.viewOriginY = Math.round((this.height - 96) / 2);
                this.spaceBoxSize = Constants.BOX_SIZE;
            }

            this.scale = this.spaceBoxSize/this.simulation.boundWidth;
            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                this.scale
            );
        },

        initRayGunMVT: function() {
            if (AppView.windowIsShort()) {
                this.rayGunOriginX = 60;
                this.rayGunOriginY = Math.round((this.height + 200) / 2);
            }
            else {
                this.rayGunOriginX = 60;
                this.rayGunOriginY = Math.round(this.height / 2);
            }

            var pixelsPerCentimeter = 5;

            this.rayGunMVT = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.rayGunOriginX, this.rayGunOriginY),
                pixelsPerCentimeter
            );
        },
    });

    return HydrogenAtomSceneView;
});

