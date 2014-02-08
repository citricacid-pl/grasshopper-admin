/*global define:false*/
define(['grasshopperBaseView', 'nodeIndexViewConfig', 'nodeDetailView', 'underscore',
    'text!views/nodeDetail/_nodeDetailRow.html'],
    function (GrasshopperBaseView, nodeIndexViewConfig, NodeDetailView, _,
              nodeDetailRowTemplate) {
        'use strict';

        return GrasshopperBaseView.extend({
            defaultOptions: nodeIndexViewConfig,
            beforeRender : beforeRender
        });

        function beforeRender ($deferred) {
            var self = this,
                models;

            if (this.nodeId) {
                // TODO: Make this a computed property.
                // TODO: The nodeId is coming through as 0 when in the root. So. This check is worthless.
                // Though, the inRoot stuff is still valid.
                // TODO: This inRoot stuff is expressed in a bunch of different places....try to DRY this up.
                this.model.url = this.model.url.replace(':id', this.nodeId);
                this.root = false;
                this.app.router.mastheadView.model.set('inRoot', false);
            } else {
                // TODO: Make this a computed property.
                this.model.url = this.model.url.replace(':id', 0);
                this.root = true;
                this.app.router.mastheadView.model.set('inRoot', true);
            }

            this.model.fetch()
                .done(function () {
                    models = _.omit(self.model.attributes, 'resources');

                    _.each(models, function (node) {
                        _appendNodeDetailRow.call(self, node);
                    });

                    $deferred.resolve();
                    self.app.router.mastheadView.model.set('nodesCount', _.size(self.model.attributes) - 2);
                });
        }

        function _appendNodeDetailRow (node) {
            var nodeDetailView = new NodeDetailView({
                    name : 'nodeDetailRow',
                    modelData : node,
                    appendTo : '#nodeDetailRow',
                    wrapper : false,
                    template : nodeDetailRowTemplate,
                    mastheadButtons : this.mastheadButtons
                });
            this.addChild(nodeDetailView);
        }
    });
