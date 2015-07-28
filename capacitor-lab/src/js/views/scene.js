define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');

    var PixiSceneView        = require('common/pixi/view/scene');
    var AppView              = require('common/app/app');
    var ModelViewTransform3D = require('common/math/model-view-transform-3d');
    var Vector2              = require('common/math/vector2');
    var Rectangle            = require('common/math/rectangle');

    var VoltmeterView      = require('views/voltmeter');
    var EFieldDetectorView = require('views/e-field-detector');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var CapacitorLabSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.circuitLayer = new PIXI.DisplayObjectContainer();
            this.toolsLayer   = new PIXI.DisplayObjectContainer();

            this.stage.addChild(this.circuitLayer);
            this.stage.addChild(this.toolsLayer);

            this.initMVT();
            this.initVoltmeter();
            this.initEFieldDetector();
        },

        initVoltmeter: function() {
            this.voltmeterView = new VoltmeterView({
                model: this.simulation,
                mvt: this.mvt,
                scene: this
            });
            this.voltmeterView.hide();

            this.toolsLayer.addChild(this.voltmeterView.displayObject);
        },

        initEFieldDetector: function() {
            this.eFieldDetectorView = new EFieldDetectorView({
                model: this.simulation,
                mvt: this.mvt,
                scene: this
            });
            this.eFieldDetectorView.hide();

            this.toolsLayer.addChild(this.eFieldDetectorView.displayObject);
        },

        initMVT: function() {
            // Map the simulation bounds...
            var bounds = new Rectangle(0, 0, 0.062, 0.0565);

            // // ...to the usable screen space that we have
            var controlsWidth = 220;
            var margin = 20;
            var leftMargin = 0;
            var rightMargin = 0 + controlsWidth + margin;
            var usableScreenSpace = new Rectangle(leftMargin, 0, this.width - leftMargin - rightMargin, this.height);

            var boundsRatio = bounds.w / bounds.h;
            var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            var scale = (screenRatio > boundsRatio) ? usableScreenSpace.h / bounds.h : usableScreenSpace.w / bounds.w;
            
            this.viewOriginX = Math.round(usableScreenSpace.x);
            this.viewOriginY = Math.round(usableScreenSpace.y);

            this.mvt = ModelViewTransform3D.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale,
                scale,
                Constants.MVT_PITCH,
                Constants.MVT_YAW
            );
        },

        reset: function() {
            PixiSceneView.prototype.reset.apply(this, arguments);

            this.eFieldDetectorView.reset();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.voltmeterView.update(time, deltaTime);
            this.eFieldDetectorView.update(time, deltaTime);
        },

        /**
         * Returns the view of the circuit component that intersects with the
         *   given polygon in view space.
         */
        getIntersectingComponentView: function(polygon) {},

        /**
         * 
         */
        getIntersectingCapacitorView: function(point) {},

        showPlateCharges: function() {},

        hidePlateCharges: function() {},

        showEFieldLines: function() {},

        hideEFieldLines: function() {},

        showVoltmeter: function() {
            this.voltmeterView.show();
        },

        hideVoltmeter: function() {
            this.voltmeterView.hide();
        },

        showEFieldDetector: function() {
            this.eFieldDetectorView.show();
        },

        hideEFieldDetector: function() {
            this.eFieldDetectorView.hide();
        }

    });

    return CapacitorLabSceneView;
});
