define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var HelpLabelView = require('common/v3/help-label/help-label-pixi');

    var Constants = require('constants');

    /**
     * Hovers by the first junction in the scene and gives instructions for manipulating it
     */
    var ComponentHelpView = HelpLabelView.extend({

        /**
         * Initializes the new ComponentHelpView.
         */
        initialize: function(options) {
            options = _.extend({
                color: Constants.HELP_LABEL_COLOR,
                font:  Constants.HELP_LABEL_FONT,
                title : 'Drag to move or press twice for other actions'
            }, options);

            HelpLabelView.prototype.initialize.apply(this, [options]);

            this.render();
        }

    });

    return ComponentHelpView;
});