define(function (require) {

    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var MotionObject = require('common/models/motion-object');

    /**
     * Constants
     */
    var Constants = require('constants');

    var Electron = MotionObject.extend({
        defaults: _.extend({}, MotionObject.prototype.defaults, {
        }),

        initialize: function(attributes, options) {
        }
    }, Constants.Electron);

    return Electron;

});
