/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2018 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function () {
    var each = tinymce.each,
        extend = tinymce.extend,
        Node = tinymce.html.Node;

    function split(str, delim) {
        return str.split(delim || ',');
    }

    // list of supported AMP tags
    var ampTags = ['amp-img', 'amp-video', 'amp-ad', 'amp-fit-text', 'amp-font', 'amp-carousel', 'amp-anim', 'amp-youtube', 'amp-twitter', 'amp-vine', 'amp-instagram', 'amp-iframe', 'amp-pixel', 'amp-audio', 'amp-lightbox', 'amp-image-lightbox'];

    tinymce.create('tinymce.plugins.AmpPlugin', {
        init: function (ed, url) {
            var self = this;
            this.editor = ed;

            ed.onPreInit.add(function () {

                // pad amp tags so they are not removed....
                ed.onBeforeSetContent.add(function(ed, o) {
                    o.content = o.content.replace(/><\/amp-([^>]+?)>/gi, '>&nbsp;</amp-$1>');
                });

                each(ampTags, function (tag) {
                    ed.schema.addValidElements('+' + tag + '[!data-mce-amp="1"|*]');

                    var name = tag.replace('amp-', '');

                    // add span
                    ed.schema.children['span'][tag] = {};

                    // add anchor
                    if (ed.schema.children['a'][name]) {
                        ed.schema.children['a'][tag] = {};
                    }

                    // add div
                    ed.schema.children['div'][tag] = {};

                    each(ed.schema.getTextBlockElements(), function(data, nodeName) {                        
                        if (ed.schema.children[nodeName] && ed.schema.children[nodeName][name]) {
                            ed.schema.children[nodeName][tag] = {};
                        }
                    });
                });

                ed.parser.addNodeFilter('amp-img', function (nodes, name) {
                    var node;

                    for (var i = 0, len = nodes.length; i < len; i++) {
                        node = nodes[i];

                        var n = new Node('img', 1);

                        each(node.attributes, function (at) {
                            if (at.name.indexOf('data-mce') !== -1) {
                                return true;
                            }
                            
                            if (!ed.schema.isValid('img', at.name)) {
                                at.name = 'data-amp-' + at.name;
                            }

                            n.attr(at.name, at.value);
                        });

                        n.attr('data-mce-amp', 'img');

                        node.replace(n);
                    }
                });

                ed.serializer.addAttributeFilter('data-mce-amp', function (nodes, name) {
                    var node, tag;

                    for (var i = 0, len = nodes.length; i < len; i++) {
                        node = nodes[i], tag = node.attr('data-mce-amp');

                        // remove marker attribute
                        node.attr('data-mce-amp', null);

                        if (node.name !== "img") {
                            continue;
                        }

                        var n = new Node('amp-' + tag, 1);

                        each(node.attributes, function (at) {
                            if (at.name.indexOf('data-amp-') !== -1) {
                                at.name = at.name.replace('data-amp-', '');
                            }

                            n.attr(at.name, "" + at.value);
                        });

                        node.replace(n);
                    }
                });
            });
        }
    });

    // Register plugin
    tinymce.PluginManager.add('amp', tinymce.plugins.AmpPlugin);
})();
