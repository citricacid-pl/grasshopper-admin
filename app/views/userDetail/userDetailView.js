/*global define:false*/
define(['baseView', 'rivetView', 'resources', 'userWorker', 'underscore'], function (BaseView, rivetView, resources, userWorker, _) {

        var userDetailView = BaseView.extend({
            rivetView : rivetView({rivetScope : '#userDetail', rivetPrefix : 'userdetail', instaUpdateRivets : true}),
            displaySuccessfulSave : displaySuccessfulSave,
            displaySaveError : displaySaveError,
            updateModel : updateModel,
            beforeRender : beforeRender
        });

        function beforeRender() {
            this.listenTo(this.model, 'change', this.updateModel);
        }

        function updateModel() {
            var changedElement = $('.' + _.keys(this.model.changed)[0] + '.progress-bar'),
                changedElementIcon = $('.' + _.keys(this.model.changed)[0] + '.saving'),
                self = this;
            userWorker.updateModel(this.model, this.app.user)
                .done(function(data) {
                    displaySuccessfulSave(changedElement, changedElementIcon);
                }).fail(function(xhr) {
                    displaySaveError.call(self, xhr);
                });
        }

        function displaySuccessfulSave(changedElement, changedElementIcon) {
            var progressBar = changedElement,
                savingIcon = changedElementIcon;

            progressBar.addClass('active');
            savingIcon.addClass('visible');
            progressBar.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
                progressBar.addClass('disappear');
                progressBar.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
                    progressBar.removeClass('active').removeClass('disappear');
                    savingIcon.removeClass('visible');
                });
            });
        }

        function displaySaveError(xhr) {
            var message = '';
            if(xhr.status === 500) {
                message = $.parseJSON(xhr.responseText).message;
            } else {
                message = resources.user.errors[xhr.status];
            }
            this.displayAlertBox(message);
        }

    return userDetailView;
});