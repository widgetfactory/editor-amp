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
    var tags = ['img', 'audio', 'video', 'iframe'];

    tinymce.create('tinymce.plugins.AmpPlugin', {
        init: function (ed, url) {
            var self = this;
            this.editor = ed;

            ed.onPreInit.add(function () {
                var shortEnded = ed.schema.getShortEndedElements();
                
                ed.onBeforeSetContent.add(function (ed, o) {

                    o.content = o.content.replace(/<amp\-([a-z0-9]+)([^>]+)>([\s\S]*)<\/amp\-\1>/gi, function(match, tag, attribs, content) {
                        content = content || '&nbsp;';

                        ed.schema.addCustomElements('amp-' + tag);
                        
                        if (tags.indexOf(tag) === -1) {
                            return match;
                        }

                        var html = '<' + tag + ' data-mce-amp="' + tag + '"' + attribs;

                        if (shortEnded[tag]) {
                            return html + '/>';
                        }

                        return html + '>' + content + '</' + tag + '>';
                    });
                });

                ed.serializer.addAttributeFilter('data-mce-amp', function (nodes, name) {
                    var node, tag;
                    
                    for (var i = 0, len = nodes.length; i < len; i++) {
                        node = nodes[i], tag = node.attr('data-mce-amp');

                        var n = new Node('amp-' + tag, 1), attribs = {};

                        each(node.attributes, function (at) {
                            if (at.name.indexOf('data-mce-') !== -1) {
                                return;
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
