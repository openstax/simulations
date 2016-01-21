define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var GrabBagButton            = require('views/grab-bag-button');
    var ComponentToolbox         = require('views/component-toolbox');
    var ComponentToolboxIcon     = require('views/component-toolbox-icon');
    var WireToolboxIcon          = require('views/toolbox-icons/wire');
    var ResistorToolboxIcon      = require('views/toolbox-icons/resistor');
    var BatteryToolboxIcon       = require('views/toolbox-icons/battery');
    var LightBulbToolboxIcon     = require('views/toolbox-icons/light-bulb');
    var ACSourceToolboxIcon      = require('views/toolbox-icons/ac-source');
    var SwitchToolboxIcon        = require('views/toolbox-icons/switch');
    var InductorToolboxIcon      = require('views/toolbox-icons/inductor');
    var CapacitorToolboxIcon     = require('views/toolbox-icons/capacitor');
    var SeriesAmmeterToolboxIcon = require('views/toolbox-icons/series-ammeter');
    var CircuitView              = require('views/circuit');
    var ElectronsView            = require('views/electrons');
    var VoltmeterView            = require('views/voltmeter');
    var AmmeterView              = require('views/ammeter');
    var TimeScaleMessageView     = require('views/time-scale-message');

    var Assets    = require('assets');
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var CCKSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            this.dcOnly = options.dcOnly;

            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        postRender: function() {
            PixiSceneView.prototype.postRender.apply(this, arguments);
        },

        reset: function() {
            this.electronsView.show();

            this.voltmeterView.hide();
            this.ammeterView.hide();
            this.ammeterToolbox.hide();

            this.zoomScale = 1;
            this.updateMVTs();
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.dummyLayer = new PIXI.Container();
            this.topLayer   = new PIXI.Container();
            this.labelLayer = new PIXI.Container();

            if (AppView.windowIsShort()) {
                this.viewOriginX = Math.round((this.width - 230) / 2);
                this.viewOriginY = Math.round((this.height - 62) / 2);
                this.baseScale = 40;
            }
            else {
                this.viewOriginX = Math.round(this.width  / 2);
                this.viewOriginY = Math.round(this.height / 2);
                this.baseScale = 76;  
            }

            this.zoomScale = 1;

            this.initMVT();
            this.initCircuitView();
            this.initElectronsView();
            this.initComponentToolbox();
            this.initGrabBagButton();
            this.initVoltmeter();
            this.initSeriesAmmeter();
            this.initAmmeter();
            this.initTimeScaleMessage();

            this.stage.addChild(this.topLayer);
            this.stage.addChild(this.labelLayer);
            this.stage.addChild(this.dummyLayer);
        },

        initCircuitView: function() {
            this.circuitView = new CircuitView({
                mvt: this.mvt,
                model: this.simulation.circuit,
                simulation: this.simulation,
                width: this.width,
                height: this.height
            });
            this.stage.addChild(this.circuitView.displayObject);
            this.topLayer.addChild(this.circuitView.topLayer);
            this.labelLayer.addChild(this.circuitView.labelLayer);
        },

        initElectronsView: function() {
            this.electronsView = new ElectronsView({
                mvt: this.mvt,
                electronSet: this.simulation.particleSet
            });
            this.stage.addChild(this.electronsView.displayObject);
        },

        initComponentToolbox: function() {
            var icons = [
                WireToolboxIcon,
                ResistorToolboxIcon,
                BatteryToolboxIcon,
                LightBulbToolboxIcon,
                SwitchToolboxIcon
            ];

            if (!this.dcOnly) {
                icons = icons.concat(
                    ACSourceToolboxIcon,
                    InductorToolboxIcon,
                    CapacitorToolboxIcon
                );
            }

            this.componentToolbox = new ComponentToolbox({
                mvt: this.mvt,
                simulation: this.simulation,
                dummyLayer: this.dummyLayer,
                icons: icons
            });
            this.componentToolbox.setPosition(20, 20);
            this.stage.addChild(this.componentToolbox.displayObject);
        },

        initGrabBagButton: function() {
            var grabBagButton = new GrabBagButton({
                mvt: this.mvt,
                simulation: this.simulation,
                dummyLayer: this.dummyLayer
            });
            grabBagButton.setPosition(20, this.height - 62 - 20);
            this.stage.addChild(grabBagButton.displayObject);

            this.grabBagButton = grabBagButton;
        },

        initVoltmeter: function() {
            this.voltmeterView = new VoltmeterView({
                mvt: this.mvt,
                scene: this,
                simulation: this.simulation
            });

            this.voltmeterView.setPosition(500, 300);
            this.voltmeterView.hide();

            this.stage.addChild(this.voltmeterView.displayObject);
        },

        initSeriesAmmeter: function() {
            this.ammeterToolbox = new ComponentToolbox({
                mvt: this.mvt,
                simulation: this.simulation,
                dummyLayer: this.dummyLayer,
                icons: [
                    SeriesAmmeterToolboxIcon
                ]
            });
            this.ammeterToolbox.setPosition(100, 20);
            this.ammeterToolbox.hide();
            this.stage.addChild(this.ammeterToolbox.displayObject);
        },

        initAmmeter: function() {
            this.ammeterView = new AmmeterView({
                mvt: this.mvt,
                simulation: this.simulation,
                dragFrame: this.ui
            });

            this.ammeterView.setPosition(200, 400);

            this.$ui.append(this.ammeterView.render().el);
        },

        initTimeScaleMessage: function() {
            this.timeScaleMessageView = new TimeScaleMessageView({
                simulation: this.simulation,
                electronsView: this.electronsView
            });

            this.$ui.append(this.timeScaleMessageView.render().el);
        },

        initMVT: function() {
            // The center of the screen is actually (5, 5) in the original
            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(7.5, 5),
                new Vector2(this.viewOriginX, this.viewOriginY),
                this.baseScale * this.zoomScale
            );
        },

        updateMVTs: function() {
            this.initMVT();

            this.circuitView.updateMVT(this.mvt);
            this.electronsView.updateMVT(this.mvt);
            this.componentToolbox.updateMVT(this.mvt);
            this.grabBagButton.updateMVT(this.mvt);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            if (this.simulation.updated() || paused)
                this.electronsView.update();
            this.voltmeterView.update();
            this.ammeterView.update();
            this.timeScaleMessageView.update();
            this.circuitView.updateLabels();
        },

        zoomIn: function() {
            var zoom = this.zoomScale + 0.25;
            if (zoom <= Constants.MAX_SCALE) {
                this.zoomScale = zoom;
                this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                    new Vector2(0, 0),
                    new Vector2(this.viewOriginX, this.viewOriginY),
                    this.zoomScale // Scale, meters to pixels
                );
                this.updateMVTs();
            }
        },

        zoomOut: function() {
            var zoom = this.zoomScale - 0.25;
            if (zoom >= Constants.MIN_SCALE) {
                this.zoomScale = zoom;
                this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                    new Vector2(0, 0),
                    new Vector2(this.viewOriginX, this.viewOriginY),
                    this.zoomScale // Scale, meters to pixels
                );
                this.updateMVTs();
            }
        },

        showElectrons: function() {
            this.electronsView.show();
        },

        hideElectrons: function() {
            this.electronsView.hide();
        },

        showVoltmeter: function() {
            this.voltmeterView.show();
        },

        hideVoltmeter: function() {
            this.voltmeterView.hide();
        },

        showAmmeter: function() {
            this.ammeterToolbox.show();
        },

        hideAmmeter: function() {
            this.ammeterToolbox.hide();
        },

        showNonContactAmmeter: function() {
            this.ammeterView.show();
        },

        hideNonContactAmmeter: function() {
            this.ammeterView.hide();
        }

    });

    return CCKSceneView;
});
