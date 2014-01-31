/*global define*/
define([
    'jquery', 'backbone', 'underscore', 'masseuse', 'api', 'constants',
    'grasshopperBaseView',
    'loginView', 'loginViewConfig', 'loginWorker',
    'dashboardView', 'dashboardViewConfig',
    'alertBoxView', 'alertBoxViewConfig',
    'modalView', 'modalViewConfig',
    'resources',
    'userDetailView', 'userDetailViewConfig', 'userWorker', 'UserModel',
    'headerView', 'headerViewConfig',
    'mastheadView', 'mastheadViewConfig',
    'usersIndexView', 'usersIndexViewConfig',
    'addUserView', 'addUserViewConfig',
    'contentBrowseView', 'contentBrowseViewConfig',
    'contentDetailView', 'contentDetailViewConfig',
    'contentTypeIndexView', 'contentTypeIndexViewConfig',
    'contentTypeDetailView', 'contentTypeDetailViewConfig',
    'addFolderView', 'addFolderViewConfig',
    'addContentView', 'addContentViewConfig',
    'addAssetsView', 'addAssetsViewConfig',
    'helpers'
],
    function ($, Backbone, _, masseuse, Api, constants, GrasshopperBaseView, LoginView, loginViewConfig, loginWorker,
              DashboardView, dashboardViewConfig, AlertBoxView, alertBoxViewConfig, ModalView, modalViewConfig,
              resources, UserDetailView, userDetailViewConfig, userWorker, UserModel, HeaderView, headerViewConfig,
              MastheadView, mastheadViewConfig, UsersIndexView, usersIndexViewConfig, AddUserView, addUserViewConfig,
              ContentBrowseView, contentBrowseViewConfig, ContentDetailView, contentDetailViewConfig,
              ContentTypeIndexView, contentTypeIndexViewConfig, ContentTypeDetailView, contentTypeDetailViewConfig,
              AddFolderView, addFolderViewConfig, AddContentView, addContentViewConfig, AddAssetsView,
              addAssetsViewConfig, helpers) {

        'use strict';
        var MasseuseRouter = masseuse.MasseuseRouter,
            LocalStorage = helpers.localStorage,
            userModel = new UserModel(),
            currentView,
            Router;

        /**
         * @class Router
         * @extends MasseuseRouter
         */
        Router = MasseuseRouter.extend({
            routes : {
                'login' : 'displayLogin',
                'logout' : 'goLogout',
                'home' : 'displayApp',
                'users(/page/:pageNumber/show/:pageLimit)' : 'displayUsersIndex',
                'user/:id' : 'displayUserDetail',
                'addUser' : 'displayAddUser',
                'item/types' : 'displayContentTypeIndex',
                'item/types(/:id)' : 'displayContentTypeDetail',
                'items/nodeid/:nodeId/createAssets' : 'displayCreateAssets',
                'items/nodeid/:nodeId/createFolder' : 'displayCreateFolder',
                'items/nodeid/:nodeId/createContent' : 'displayCreateContent',
                'items(/nodeid/:nodeId)' : 'displayContentBrowse',
                'item/:id' : 'displayContentDetail',
                '*path' : 'goHome'
            },

            user : userModel,
            initialize : initialize,
            startHeader : startHeader,
            removeHeader : removeHeader,

            onRouteFail : onRouteFail,
            beforeRouting : beforeRouting,
            excludeFromBeforeRouting : ['login', 'logout'],
            userHasBreadcrumbs : userHasBreadcrumbs,
            removeThisRouteFromBreadcrumb : removeThisRouteFromBreadcrumb,

            navigateTrigger : navigateTrigger,
            navigateNinja : navigateNinja,
            navigateDeferred : navigateDeferred,
            navigateBack : navigateBack,

            loadMainContent : loadMainContent,

            goHome : goHome,
            displayApp : displayApp,
            displayLogin : displayLogin,
            goLogout : goLogout,
            navigate : navigate,
            displayUsersIndex : displayUsersIndex,
            displayUserDetail : displayUserDetail,
            displayAddUser : displayAddUser,
            displayContentBrowse : displayContentBrowse,
            displayContentDetail : displayContentDetail,
            displayContentTypeIndex : displayContentTypeIndex,
            displayContentTypeDetail : displayContentTypeDetail,
            displayCreateFolder : displayCreateFolder,
            displayCreateContent : displayCreateContent,
            displayCreateAssets : displayCreateAssets
        });

        function onRouteFail () {
            this.goLogout();
        }

        function beforeRouting () {
            var $deferred = new $.Deferred();

            if (this.mastheadView) {
                this.mastheadView.model.set(
                    {
                        nodesCount : null,
                        filesCount : null,
                        itemsCount : null
                    }
                );
            }

            loginWorker.userIsStillValidUser.call(this, $deferred);

            return $deferred.promise();
        }

        function userHasBreadcrumbs () {
            return (this.breadcrumb && this.breadcrumb.length !== 0);
        }

        function removeThisRouteFromBreadcrumb () {
            this.breadcrumb.pop();
        }

        function _handleRoutingFromRefreshOnModal (nodeId) {
            this.breadcrumb.push(Backbone.history.fragment);
            if(nodeId === '0') {
                nodeId = null;
                this.breadcrumb.unshift(constants.internalRoutes.content.replace('#', ''));
            } else {
                this.breadcrumb.unshift(constants.internalRoutes.nodeDetail.replace(':id', nodeId).replace('#', ''));
            }
            this.displayContentBrowse(nodeId);
        }

        function navigateTrigger (fragment, options, doBeforeRender) {
            options = options || {};
            options.trigger = true;
            this.navigate(fragment, options, doBeforeRender);
        }

        function navigateNinja (fragment, options) {
            options = options || {};
            options.replace = true;
            this.navigate(fragment, options);
        }

        function navigateDeferred (fragment, options) {
            options = options || {};
            options.deferred = true;
            this.navigate(fragment, options);
        }

        function navigateBack (trigger) {
            if (trigger) {
                this.navigateTrigger(this.breadcrumb[this.breadcrumb.length - 1]);
            } else {
                this.navigateNinja(this.breadcrumb[this.breadcrumb.length - 1]);
            }
        }

        function navigate (fragment, options, doBeforeRender) {
            if (currentView instanceof Backbone.View) {
                currentView.hideAlertBox.call(currentView);
            }
            if (doBeforeRender) {
                this.beforeRouting();
            }
            Backbone.Router.prototype.navigate.apply(this, arguments);
        }

        function initialize () {
            MasseuseRouter.prototype.initialize.apply(this, arguments);

            GrasshopperBaseView.prototype.channels.addChannel('views');

            GrasshopperBaseView.prototype.app = {
                router : this,
                user : this.user
            };
            GrasshopperBaseView.prototype.displayAlertBox = displayAlertBox;
            GrasshopperBaseView.prototype.displayTemporaryAlertBox = displayTemporaryAlertBox;
            GrasshopperBaseView.prototype.hideAlertBox = hideAlertBox;

            GrasshopperBaseView.prototype.displayModal = displayModal;
            GrasshopperBaseView.prototype.hideModal = hideModal;

        }

        function loadMainContent (ViewType, config, bypass) {
            var $deferred = new $.Deferred(),
                newView = new ViewType(config);

            if (currentView && currentView.name === config.name && !bypass) {
                return $deferred.resolve(currentView)
                    .promise();
            }

            newView.start()
                .progress(function (event) {
                    switch (event) {
                    case GrasshopperBaseView.beforeRenderDone:
                        if (currentView) {
                            currentView.remove();
                        }

                        currentView = newView;
                        break;
                    }
                })
                .done(function () {
                    $deferred.resolve(newView);
                })
                .fail(function () {
                    $deferred.reject();
                });

            return $deferred.promise();
        }

        function startHeader () {
            this.headerView = new HeaderView(_.extend({}, headerViewConfig, {
                modelData : {
                    userModel : this.user
                }
            }));
            this.headerView.start();
            this.mastheadView = new MastheadView(mastheadViewConfig);
            this.mastheadView.start();
        }

        function removeHeader () {
            if (this.headerView && this.mastheadView) {
                this.headerView.remove();
                this.mastheadView.remove();
                this.headerView = null;
                this.mastheadView = null;
            }
        }

        function goLogout () {
            var self = this;
            LocalStorage.remove('authToken')
                .done(function () {
                    self.user.clear();
                    self.navigate('login', {trigger : true}, true);
                });
        }

        function displayLogin () {
            loadMainContent(LoginView, loginViewConfig, true);
        }

        function displayApp () {
            loadMainContent(DashboardView, _.extend({}, dashboardViewConfig), true);
        }

        function displayAlertBox (options) {
            var alertBoxView = new AlertBoxView(_.extend({}, alertBoxViewConfig,
                {
                    modelData : {
                        msg : (options.msg),
                        status : (options.status)
                    },
                    temporary : options.temporary
                }));
            alertBoxView.start();
        }

        function displayTemporaryAlertBox (options) {
            options.temporary = true;
            this.displayAlertBox(options);
        }

        function hideAlertBox () {
            this.channels.views.trigger('hideAlertBoxes');
        }

        function displayModal (options) {
            var $deferred = new $.Deferred(),
                modalView = new ModalView(_.extend(modalViewConfig, {
                    modelData : {
                        msg : options.msg,
                        data : (options.data) ? options.data : null
                    },
                    type : (options.type) ? options.type : null,
                    $deferred : $deferred
                }));
            this.hideModal();
            modalView.start();
            GrasshopperBaseView.prototype.modalView = modalView;
            return $deferred.promise();
        }

        function hideModal () {
            if (GrasshopperBaseView.prototype.modalView && GrasshopperBaseView.prototype.modalView.remove) {
                GrasshopperBaseView.prototype.modalView.remove();
            }
        }

        function goHome () {
            this.navigateTrigger('home');
        }

        function displayUserDetail (id) {
            // TODO: I think this can be refactored to take advantage of the new permissions checking system.
            // I did the role check here instead of in the config with permissions, this is because there are Admin's
            // getting their own, Admins getting others, and others getting their own.
            if (this.user.get('role') === 'admin' || this.user.get('_id') === id) {
                loadMainContent(UserDetailView, _.extend(userDetailViewConfig,
                    {
                        modelData : {
                            id : id,
                            userModel : this.user
                        }
                    }));
            } else {
                this.navigateTrigger('home');
            }

        }

        function displayUsersIndex (pageNumber, pageLimit) {
            loadMainContent(UsersIndexView, _.extend({}, usersIndexViewConfig,
                {
                    modelData : {
                        pageNumber : pageNumber,
                        pageLimit : pageLimit
                    }
                }), true);
        }

        function displayAddUser () {
            loadMainContent(AddUserView, addUserViewConfig);
        }

        function displayContentBrowse (nodeId) {
            this.contentBrowserNodeId = nodeId;
            loadMainContent(ContentBrowseView, _.extend({}, contentBrowseViewConfig,
                {
                    modelData : {
                        nodeId : nodeId
                    }
                }
            ), true);
        }

        function displayContentDetail (id) {
            loadMainContent(ContentDetailView, _.extend({}, contentDetailViewConfig,
                {
                    modelData : {
                        _id : id
                    }
                }
            ), true);
        }

        function displayContentTypeIndex () {
            loadMainContent(ContentTypeIndexView, _.extend({}, contentTypeIndexViewConfig));
        }

        function displayContentTypeDetail (id) {
            loadMainContent(ContentTypeDetailView, _.extend({}, contentTypeDetailViewConfig,
                {
                    modelData : {
                        _id : id
                    }
                }));
        }

        function displayCreateFolder (nodeId) {
            if (!this.userHasBreadcrumbs()) {
                _handleRoutingFromRefreshOnModal.call(this, nodeId);
            }
            var addFolderView = new AddFolderView(_.extend({}, addFolderViewConfig,
                {
                    modelData : {
                        nodeId : (nodeId) ? nodeId : null
                    }
                }
            ));
            addFolderView.start();
        }

        function displayCreateContent (nodeId) {
            if (!this.userHasBreadcrumbs()) {
                _handleRoutingFromRefreshOnModal.call(this, nodeId);
            }
            loadMainContent(AddContentView, _.extend({}, addContentViewConfig,
                {
                    modelData : {
                        node : {
                            _id : nodeId
                        }
                    }
                }));
        }

        function displayCreateAssets (nodeId) {
            if (!this.userHasBreadcrumbs()) {
                _handleRoutingFromRefreshOnModal.call(this, nodeId);
            }
            var addAssetsView = new AddAssetsView(_.extend({}, addAssetsViewConfig,
                {
                    modelData : {
                        nodeId : nodeId
                    }
                }
            ));
            addAssetsView.start();
        }

        return Router;
    });