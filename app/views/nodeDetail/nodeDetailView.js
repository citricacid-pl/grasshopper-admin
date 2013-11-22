/*global define:false*/
define(['baseView', 'resources'], function (BaseView, resources) {

    return BaseView.extend({
        deleteNode: deleteNode
    });

    function deleteNode() {
        var self = this;

        this.displayModal('Deleting Nodes has not been tested, confirm with Care!!!')
            .done(function() {
                self.model.destroy(
                    {
                        success: function(model) {
                            self.displayTemporaryAlertBox(resources.contentType.successfullyDeletedPre + model.get('label') + resources.contentType.successfullyDeletedPost, true);
                            self.remove();
                        },
                        error: function(model) {
                            self.displayAlertBox(resources.contentType.errorDeleted + model.get('label'));
                        }
                    });
            });
    }

});