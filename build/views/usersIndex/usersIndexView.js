/*global define:false*/
define(['jquery', 'grasshopperBaseView', 'usersIndexViewConfig', 'userWorker', 'constants', 'underscore',
    'userDetailView', 'text!views/userDetail/_userDetailRow.html'],
    function ($, GrasshopperBaseView, usersIndexViewConfig, userWorker, constants, _,
              UserDetailView, rowTemplate) {
        'use strict';
        return GrasshopperBaseView.extend({
            defaultOptions : usersIndexViewConfig,
            beforeRender : beforeRender,
            goToPage : goToPage,
            checkAndSetLimit : checkAndSetLimit,
            changeLimit : changeLimit,
            appendUserRow : appendUserRow
        });

        function beforeRender ($deferred) {
            var self = this,
                model = this.model.toJSON();

            this.goToPage(model.pageNumber || model.defaultPage, model.pageLimit || model.defaultLimit)
                .done(function () {
                    self.model.get('users').each(function (model) {
                        self.appendUserRow(model);
                    });
                    $deferred.resolve();
                });
        }

        function goToPage (page, limit) {
            var pageLimit = this.checkAndSetLimit(limit),
                $deferred = new $.Deferred();

            return userWorker.getUsers(this, {
                data : {
                    page : page,
                    limit : pageLimit
                }
            }, $deferred);
        }

        function checkAndSetLimit (limit) {
            if (limit) {
                this.model.set('pageLimit', limit);
            }
            return this.model.get('pageLimit');
        }

        function changeLimit (event) {
            this.goToPage(constants.userCollection.page, event.target.value);
        }

        function appendUserRow (model) {

            var userDetailView = new UserDetailView({
                    name : 'userDetailRow',
                    appendTo : '#usersIndexTable',
                    wrapper : false,
                    template : rowTemplate,
                    model : model,
                    mastheadButtons : null
                });
            this.addChild(userDetailView);
        }
    });