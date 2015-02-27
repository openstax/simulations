
define(function(require) {

    'use strict';

    var _ = require('underscore');

    var html = require('text!./energy-graph.html');

    require('less!./energy-graph')

    var Constants = require('constants');

    /**
     * A view that represents a movable target model
     */
    var EnergyGraphView = Backbone.View.extend({

        template : _.template(html),

        tagName : 'div',
        className : 'energy-graph-view',

        initialize: function(options) {
            options = _.extend({
                width: 5
            }, options);

            this.initGraphics();

            this.listenTo(this.model, 'change:KE', this.updateBar);
            this.listenTo(this.model, 'change:PEelas', this.updateBar);
            this.listenTo(this.model, 'change:PEgrav', this.updateBar);
            this.listenTo(this.model, 'change:Q', this.updateBar);
            this.listenTo(this.model, 'change:Etot', this.updateBar);
        },

        initGraphics: function() {
            // this.graphics = new PIXI.Graphics();
            // this.drawEnergyGraphView();
            // this.displayObject.addChild(this.graphics);
        },

        drawEnergyGraphView : function(){
            // this.graphics.clear();


        },

        updateBar: function(){
            
        }

    });

    return EnergyGraphView;
});
