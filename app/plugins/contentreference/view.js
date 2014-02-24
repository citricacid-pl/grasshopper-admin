/*global define:false*/
define(['grasshopperBaseView', 'underscore', 'api', 'contentTypeWorker', 'jquery',
    'plugins/contentreference/modal/view'],
    function (GrasshopperBaseView, _, Api, contentTypeWorker, $, ModalView) {
        'use strict';

        return GrasshopperBaseView.extend({
            beforeRender: beforeRender,
            afterRender : afterRender,
            stopAccordionPropagation : stopAccordionPropagation,
            contentReferenceSelected : contentReferenceSelected,
            defaultNodeSelected : defaultNodeSelected,
            setAvailableContentTypes : setAvailableContentTypes,
            setRootAdDefaultNode : setRootAdDefaultNode,
            fireSelectContentModal : fireSelectContentModal
        });

        function beforeRender($deferred) {
            this.model.get('children').fetch()
                .then(_getSelectedContent.bind(this))
                .then(_getSelectedNode.bind(this))
                .then(_getAvailableContentTypes.bind(this))
                .then($deferred.resolve);
        }

        function _getSelectedContent() {
            var contentId = this.model.get('value'),
                $deferred = new $.Deferred();

            if (contentId) {
                _getContentDetails.call(this, contentId)
                    .done(_setSelectedContent.bind(this, $deferred));
            } else {
                $deferred.resolve();
            }

            return $deferred.promise();
        }

        function _setSelectedContent($deferred, contentDetails) {
            this.model.set('selectedContent.label', contentDetails.label);
            this.model.set('selectedContent._id', contentDetails._id);
            $deferred.resolve();
        }

        function _getSelectedNode() {
            var $deferred = new $.Deferred(),
                defaultNode = this.model.get('options.defaultNode');

            if (defaultNode) {
                Api.getNodeDetail(defaultNode)
                    .done(_setSelectedNode.bind(this, $deferred));
            } else {
                $deferred.resolve();
            }

            return $deferred.promise();
        }

        function _setSelectedNode($deferred, nodeDetails) {
            this.model.set('selectedNode.label', nodeDetails.label);
            $deferred.resolve();
        }

        function _getAvailableContentTypes() {
            var $deferred = new $.Deferred();

            contentTypeWorker.getAvailableContentTypes()
                .done(_setPreSelectedTypes.bind(this, $deferred));

            return $deferred.promise();
        }

        function _setPreSelectedTypes($deferred, availableTypes) {
            var allowedTypes = this.model.get('options.allowedTypes');

            _.each(availableTypes, function(type) {
                if(_.contains(allowedTypes, type._id)) {
                    type.checked = true;
                } else {
                    type.checked = false;
                }
            });

            this.model.set('availableTypes', availableTypes);
            $deferred.resolve();
        }

        function afterRender() {
            this.model.set('showTree', true);
            this.$el.foundation();
        }

        function stopAccordionPropagation(e) {
            e.stopPropagation();
        }

        function contentReferenceSelected(selectedModel) {
            this.model.set('selectedContent.label', selectedModel.get('label'));
            this.model.set('value', selectedModel.get('_id'));
        }

        function _getContentDetails(contentId) {
            return Api.getContentDetail(contentId);
        }

        function defaultNodeSelected(selectedNode) {
            this.model.set('selectedNode.label', selectedNode.get('label'));
            this.model.set('options.defaultNode', selectedNode.get('_id'));
        }

        function setAvailableContentTypes() {
            var availableTypes = this.model.get('availableTypes'),
                checkedTypes = _.pluck(_.where(availableTypes, { checked : true }), '_id');

            this.model.set('options.allowedTypes', checkedTypes);
        }

        function setRootAdDefaultNode() {
            this.model.set('selectedNode.label', 'Root');
            this.model.set('options.defaultNode', '0');
        }

        function fireSelectContentModal() {
            var modalView = new ModalView({
                    modelData : {
                        header : 'Select Content',
                        selectedContent : this.model.get('selectedContent'),
                        _id : this.model.get('options.defaultNode')
                    }
                });

//            modalView.model.get('children').reset(this.model.get('children').models);
            modalView.start();
        }

    });