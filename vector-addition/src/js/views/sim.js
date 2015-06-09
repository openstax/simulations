define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var SimView = require('common/app/sim');
    var VectorAdditionSimulation = require('models/simulation');
    var VectorAdditionSceneView = require('views/scene');

    require('bootstrap');
    require('bootstrap-select');

    // CSS
    require('less!styles/sim');
    require('less!common/styles/radio');
    require('less!bootstrap-select-less');

    // HTML
    var simHtml = require('text!templates/sim.html');

    var VectorAdditionSimView = SimView.extend({

        tagName:   'section',
        className: 'sim-view',
        template: _.template(simHtml),

        events: {
          'change #show-grid' : 'showGrid',
          'click .btn-clear': 'clearArrows',
          'change #show-sum': 'showSum',
          'change #component-style': 'componentStyles'
        },

        initialize: function(options) {
            options = _.extend({
                title: 'Vector Addition',
                name: 'vector-addition',
                link: 'vector-addition',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);
            this.listenTo(this.simulation, 'change:rText change:thetaText change:rXText change:rYText', this.updateReadouts);
            this.listenTo(this.simulation, 'change:sumVectorVisible', this.sumVectorVisible);
            this.listenTo(this.simulation, 'change:sumVectorVisible', this.showSum);
            this.initSceneView();
        },

        initSimulation: function() {
            this.simulation = new VectorAdditionSimulation();
        },

        initSceneView: function() {
            this.sceneView = new VectorAdditionSceneView({
                simulation: this.simulation
            });
        },

        render: function() {
            this.$el.empty();
            this.renderScaffolding();
            this.renderSceneView();

            return this;
        },

        renderScaffolding: function() {
            this.$el.html(this.template(this.simulation.attributes));
            this.$('select').selectpicker();
        },

        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
        },

        postRender: function() {
            this.sceneView.postRender();
        },

        resetComponents: function() {
            SimView.prototype.resetComponents.apply(this);
            this.initSceneView();
        },

        update: function(time, delta) {
            // Update the model
            this.simulation.update(time, delta);
            // Update the scene
            this.sceneView.update(time, delta);
        },

        showGrid: function(e) {
          if ($(e.target).is(':checked')) {
            this.simulation.set('showGrid', true);
          }
          else {
            this.simulation.set('showGrid', false);
          }
        },

        clearArrows: function() {
          if (this.simulation.vectorCollection !== undefined) {
            this.simulation.vectorCollection.remove(this.arrows);
            this.simulation.set('sumVectorVisible', false);
            this.simulation.set('emptyStage', true);
            this.$el.find('label').removeClass('green');
          }
        },

        clearAll: function() {
          this.simulation.set('emptyStage', true);
        },

        updateReadouts: function() {
          this.$el.find('input.rText').val(this.simulation.get('rText'));
          this.$el.find('input.thetaText').val(this.simulation.get('thetaText'));
          this.$el.find('input.rXText').val(this.simulation.get('rXText'));
          this.$el.find('input.rYText').val(this.simulation.get('rYText'));
        },

        updateSumReadouts: function() {
          this.$el.find('input.rText').val(this.simulation.get('sumVectorRText'));
          this.$el.find('input.thetaText').val(this.simulation.get('sumVectorThetaText'));
          this.$el.find('input.rXText').val(this.simulation.get('sumVectorRXText'));
          this.$el.find('input.rYText').val(this.simulation.get('sumVectorRYText'));
        },

        showSum: function() {
          var sumBox = this.$el.find('#show-sum');
          if (sumBox.is(':checked')) {
            this.simulation.set('sumVectorVisible', true);
          }
          else {
            this.simulation.set('sumVectorVisible', false);
          }
        },

        sumVectorVisible: function() {
          if (this.simulation.get('sumVectorVisible')) {
            this.$el.find('#show-sum').prop('checked', true);
          }
          else {
            this.$el.find('#show-sum').prop('checked', false);
          }
        },

        componentStyles: function(event) {
          var style = parseInt($(event.target).val());
          this.simulation.set('componentStyles', style);
        }
    });

    return VectorAdditionSimView;
});
