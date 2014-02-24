/*global define:false*/
define(['text!plugins/embeddedtype/template.html', 'plugins/embeddedtype/model',
    'text!plugins/embeddedtype/setupTemplate.html', 'appBinders'],
    function (embeddedtypePluginTemplate, embeddedtypePluginModel,
              setupTemplate, appBinders) {
        'use strict';

        return {
            name : 'embeddedtypePlugin',
            ModelType : embeddedtypePluginModel,
            modelData : {
                min : 1,
                max : 1,
                options : true,
                label : '',
                type : 'embeddedtype',
                required : false,
                validation : false,
                value : ''
            },
            template : embeddedtypePluginTemplate,
            setupTemplate : setupTemplate,
            events : {},
            rivetConfig : 'auto',
            wrapper: false,
            listeners : [],
            mastheadButtons : [],
            rivetsBinders : [appBinders]
        };
    });