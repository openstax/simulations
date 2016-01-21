define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var HelpLabelView = require('common/v3/help-label/help-label-pixi');
                        require('common/v3/pixi/draw-stick-arrow');
    var Colors        = require('common/colors/colors');

    var Constants = require('constants');

    /**
     * Hovers by the wire icon in the toolbox until the user starts dragging a component
     */
    var GrabAWireHelpView = HelpLabelView.extend({

        /**
         * Initializes the new GrabAWireHelpView.
         */
        initialize: function(options) {
            options = _.extend({
                color: Constants.HELP_LABEL_COLOR,
                font:  Constants.HELP_LABEL_FONT,
                anchor: {
                    x: 0,
                    y: 0.55
                },
                style: {
                    align: 'left'
                },
                title : 'Grab a wire'
            }, options);

            HelpLabelView.prototype.initialize.apply(this, [options]);

            this.simulation = options.simulation;

            this.listenTo(this.simulation.circuit.branches, 'add', this.hide);

            this.render();
        },

        render: function() {
            HelpLabelView.prototype.render.apply(this, arguments);

            var graphics = new PIXI.Graphics();
            graphics.lineStyle(Constants.HELP_LABEL_ARROW_LINE_WIDTH, Colors.parseHex(Constants.HELP_LABEL_COLOR), 1);
            graphics.drawStickArrow(-6, 0, -50 + 12, 0, Constants.HELP_LABEL_ARROW_HEAD_WIDTH, Constants.HELP_LABEL_ARROW_HEAD_LENGTH);

            this.displayObject.addChild(graphics);
        }

    });

    return GrabAWireHelpView;
});