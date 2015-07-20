define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView = require('common/app/app');

    var CapacitorLabSceneView = require('views/scene');
    var CircuitView           = require('views/circuit');

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
            
            $btns.css('top', Math.round(this.height * 0.183) + 'px');
            if (AppView.windowIsShort())
                $btns.css('left', '255px');

        },

        initGraphics: function() {
            CapacitorLabSceneView.prototype.initGraphics.apply(this, arguments);

            this.circuitView = new CircuitView({
                model: this.simulation.circuit,
                mvt: this.mvt,
                dielectric: true,
                maxDielectricEField: this.simulation.getMaxDielectricEField(),
                maxPlateCharge: this.simulation.getMaxPlateCharge(),
                maxExcessDielectricPlateCharge: this.simulation.getMaxExcessDielectricPlateCharge(),
                maxEffectiveEField: this.simulation.getMaxEffectiveEField()
            });

            this.stage.addChild(this.circuitView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
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
        }

    });

    return DielectricSceneView;
});
