(function () {
    'use strict';

    // Load the config
    require(['config'], function () {
        require(['jquery', 'views/app'], function($, VectorAdditionAppView) {

            $(function(){
                var appView = new VectorAdditionAppView();

                // Append to body
                $('body').append(appView.el);

                // Render main app view
                appView.load();
            });

        });
    });

})();
