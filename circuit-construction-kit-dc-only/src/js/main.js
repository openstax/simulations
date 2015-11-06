(function () {
    'use strict';

    // Load the config
    require(['config'], function () {
        require(['jquery', 'local/views/app'], function($, DCOnlyAppView) {

            $(function(){
                var appView = new DCOnlyAppView();

                // Append to body
                $('body').append(appView.el);

                // Render main app view
                appView.load();
            });
    
        });
    });

})();
