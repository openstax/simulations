define(function (require) {

    'use strict';

    var IntroElement = require('models/intro-element');

    /**
     * 
     */
    var MovableElement = IntroElement.extend({

        defaults: {
            // Physical properties
            verticalVelocity: 0,
            
            // State properties
            userControlled: false,
        },
        
        initialize: function(attributes, options) {
            IntroElement.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:userControlled', function(model, userControlled) {
                if (userControlled && this.getSupportingSurface()) {
                    this.stopListening(this.getSupportingSurface());
                    this.getSupportingSurface().clearSurface();
                    this.setSupportingSurface(null);
                }
            });
        },

        reset: function() {
            this.set('userControlled', true);
            this.setPosition(0, 0);
            this.set('verticalVelocity', 0);

            IntroElement.prototype.reset.apply(this);
        },

        setSupportingSurface: function(supportingSurface) {
            this.set('supportingSurface', supportingSurface);
            if (supportingSurface) {
                this.listenTo(supportingSurface, 'change', function() {
                    this.setPosition(supportingSurface.getCenterX(), supportingSurface.yPos);
                });    
            }
        }

    });

    return MovableElement;
});
