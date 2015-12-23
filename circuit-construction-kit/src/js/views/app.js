define(function(require) {
    
    'use strict';

    require('file-saver');

    var PixiAppView = require('common/v3/pixi/view/app');

    var CCKSimView = require('views/sim');

    var Assets      = require('assets');
    var Persistence = require('persistence');

    require('less!styles/font-awesome');
    require('less!styles/app');

    var settingsDialogHtml = require('text!templates/app-buttons.html');

    var CCKAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            CCKSimView
        ],

        events: _.extend({}, PixiAppView.prototype.events, {
            'click .load-btn' : 'loadBtnClicked',
            'click .save-btn' : 'saveBtnClicked',
            'change #file' : 'fileSelected'
        }),

        render: function() {
            PixiAppView.prototype.render.apply(this);

            this.$el.append(settingsDialogHtml);
        },

        loadBtnClicked: function(event) {
            $('#file').click();
        },

        saveBtnClicked: function(event) {
            this.saveXML();
        },

        fileSelected: function(event) {
            var files = event.target.files;
            var reader = new FileReader();
            if (files.length > 0) {
                var file = files[0];
                var self = this;

                reader.onload = function(event) {
                    self.loadXML(event.target.result);
                };
                reader.readAsText(file);

                $('#file').val('');
            }
        },

        loadXML: function(contents) {
            var circuit = Persistence.parseXML(contents);
            this.simViews[0].simulation.setCircuit(circuit);
        },

        saveXML: function() {
            var xml = Persistence.toXML(this.simViews[0].simulation.circuit);
            var blob = new Blob([xml], {type: "text/xml;charset=utf-8"});
            saveAs(blob, "circuit.xml");
        }

    });

    return CCKAppView;
});
