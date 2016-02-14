define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var PixiToImage        = require('common/v3/pixi/pixi-to-image');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    // CSS
    require('less!styles/nucleus-chooser');

    // HTML
    var templateHtml = require('text!templates/nucleus-chooser.html');

    /**
     * 
     */
    var NucleusChooserView = Backbone.View.extend({

        className: 'nucleus-chooser-view',

        template: _.template(templateHtml),

        initialize: function(options) {
            options = _.extend({
                scale: 1
            }, options);

            this.scale = options.scale;

            this.initMVT();
        },

        /**
         * Initializes the MVT to be used for rendering the items
         */
        initMVT: function() {
            this.mvt = new ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0), 
                new Vector2(0, 0), 
                this.scale
            );
        },

        /**
         * Creates the views and labels that will be used to render the list
         *   and their corresponding nucleus type.  The items array should
         *   be configured thusly:
         *
         *   [{
         *      nucleusType: NucleusType.HYDROGEN_3,
         *      isDefault: boolean,
         *      start: {
         *          label: 'Hydrogen-3',
         *          displayObject: new NucleusView({
         *              model: hydrogen3Model,
         *              mvt: this.mvt
         *          }).displayObject
         *      },
         *      end: {
         *          label: 'Helium-3',
         *          displayObject: new NucleusView({
         *              model: helium3Model,
         *              mvt: this.mvt
         *          }).displayObject
         *      }
         *   }]
         */
        initItems: function() {
            this.items = [];
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            this.initItems();

            var maxWidth = 0;
            _.each(this.items, function(item) {
                if (item.start.displayObject.width > maxWidth)
                    maxWidth = item.start.displayObject.width;
                if (item.end.displayObject.width > maxWidth)
                    maxWidth = item.end.displayObject.width;
            });

            var items = _.map(this.items, function(item) {
                return {
                    nucleusType: item.nucleusType,
                    isDefault: item.isDefault,
                    start: {
                        label: item.start.label,
                        img: PixiToImage.displayObjectToDataURI(item.start.displayObject, 1),
                        width: item.start.displayObject.width / 2,
                        height: item.start.displayObject.height / 2
                    },
                    end: {
                        label: item.end.label,
                        img: PixiToImage.displayObjectToDataURI(item.end.displayObject, 1),
                        width: item.end.displayObject.width / 2,
                        height: item.end.displayObject.height / 2
                    }
                };
            });

            this.$el.html(this.template({ 
                items: items,
                imageContainerWidth: maxWidth / 2,
                unique: this.cid 
            }));

            return this;
        },

        getMVT: function() {
            return this.mvt;
        }

    });

    return NucleusChooserView;
});
