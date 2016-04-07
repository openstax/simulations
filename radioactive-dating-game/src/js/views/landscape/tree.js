define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var AgingTree = require('radioactive-dating-game/models/datable-item/aging-tree');

    var LandscapeView = require('radioactive-dating-game/views/landscape');
    var AgingTreeView = require('radioactive-dating-game/views/aging-tree');

    var Assets = require('assets');

    /**
     * Represents a landscape scene with backdrop and foreground items.
     */
    var TreeLandscapeView = LandscapeView.extend({

        /**
         * Initializes the new LandscapeView.
         */
        initialize: function(options) {
            LandscapeView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation, 'tree-planted', this.treePlanted);
            this.listenTo(this.simulation, 'reset',        this.reset);
        },

        getBackgroundTexture: function() {
            return Assets.Texture(Assets.Images.MEASUREMENT_BACKGROUND);
        },

        renderElement: function() {
            var self = this;

            this.$plantTreeButton = $('<button class="btn plant-tree-btn">Plant Tree</button>');
            this.$plantTreeButton.on('click', function() {
                self.plantTree();
            });

            this.$killTreeButton = $('<button class="btn kill-tree-btn">Kill Tree</button>');
            this.$killTreeButton.on('click', function() {
                self.killTree();
            });
            this.$killTreeButton.hide();

            this.$resetButton = $('<button class="btn reset-tree-btn">Reset</button>');
            this.$resetButton.on('click', function() {
                self.resetTree();
            });
            this.$resetButton.hide();

            this.$el.append(this.$plantTreeButton);
            this.$el.append(this.$killTreeButton);
            this.$el.append(this.$resetButton);

            return this;
        },

        reset: function() {
            this.$resetButton.hide();
            this.$killTreeButton.hide();
            this.$plantTreeButton.show();
            if (this.agingTreeView)
                this.agingTreeView.remove();
        },

        update: function(time, deltaTime, paused) {
            if (!paused) {
                
            }
        },

        treePlanted: function() {
            this.$plantTreeButton.hide();

            this.agingTreeView = new AgingTreeView({
                model: this.simulation.agingTree,
                mvt: this.mvt
            });

            // Add it to the background effects layer first so it's behind the volcano
            this.foregroundLayer.addChild(this.agingTreeView.displayObject);

            this.listenTo(this.simulation.agingTree, 'change:closureState', function(model, closureState) {
                switch (closureState) {
                    case AgingTree.CLOSURE_POSSIBLE:
                        this.$killTreeButton.show();
                        break;
                    case AgingTree.CLOSED:
                        this.$resetButton.show();
                        this.$killTreeButton.hide();
                        break;
                }
            });
        },

        plantTree: function() {
            this.simulation.plantTree();
        },

        killTree: function() {
            this.$killTreeButton.hide();
            this.simulation.forceClosure();
        },

        resetTree: function() {
            this.simulation.reset();
        }

    });


    return TreeLandscapeView;
});