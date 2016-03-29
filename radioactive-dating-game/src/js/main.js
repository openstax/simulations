(function () {
    'use strict';

    // Load the config
    require(['config'], function () {
        require(['jquery', 'radioactive-dating-game/views/app'], function($, RadioactiveDatingGameAppView) {

            $(function(){
                var appView = new RadioactiveDatingGameAppView();

                // Append to body
                $('body').append(appView.el);

                // Render main app view
                appView.load();
            });
    
        });
    });

})();
