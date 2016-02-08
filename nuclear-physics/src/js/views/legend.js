define(function(require) {

    'use strict';

    var $        = require('jquery');
    var Backbone = require('backbone'); Backbone.$ = $;

    var PixiToImage        = require('common/v3/pixi/pixi-to-image');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    // CSS
    require('less!styles/legend');

    // HTML
    var templateHtml = require('text!templates/legend.html');

    /**
     * 
     */
    var LegendView = Backbone.View.extend({

        className: 'legend-view',

        template: _.template(templateHtml),

        initialize: function(options) {
            options = _.extend({
                items: [],
                scale: 
            }, options);

            this.items = options.items;
            this.scale = options.scale;

            this.mvt = new ModelViewTransform.createSinglePointScaleMapping(new Vector2(0, 0), new Vector2(0, 0), this.scale);
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            var items = _.maps(this.items, function(item) {
                return {
                    label: item.label,
                    img: PixiToImage.displayObjectToDataURI(item.view)
                };
            });

            this.$el.html(this.template({ items: items }));

            return this;
        },

        getMVT: function() {
            return this.mvt;
        }

    });

    return LegendView;
});
