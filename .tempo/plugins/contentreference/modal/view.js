/*global define:false*/
define(['grasshopperBaseView', 'plugins/contentreference/modal/config', 'jquery', 'breadcrumbWorker'],
    function (GrasshopperBaseView, config, $, breadcrumbWorker) {

        'use strict';

        return GrasshopperBaseView.extend({
            defaultOptions : config,
            beforeRender : beforeRender,
            afterRender : afterRender,
            stopAccordionPropagation : stopAccordionPropagation,
            confirmModal : confirmModal,
            cancelModal : cancelModal,
            setSelectedNode : setSelectedNode,
            navigateToFolder : navigateToFolder
        });

        function beforeRender($deferred) {
            _setBreadcrumbs.call(this);
            $.when(_fetchChildNodes.call(this),
                    _fetchChildContent.call(this),
                    _fetchCurrentNode.call(this))
                .done(_toggleLoadingSpinner.bind(this), $deferred.resolve);
        }

        function afterRender() {
            this.$el.foundation();
        }

        function _fetchChildNodes() {
            return this.model.get('children').fetch();
        }

        function _fetchChildContent() {
            return this.model.get('content').fetch();
        }

        function _fetchCurrentNode() {
            return this.model.fetch();
        }

        function _toggleLoadingSpinner() {
            this.model.toggle('loading');
        }

        function stopAccordionPropagation(e) {
            e.stopPropagation();
        }

        function confirmModal () {
            this.$deferred.resolve(this.model.attributes);
            _removeModal.call(this);
        }

        function cancelModal () {
            this.$deferred.reject();
            _removeModal.call(this);
        }

        function _removeModal () {
            this.remove();
        }

        function setSelectedNode() {
            return false;
        }

        function _setBreadcrumbs() {
            var $deferred = new $.Deferred(),
                self = this;

            $deferred.done(function() {
                self.model.set('breadcrumbs', self.breadcrumbs);
            });

            breadcrumbWorker.contentBrowse.call(this, $deferred, { trigger : false });
        }

        function navigateToFolder(e) {
            this.model.set('_id', $(e.target).attr('nodeId'));

            breadcrumbWorker.resetBreadcrumb.call(this);
            _setBreadcrumbs.call(this);
            _fetchChildNodes.call(this);
            _fetchChildContent.call(this);
            _fetchCurrentNode.call(this);
        }

    });
