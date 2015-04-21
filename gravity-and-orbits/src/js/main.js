(function () {
    'use strict';

    // Load the config
    require(['config'], function () {
        require(['jquery', 'views/app'], function($, TemplateAppView) {

            $(function(){
                var appView = new TemplateAppView();

                // Append to body
                $('body').append(appView.el);

                // Render main app view
                appView.load();
            });
    
        });
    });

})();
