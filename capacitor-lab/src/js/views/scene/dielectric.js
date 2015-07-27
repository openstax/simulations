define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView = require('common/app/app');

    var DielectricSimulation = require('models/simulation/dielectric');

    var CapacitorLabSceneView = require('views/scene');
    var DielectricCircuitView = require('views/circuit/dielectric');
    var EFieldDetectorView    = require('views/e-field-detector');

    // Constants
    var Constants = require('constants');

    var batteryButtonsHtml = require('text!templates/battery-buttons.html');

    /**
     *
     */
    var DielectricSceneView = CapacitorLabSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            CapacitorLabSceneView.prototype.initialize.apply(this, arguments);
        },

        initEFieldDetector: function() {
            this.eFieldDetectorView = new EFieldDetectorView({
                model: this.simulation,
                mvt: this.mvt,
                scene: this,
                dielectric: true
            });

            this.toolsLayer.addChild(this.eFieldDetectorView.displayObject);
        },

        renderContent: function() {
            this.$ui.append(batteryButtonsHtml);

            this.$connectBtn    = this.$ui.find('.connect-battery-btn');
            this.$disconnectBtn = this.$ui.find('.disconnect-battery-btn');

            this.$connectBtn.click(_.bind(this.connectBattery, this));
            this.$disconnectBtn.click(_.bind(this.disconnectBattery, this));

            this.$connectBtn.hide();
        },

        postRender: function() {
            CapacitorLabSceneView.prototype.postRender.apply(this, arguments);

            var $btns = this.$ui.find('.connect-battery-btn, .disconnect-battery-btn')
            
            if (AppView.windowIsShort()) {
                $btns.css('top', Math.round(this.height * 0.110) + 'px');
                $btns.css('left', '15px');
            }
            else {
                $btns.css('top', Math.round(this.height * 0.183) + 'px');
            }
        },

        initGraphics: function() {
            CapacitorLabSceneView.prototype.initGraphics.apply(this, arguments);

            this.circuitView = new DielectricCircuitView({
                model: this.simulation.circuit,
                mvt: this.mvt,
                maxDielectricEField:            DielectricSimulation.getMaxDielectricEField(),
                maxPlateCharge:                 DielectricSimulation.getMaxPlateCharge(),
                maxExcessDielectricPlateCharge: DielectricSimulation.getMaxExcessDielectricPlateCharge(),
                maxEffectiveEField:             DielectricSimulation.getMaxEffectiveEField()
            });

            this.circuitLayer.addChild(this.circuitView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            CapacitorLabSceneView.prototype._update.apply(this, arguments);
            
            this.circuitView.update(time, deltaTime);
        },

        /**
         * Returns the view of the circuit component that intersects with the
         *   given polygon in view space.
         */
        getIntersectingComponentView: function(polygon) {
            return this.circuitView.getIntersectingComponentView(polygon);
        },

        /**
         * 
         */
        getIntersectingCapacitorView: function(point) {
            return this.circuitView.getIntersectingCapacitorView(point);
        },

        connectBattery: function() {
            this.$connectBtn.hide();
            this.$disconnectBtn.show();
            this.simulation.connectBattery();
        },

        disconnectBattery: function() {
            this.$disconnectBtn.hide();
            this.$connectBtn.show();
            this.simulation.disconnectBattery();
        },

        showExcessDielectricCharges: function() {
            this.circuitView.showExcessDielectricCharges();
        },

        hideExcessDielectricCharges: function() {
            this.circuitView.hideExcessDielectricCharges();
        },

        showTotalDielectricCharges: function() {
            this.circuitView.showTotalDielectricCharges();
        },

        hideTotalDielectricCharges: function() {
            this.circuitView.hideTotalDielectricCharges();
        },

        showPlateCharges: function() {
            this.circuitView.showPlateCharges();
        },

        hidePlateCharges: function() {
            this.circuitView.hidePlateCharges();
        },

        showEFieldLines: function() {
            this.circuitView.showEFieldLines();
        },

        hideEFieldLines: function() {
            this.circuitView.hideEFieldLines();
        }

    });

    return DielectricSceneView;
});
