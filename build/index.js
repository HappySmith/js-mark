import * as Util from "./util.js";
var textSelector = (function () {
    function textSelector(element) {
        this.element = element;
        this.selection = window.getSelection();
        this._mouseUp = null;
        this._click = null;
        this._selected = null;
        this.onSelected = null;
        this.onClick = null;
        this._initEvent();
    }
    textSelector.prototype._initEvent = function () {
        var that = this;
        this._mouseUp = function () {
            that.captureSelection();
        };
        this._click = function (e) {
            if (e.target !== null && "dataset" in e.target) {
                var selector = e.target.dataset.selector;
                if (selector) {
                    var doms = document.querySelectorAll("span[data-selector=\"" + selector + "\"]");
                    that.onClick && that.onClick(doms);
                }
            }
        };
        this._selected = function (e) {
            this.onSelected && this.onSelected({
                code: typeof (e) === "string" ? -1 : 1,
                data: e
            });
        };
        this.addEvent();
    };
    textSelector.prototype.addEvent = function () {
        var that = this;
        this.element.addEventListener("mouseup", function (e) {
            that._mouseUp && that._mouseUp(e);
        });
        this.element.addEventListener("click", function (e) {
            that._click && that._click(e);
        });
    };
    textSelector.prototype.destroyEvent = function () {
        var that = this;
        this.element.removeEventListener("mouseup", function (e) {
            that._mouseUp && that._mouseUp(e);
        });
        this.element.removeEventListener("click", function (e) {
            that._click && that._click(e);
        });
    };
    textSelector.prototype.fromStore = function (obj) {
        var _this = this;
        obj.map(function (item) {
            var startParentNode = Util.relativeNode(_this.element, item.offset);
            var endParentNode = Util.relativeNode(_this.element, item.offset + item.text.length);
            if (endParentNode && startParentNode) {
                _this.captureSelection({
                    "collapsed": false,
                    "commonAncestorContainer": _this.element,
                    "endContainer": endParentNode,
                    "endOffset": item.offset + item.text.length - Util.relativeOffset(endParentNode, _this.element),
                    "startContainer": startParentNode,
                    "startOffset": item.offset - Util.relativeOffset(startParentNode, _this.element),
                });
            }
        });
    };
    textSelector.prototype.captureSelection = function (rangeNode) {
        var selection = this.selection;
        if (selection == null)
            return;
        var range = rangeNode || selection.getRangeAt(0);
        console.log(range);
        if (range.collapsed)
            return;
        var r = {
            startContainer: range.startContainer,
            endContainer: range.endContainer,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
        };
        if (r.startContainer !== r.endContainer) {
            var endContainer = r.endContainer.splitText(r.endOffset);
            r.endContainer = endContainer.previousSibling;
            r.startContainer = r.startContainer.splitText(r.startOffset);
        }
        else {
            var endContainer = r.endContainer.splitText(r.endOffset);
            r.startContainer = r.startContainer.splitText(r.startOffset);
            r.endContainer = endContainer.previousSibling;
        }
        var textNodes = Util.getTextNodes(range.commonAncestorContainer);
        var offset = Util.relativeOffset(r.startContainer, this.element);
        var rangeNodes = this.getSelectTextNode(textNodes, r);
        var text = "";
        for (var i = 0; i < rangeNodes.length; i++) {
            var e = rangeNodes[i];
            text += e.nodeValue;
        }
        var firstRender = true;
        if (!rangeNode) {
            firstRender = false;
            selection.removeAllRanges();
        }
        this._selected && this._selected({
            nodes: rangeNodes,
            text: text,
            offset: offset,
            firstRender: firstRender
        });
    };
    textSelector.prototype.getSelectTextNode = function (textNodes, range) {
        var startIndex = textNodes.indexOf(range.startContainer);
        var endIndex = textNodes.indexOf(range.endContainer);
        var rangeText = textNodes.filter(function (item, i) {
            return startIndex <= i && endIndex >= i;
        });
        return rangeText;
    };
    textSelector.prototype.repaintRange = function (eleArr, cssClass) {
        var uuid = Util.Guid();
        eleArr.forEach(function (node) {
            if (node.parentNode) {
                var hl = document.createElement("span");
                hl.className = cssClass;
                hl.setAttribute("data-selector", uuid);
                node.parentNode.replaceChild(hl, node);
                hl.appendChild(node);
            }
        });
        return uuid;
    };
    textSelector.prototype.clearRange = function (eleArr) {
        eleArr.forEach(function (node) {
            if (node.parentNode) {
                var fragment = document.createDocumentFragment();
                var childNodes = node.childNodes;
                for (var i = 0; i < childNodes.length; i++) {
                    var node_1 = childNodes[i];
                    fragment.appendChild(node_1.cloneNode(true));
                }
                node.parentNode.replaceChild(fragment, node);
            }
        });
    };
    return textSelector;
}());
export default textSelector;
