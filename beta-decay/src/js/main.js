(function () {
    'use strict';

    // Load the config
    require(['config'], function () {
        require(['jquery', 'local/views/app'], function($, BetaDecayAppView) {

            $(function(){
                var appView = new BetaDecayAppView();

                // Append to body
                $('body').append(appView.el);

                // Render main app view
                appView.load();
            });
    
        });
    });

})();
