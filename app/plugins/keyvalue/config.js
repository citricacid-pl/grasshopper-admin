/*global define:false*/
define(['text!plugins/keyvalue/template.html', 'plugins/keyvalue/model', 'text!plugins/keyvalue/setupTemplate.html'],
    function (keyvaluePluginTemplate, keyvaluePluginModel, setupTemplate) {
        'use strict';

        return {
            name : 'keyvaluePlugin',
            ModelType : keyvaluePluginModel,
            modelData : {
                min : 1,
                max : 1,
                options : false,
                label : '',
                type : 'keyvalue',
                required : false,
                validation : false,
                value : ''
            },
            template : keyvaluePluginTemplate,
            setupTemplate : setupTemplate,
            events : {
                'blur .keyValueInput' : 'buildObj'
            },
            rivetConfig : 'auto',
            wrapper: false,
            listeners : [],
            mastheadButtons : []
        };
    });