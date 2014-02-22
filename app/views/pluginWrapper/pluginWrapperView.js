/*global define:false*/
define(['grasshopperBaseView', 'pluginWrapperViewConfig', 'underscore', 'require'],
    function (GrasshopperBaseView, pluginWrapperViewConfig, _, require) {
        'use strict';

        return GrasshopperBaseView.extend({
            defaultOptions : pluginWrapperViewConfig,
            beforeRender : beforeRender,
            afterRender : afterRender,
            addField : addField,
            removeField : removeField
        });

        function beforeRender($deferred) {
            _getPlugin.call(this, $deferred);
        }

        function afterRender() {
            _handleMultiple.call(this);
        }

        function _getPlugin($deferred) {
            var self = this;

            require(['plugins'], function(plugins) {
                var plugin = _.find(plugins.fields, {type : self.model.get('type')});

                self.model.set({
                    ViewModule : plugin.view,
                    configModule : plugin.config
                });

                $deferred.resolve();
            });

        }


        function addField() {
            _addPlugin.call(this, undefined);
        }

        function removeField(e, context) {
            this.collection.remove(context.field);
        }

        function _handleMultiple() {
            var values = this.model.get('value'),
                minimum = this.model.get('min'),
                i = 0,
                self = this;

            if(values && _.isArray(values)) { // If values exists and is array
                _.each(values, function(value) {
                    _addPlugin.call(self, value);
                });
            } else if(values !== undefined) { // if values exists
                _addPlugin.call(this, values);
            } else { // if values does not exist and there is a minimum
                while(i < minimum) {
                    _addPlugin.call(self);
                    i++;
                }
            }
        }

        function _addPlugin(value) {
            var model = {
                value : value,
                options : this.model.get('options')
            };

            this.collection.add(model);
        }
    });