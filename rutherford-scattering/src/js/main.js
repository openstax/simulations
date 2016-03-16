(function () {
    'use strict';

    // Load the config
    require(['config'], function () {
        require(['jquery', 'views/app'], function($, RutherfordScatteringAppView) {

            $(function(){
                var appView = new RutherfordScatteringAppView();

                // Append to body
                $('body').append(appView.el);

                // Render main app view
                appView.load();
            });
    
        });
    });

})();
