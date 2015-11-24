define(function(require) {
    
    'use strict';

    require('file-saver');

    var PixiAppView = require('common/v3/pixi/view/app');

    var CCKSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');
    require('less!styles/app');

    var settingsDialogHtml = require('text!templates/save-load.html');

    var FaradayAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            CCKSimView
        ],

        events: _.extend({}, PixiAppView.prototype.events, {
            'click .load-btn' : 'loadFile',
            'click .save-btn' : 'saveFile'
        }),

        render: function() {
            PixiAppView.prototype.render.apply(this);

            this.$el.append(settingsDialogHtml);

            
        },

        loadFile: function(event) {
            $('#file').click();
        },

        saveFile: function(event) {
            var blob = new Blob(["Hello, world!"], {type: "text/xml;charset=utf-8"});
            saveAs(blob, "circuit.xml");
        }

    });

    return FaradayAppView;
});
