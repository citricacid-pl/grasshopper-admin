define(['jquery', 'underscore', 'resources', 'constants', 'api'],
    function ($, _, resources, constants, Api) {
        'use strict';

        var clipboardContent = {};
        var subscribers = [];

        return {
            cutContent: cutContent,
            copyContent: copyContent,
            pasteContent: pasteContent,
            subscribe: subscribe,
            clear: clear
        };

        function _notify() {
            _.each(subscribers, function (that) {

                // see http://stackoverflow.com/questions/9909799/backbone-js-change-not-firing-on-model-change
                that.unset('clipboardContent', {silent: true});
                that.set({'clipboardContent': clipboardContent});

            });
        }

        function subscribe(that) {
            subscribers.push(that);
        }

        function cutContent(ctx, content) {
            clipboardContent = {op: 'move', values: [content]};
            _notify();
        }

        function copyContent(ctx, content) {
            clipboardContent = {op: 'copy', values: [content]};
            _notify();
        }

        function clear() {
            clipboardContent = {};
            _notify();
        }

        function _getIds(values) {
            return _.map(values, function (item) {
                return {id: item.id, type: item.type};
            });
        }

        function _prepareMoveRequest(clipboardContent, folderInfo) {
            return {op: clipboardContent.op, from: _getIds(clipboardContent.values), to: folderInfo.id};
        }

        function pasteContent(ctx, ids, folderInfo) {
            var $deferred = new $.Deferred();

            if (clipboardContent && clipboardContent.op) {
                var msg = 'Should we ';
                msg += clipboardContent.op;
                msg += ' ';
                msg += clipboardContent.values.length;
                msg += ' item' + (clipboardContent.values.length !== 1 ? 's' : '');
                msg += ' to folder ';
                msg += folderInfo.name ? folderInfo.name : 'ROOT';
                msg += '?';

                _displayPasteWarning.call(this, ctx, msg).then(function () {
                    Api.moveContent(_prepareMoveRequest(clipboardContent, folderInfo)).then(function (data) {
                        clear();
                        $deferred.resolve(data);
                    }, function (err) {
                        $deferred.reject(err);
                        _displayError.call(this, ctx, ( err &&  err.responseJSON) ? err.responseJSON.message : 'Cannot complete operation');
                    });
                }, function (err) {
                    $deferred.reject(err);
                });
            }
            else {
                $deferred.reject('No operation specfified');
            }
            return $deferred.promise();
        }

        function _displayPasteWarning(view, msg) {
            return view.displayModal(
                {
                    header: resources.warning,
                    type: 'warning',
                    msg: msg
                });
        }

        function _displayError(view, msg) {
            return view.displayModal(
                {
                    header: resources.error,
                    type: 'error',
                    msg: msg
                });
        }

    });