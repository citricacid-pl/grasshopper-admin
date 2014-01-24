/* jshint loopfunc:true */
define(['jquery', 'underscore', 'masseuse',
    'pluginWrapperView', 'pluginWrapperViewConfig', 'backbone'],
    function ($, _, masseuse,
              PluginWrapperView, pluginWrapperViewConfig, Backbone) {
        'use strict';


        return {
            fieldwrapper : {
                bind : function(el) {
//                    console.log('bind');
//                    console.log(el);
//                    console.log(this);
//                    console.log('------------------------------------');


                    var rivets = this,
                        viewInstance;

                    viewInstance = new PluginWrapperView(_.extend({}, pluginWrapperViewConfig, {
                        modelData : _.extend({}, rivets.model.field, {
                            value: masseuse.ProxyProperty('fields.' + rivets.model.field._id, rivets.model.view.model)
                        }),
                        collection : new (Backbone.Collection.extend({
                            initialize: function () {
//
//                            Backbone.Collection.prototype.initialize.call(this, models, options);
//
//                            this.listenTo(rivets.view.models.view.model, 'change', function () {
//                                // Update the collection here with the new data from the server
//                                this.reset(rivets.view.models.view.model.get('fields.' + field._id), {silent: true});
//                            });
//
                                this.on('add remove reset change', function () {
                                    // Update the parent model value
                                    var values = this.toJSON();

                                    if (values) {
                                        // Could probably use viewInstance.model.set() here.
                                        rivets.model.view.model.set('fields.' + rivets.model.field._id, values);
                                    }
//
//                                    this.invoke('set', {isLast: false}, {silent: true});
//                                    this.last().set('isLast', true, {silent: true});
                                });
                            },
                            toJSON: function () {
                                var json = Backbone.Collection.prototype.toJSON.apply(this),
                                    value = _.pluck(json, 'value');

                                if (value.length < 2) {
                                    return value[0];
                                }
                                return value;
                            }
                        }))([], {}),
                        appendTo : el
                    }));
                    rivets.model.view.addChild(viewInstance);
                },
                unbind : function(el) {
//                    console.log('unbind');
//                    console.log(el);
//                    console.log(this);
//                    console.log('------------------------------------');
                },
                routine : function(el, model) {
//                    console.log('routine');
//                    console.log(el);
//                    console.log(model);
//                    console.log(this);
//                    console.log('------------------------------------');
                },
                publish : true
            },
            fieldtype : {
                bind: function(el) {
//                    console.log('bind');
//                    console.log(el);
//                    console.log(this);
//                    console.log('------------------------------------');
                    var ViewModule = this.model.field.get('ViewModule'),
                        configModule = this.model.field.get('configModule');

                    this.viewInstance = new ViewModule(_.extend({}, configModule, {
                        modelData : _.extend({}, this.model.field.attributes, {
                            value : masseuse.ProxyProperty('value', this.model.field)
                        }),
                        appendTo : el
                    }));

                },

                unbind : function(el) {
//                    console.log('unbind');
//                    console.log(el);
//                    console.log(this);
//                    console.log('------------------------------------');
                    this.viewInstance.remove();
                },

                routine : function(el, model) {
//                    console.log('routine');
//                    console.log(el);
//                    console.log(model);
//                    console.log(this);
//                    console.log('------------------------------------');
                    this.viewInstance.start();
                },
                publish : true
            }
        };

    });

//fieldtype : function(el, model) {
//    var viewInstance,
//        ViewModule = model.get('ViewModule'),
//        configModule = model.get('configModule');
//
//    console.log('Creating new field view');
//
//    viewInstance = new ViewModule(_.extend({}, configModule, {
//        modelData : _.extend({}, model.attributes, {
//            value : masseuse.ProxyProperty('value', model)
//        }),
//        appendTo : el
//    }));
//    viewInstance.start();
//}