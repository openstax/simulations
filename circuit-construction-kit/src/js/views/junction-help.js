define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var HelpLabelView = require('common/v3/help-label/help-label-pixi');
                        require('common/v3/pixi/draw-stick-arrow');
    var Colors        = require('common/colors/colors');

    var Constants = require('constants');

    /**
     * Hovers by the first junction in the scene and gives instructions for manipulating it
     */
    var JunctionHelpView = HelpLabelView.extend({

        /**
         * Initializes the new JunctionHelpView.
         */
        initialize: function(options) {
            options = _.extend({
                color: Constants.HELP_LABEL_COLOR,
                font:  Constants.HELP_LABEL_FONT,
                position: {
                    x: -50,
                    y: 0
                },
                anchor: {
                    x: 1,
                    y: 0.55
                },
                style: {
                    align: 'right'
                },
                title : 'Drag junctions or press\ntwice for other actions'
            }, options);

            HelpLabelView.prototype.initialize.apply(this, [options]);

            this.render();
        },

        render: function() {
            HelpLabelView.prototype.render.apply(this, arguments);

            var graphics = new PIXI.Graphics();
            graphics.lineStyle(Constants.HELP_LABEL_ARROW_LINE_WIDTH, Colors.parseHex(Constants.HELP_LABEL_COLOR), 1);
            graphics.drawStickArrow(6, 0, -this.position.x - 12, 0, Constants.HELP_LABEL_ARROW_HEAD_WIDTH, Constants.HELP_LABEL_ARROW_HEAD_LENGTH);

            this.displayObject.addChild(graphics);
        }

    });

    return JunctionHelpView;
});