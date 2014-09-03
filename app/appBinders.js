/* jshint loopfunc:true */
define(['jquery', 'underscore', 'masseuse',
    'pluginWrapperView', 'backbone', 'pluginWrapperViewCollection', 'resources'],
    function ($, _, masseuse,
              PluginWrapperView, Backbone, PluginWrapperViewCollection, resources) {

        'use strict';

        return {
            fieldwrapper : {
                bind : function() {},
                unbind : function() {
                    this.viewInstance.remove();
                },
                routine : function(el) {
                    var rivets = this,
                        parentView = this.model.view,
                        thisField = this.model.field;

                    rivets.viewInstance = new PluginWrapperView({
                        modelData : _.extend({}, thisField, {
                            value: masseuse.ProxyProperty('fields.' + thisField._id, parentView.model)
                        }),
                        collection : PluginWrapperViewCollection.createFromParentView(parentView, thisField),
                        appendTo : el
                    });

                    parentView.addChild(rivets.viewInstance);
                },
                publish : true
            },
            'move-to' : function(el, selector) {
                var $selector = $(selector);
                $selector.append($(el).contents());
                $selector.foundation();
            },
            'stop-propagation' : function(el) {
                $(el).on('click', function(e) {
                    e.stopPropagation();
                });
            },
            'swap-text-while' : function(el, revert) {
                var $el = $(el);

                if(revert) {
                    if(!$el.attr('oldText')) { // Should Only Do this once.
                        $el.attr('oldText', $el.html());
                        $el.width($el.width()); // Forces the buttons to maintain width.
                    }
                    $el.html($el.attr('data-swap-html') || 'Saving...');
                } else {
                    $el.html($el.attr('oldText'));
                }
            },
            'select2' : function(el) { // Bind the collection if you want this sucker to refresh the select2 on events.
                var $el = $(el);

                $el.select2(
                    {
                        width : '100%'
                    });
            },
            'multiple-select' : function(el, collection) {
                var $el = $(el);

                if(_.has($el, 'multipleSelect')) {
                    $el.multipleSelect('refresh');
                } else {
                    $el.multipleSelect({
                        selectAlltext : resources.selectAll,
                        filter : $el.attr('filter'),
                        width : '100%'
                    }).change(function() {
                        collection.trigger('selection', _.map($el.val(), function(value) { return { _id : value }; }));
                    });
                }
            },
            'velocity-show' : function(el, trigger) { // When trigger is true, show
                _velocityShowHide(el, trigger);
            },
            'velocity-hide' : function(el, trigger) { // When trigger is true, hide
                _velocityShowHide(el, !trigger);
            }
        };

        function _velocityShowHide(el, show) {
            var $el = $(el);

            if(show) {
                $el.velocity(
                    {
                        opacity : 1
                    },
                    {
                        display : ''
                    });
            } else {
                $el.hide();
            }
        }
    });
