(function () {
    'use strict';

    // Load the config
    require(['config'], function () {
        require(['jquery', 'views/app'], function($, CCKAppView) {

            $(function(){
                var appView = new CCKAppView();

                // Append to body
                $('body').append(appView.el);

                // Render main app view
                appView.load();
            });
    
        });
    });

})();
