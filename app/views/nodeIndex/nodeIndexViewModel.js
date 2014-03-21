define(['grasshopperModel', 'resources', 'constants'], function (Model, resources, constants) {
    'use strict';

    return Model.extend({
        defaults : {
            resources : resources
        },
        url : function() {
            return constants.api.nodesChildren.url.replace(':id', this.get('nodeId'));
        }
    });
});