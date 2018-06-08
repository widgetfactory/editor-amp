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
                var shortEnded = ed.schema.getShortEndedElements();

                each(ampTags, function (tag) {
                    ed.schema.addValidElements('+' + tag + '[*]');
                });

                ed.parser.addNodeFilter('amp-img', function (nodes, name) {
                    var node;

                    for (var i = 0, len = nodes.length; i < len; i++) {
                        node = nodes[i];

                        var n = new Node('img', 1);

                        each(node.attributes, function (at) {
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

                        var n = new Node('amp-' + tag, 1);

                        each(node.attributes, function (at) {
                            if (at.name.indexOf('data-mce-') !== -1) {
                                return;
                            }

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
