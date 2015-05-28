define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var ObjectView = require('views/object');

    /**
     * Represents a SourceObject model.  This can be rendered as
     *   either a solid object or a lamp (or a pair of lamps if
     *   the second point is enabled).  The user can drag the
     *   object and its second point around (or its two lamps
     *   independently).
     */
    var SourceObjectView = ObjectView.extend({



    });

    return SourceObjectView;
});