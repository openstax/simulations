define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Base class and subclasses for dielectric materials.
     * All subclasses for "real" materials are immutable (as a policy).
     * The subclass for a "custom" material has a mutable dielectric constant.
     */
    var DielectricMaterial = Backbone.Model.extend({

        defaults: {
            name: 'Dielectric Material',
            color: '#fff',
            alpha: 1,
            dielectricConstant: Constants.DIELECTRIC_CONSTANT_RANGE.defaultValue
        },
 
        isOpaque: function() {
            return (this.alpha === 1);
        }

    });


    DielectricMaterial.Teflon = DielectricMaterial.extend({

        defaults: _.extend({}, DielectricMaterial.prototype.defaults, {
            name: 'Teflon',
            color: Constants.DielectricMaterial.TEFLON_COLOR,
            dielectricConstant: Constants.EPSILON_TEFLON
        })

    });

    DielectricMaterial.Glass = DielectricMaterial.extend({

        defaults: _.extend({}, DielectricMaterial.prototype.defaults, {
            name: 'Glass',
            color: Constants.DielectricMaterial.GLASS_COLOR,
            alpha: Constants.DielectricMaterial.GLASS_ALPHA,
            dielectricConstant: Constants.EPSILON_GLASS
        })

    });

    DielectricMaterial.Paper = DielectricMaterial.extend({

        defaults: _.extend({}, DielectricMaterial.prototype.defaults, {
            name: 'Paper',
            color: Constants.DielectricMaterial.PAPER_COLOR,
            dielectricConstant: Constants.EPSILON_PAPER
        })

    });

    DielectricMaterial.Air = DielectricMaterial.extend({

        defaults: _.extend({}, DielectricMaterial.prototype.defaults, {
            name: 'Air',
            dielectricConstant: Constants.EPSILON_AIR
        })

    });

    DielectricMaterial.Custom = DielectricMaterial.extend({

        defaults: _.extend({}, DielectricMaterial.prototype.defaults, {
            name: 'Custom',
            color: Constants.DielectricMaterial.CUSTOM_COLOR
        }),

        reset: function() {
            this.set('dielectricConstant', Constants.DIELECTRIC_CONSTANT_RANGE.defaultValue);
        }

    });


    return DielectricMaterial;
});