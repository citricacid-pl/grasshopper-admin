/*global define:false*/
define(['grasshopperBaseView', 'underscore', 'api', 'contentTypeWorker', 'jquery',
    'masseuse', 'mixins/itemSelectModal', 'plugins/contentreference/buildNodeRadioList'],
    function (GrasshopperBaseView, _, Api, contentTypeWorker, $,
              masseuse, itemSelectModal, buildNodeRadioList) {

        'use strict';

        return GrasshopperBaseView.extend({
            beforeRender: beforeRender,
            afterRender : afterRender,
            stopAccordionPropagation : stopAccordionPropagation,
            setAvailableContentTypes : setAvailableContentTypes,
            fireSelectContentModal : fireSelectContentModal,
            selectDefaultNode : selectDefaultNode
        })
            .extend(itemSelectModal)
            .extend(buildNodeRadioList);

        function beforeRender() {
            if(!this.model.get('inSetup')) {
                _getSelectedContent.call(this);
                this.model.on('change:value', _getSelectedContent.bind(this));
            }
        }

        function afterRender() {
            if(this.model.get('inSetup')) {
                $.when(this.model.get('childNodesDeep').fetch(), _getAvailableContentTypes.call(this))
                    .done(
                        this.buildNodeRadioList.bind(this, $('#nodeRadioList'), this.model.get('childNodesDeep')),
                        _getSelectedNode.bind(this)
                    );
            }
        }

        function _getSelectedContent() {
            var contentId = this.model.get('value'),
                $deferred = new $.Deferred();

            if (contentId) {
                _getContentDetails.call(this, contentId)
                    .done(_setSelectedContent.bind(this), $deferred.resolve);
            } else {
                $deferred.resolve();
            }

            return $deferred.promise();
        }

        function _getContentDetails(contentId) {
            return Api.getContentDetail(contentId);
        }

        function _setSelectedContent(contentDetails) {
            this.model.set('contentDetails', contentDetails);
        }

        function _getSelectedNode() {
            var defaultNode = this.model.get('options.defaultNode'),
                $defaultNodeRadio = this.$('#selectDefaultNode').find('#'+ defaultNode);

            $defaultNodeRadio.prop('checked', true);

            this.selectDefaultNode();
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

        function stopAccordionPropagation(e) {
            e.stopPropagation();
        }

        function setAvailableContentTypes() {
            var availableTypes = this.model.get('availableTypes'),
                checkedTypes = _.pluck(_.where(availableTypes, { checked : true }), '_id');

            this.model.set('options.allowedTypes', checkedTypes);
        }

        function selectDefaultNode() {
            var $selectedNode = this.$('#selectDefaultNode').find('input:radio[name="nodeRadio"]:checked'),
                selectedNodeId = $selectedNode.val(),
                selectedNodeLabel = $selectedNode.attr('data-label');

            this.model.set('selectedNodeLabel', selectedNodeLabel);
            this.model.set('options.defaultNode', selectedNodeId);

        }

        function fireSelectContentModal() {
            _startModalView.call(this)
                .done(_contentReferenceSelected.bind(this));
        }

        function _contentReferenceSelected(selectedContentId) {
            this.model.set('value', selectedContentId);
        }

        function _startModalView() {
            this.model.set('inSetup', false);

            return this.fireItemSelectModal();
        }

    });