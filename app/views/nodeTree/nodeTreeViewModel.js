define(['grasshopperModel', 'resources', 'grasshopperCollection', 'constants',
    'views/nodeTree/nodeTreeFileDetailModel'],
    function (Model, resources, grasshopperCollection, constants,
              nodeTreeFileDetailModel) {

    'use strict';

    return Model.extend({
        initialize : initialize,
        defaults : {
            resources : resources,
            loading : false,
            hasFetchedContent : false
        }
    });

    function initialize() {
        var self = this;
        Model.prototype.initialize.apply(this, arguments);
        this.set('children', new (grasshopperCollection.extend({
            url : function() {
                return constants.api.nodesChildren.url.replace(':id', self.get('_id'));
            }
        }))());

        this.set('content', new (grasshopperCollection.extend({
            model : function(attrs, options) {
                if (self.get('nodeTreeType') === 'file') {
                    return new nodeTreeFileDetailModel(attrs, options);
                } else {
                    return new Model(attrs, options);
                }
            },
            url : function() {
                if(self.get('nodeTreeType') === 'content') {
                    return constants.api.nodesContent.url.replace(':id', self.get('_id'));
                } else if (self.get('nodeTreeType') === 'file') {
                    return constants.api.assets.url.replace(':id', self.get('_id'));
                }

            }
        }))());
    }

});