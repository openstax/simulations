(function () {
    'use strict';

    // Load the config
    require(['config'], function () {
        require(['jquery', 'views/app'], function($, BRCAppView) {

            $(function(){
                var appView = new BRCAppView();

                // Append to body
                $('body').append(appView.el);

                // Render main app view
                appView.load();
            });
    
        });
    });

})();
