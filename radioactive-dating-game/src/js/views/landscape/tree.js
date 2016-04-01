define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var LandscapeView = require('radioactive-dating-game/views/landscape');

    var Assets = require('assets');

    /**
     * Represents a landscape scene with backdrop and foreground items.
     */
    var TreeLandscapeView = LandscapeView.extend({

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

            this.$el.append(this.$plantTreeButton);
            this.$el.append(this.$killTreeButton);

            return this;
        },

        update: function(time, deltaTime, paused) {
            if (!paused) {
                
            }
        },

        plantTree: function() {

        },

        killTree: function() {

        }

    });


    return TreeLandscapeView;
});