define(function(require) {

    'use strict';

    var PIXIHelpLabel = require('./help-label-pixi');
    var HTMLHelpLabel = require('./help-label');

    function HelpLabelView(options){

        if(options.attachTo && options.attachTo.$el){
            return new HTMLHelpLabel(options);
        } else {
            return new PIXIHelpLabel(options);
        }

    }

    return HelpLabelView; 
});