"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
window.logElements = (function () {
    function getTag(item, parent, additionalProps) {
        if (additionalProps === void 0) { additionalProps = {}; }
        if (additionalProps['isEval']) {
            return React.createElement(EvalElement, __assign({}, additionalProps, { parent: parent, value: item }));
        }
        if (item === null || item === undefined) {
            return React.createElement(StringElement, __assign({}, additionalProps, { parent: parent, value: item }));
        }
        switch (typeof item) {
            case 'function':
                return React.createElement(FunctionElement, __assign({}, additionalProps, { parent: parent, value: item }));
            case 'object':
                return React.createElement(ObjectElement, __assign({}, additionalProps, { parent: parent, value: item }));
            case 'string':
            default:
                return React.createElement(StringElement, __assign({}, additionalProps, { parent: parent, value: item }));
        }
    }
    var LogElement = (function (_super) {
        __extends(LogElement, _super);
        function LogElement(props) {
            return _super.call(this, props) || this;
        }
        LogElement.prototype.showContextMenu = function (e) {
            window.logConsole.initContextMenu(this, e);
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        return LogElement;
    }(React.Component));
    var EvalElement = (function (_super) {
        __extends(EvalElement, _super);
        function EvalElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EvalElement.prototype.componentDidMount = function () {
            if (this.props.hasResult) {
                this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
            }
        };
        EvalElement.prototype.isLine = function () {
            return true;
        };
        EvalElement.prototype.render = function () {
            return (React.createElement("div", { ref: "cont", className: "evalElementContainer" },
                React.createElement("div", { className: "evalElementCommand" },
                    React.createElement("div", { className: "evalElementCommandPrefix" }, ">"),
                    React.createElement("div", { className: "evalElementCommandValue" }, this.props.value.code)),
                React.createElement("div", { className: "evalElementStatus" }, (this.props.value.hasResult ?
                    React.createElement("div", { className: "evalElementReturn" },
                        React.createElement("div", { className: "evalElementReturnPrefix" }, "<"),
                        React.createElement("div", { className: "evalElementReturnValue" }, getTag(this.props.value.result, this)))
                    :
                        React.createElement("paper-spinner", { className: "tinySpinner", active: true })))));
        };
        return EvalElement;
    }(LogElement));
    var StringElement = (function (_super) {
        __extends(StringElement, _super);
        function StringElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StringElement.prototype.componentDidMount = function () {
            if (!this.props.nolistener) {
                this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
            }
        };
        StringElement.prototype.render = function () {
            var type = typeof this.props.value;
            var value;
            if (this.props.value === null || this.props.value === undefined) {
                value = this.props.value + '';
            }
            else {
                value = JSON.stringify(this.props.value);
            }
            return React.createElement("div", { ref: "cont", className: "stringElementValue", type: type }, value + ' ');
            ;
        };
        return StringElement;
    }(LogElement));
    ;
    var fnRegex = /^(.+)\{((.|\s|\n|\r)+)\}$/;
    var FunctionElement = (function (_super) {
        __extends(FunctionElement, _super);
        function FunctionElement(props) {
            return _super.call(this, props) || this;
        }
        FunctionElement.prototype.expand = function () {
            this.refs.arrow.classList.toggle('toggled');
            this.refs.expandedElements.classList.toggle('visible');
        };
        FunctionElement.prototype.componentDidMount = function () {
            this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
        };
        FunctionElement.prototype.render = function () {
            var fn = this.props.value.toString();
            var fnMatch = fnRegex.exec(fn);
            var functionPrefix = fnMatch[1];
            var functionText = fnMatch[2];
            var functionKeywordIndex = functionPrefix.indexOf('function') || 0;
            var expandClick = this.expand.bind(this);
            return (React.createElement("div", { ref: "cont", className: "functionElementCont" },
                React.createElement("div", { className: "functionElement" },
                    React.createElement("div", { className: "functionElementPreviewArea" },
                        React.createElement("div", { ref: "arrow", className: "objectElementExpandArrow", onClick: expandClick },
                            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 48 48" },
                                React.createElement("path", { d: "M16 10v28l22-14z" }))),
                        React.createElement("div", { className: "functionElementPreview" },
                            React.createElement("div", { className: "functionElementPrefixCont" },
                                React.createElement("div", { className: "functionElementPrefix" },
                                    React.createElement("span", { className: "functionElementKeyword" }, "function"),
                                    React.createElement("span", null, ' ' + this.props.value.name + '()'))))),
                    React.createElement("div", { ref: "expandedElements", className: "functionElementExpanded" },
                        React.createElement("div", { className: "functionElementExpandedContent" },
                            React.createElement("div", { className: "functionElementPrefixCont" }, functionPrefix.indexOf('=>') > -1 ?
                                React.createElement("div", { className: "functionElementPrefix" }, "functionPrefix") : React.createElement("div", { className: "functionElementPrefix" },
                                React.createElement("span", null, functionPrefix.slice(0, functionKeywordIndex)),
                                React.createElement("span", { className: "functionElementKeyword" }, "function"),
                                React.createElement("span", null, functionPrefix.slice(functionKeywordIndex + 8) + '{'))),
                            React.createElement("div", { className: "functionElementValue" }, functionText),
                            React.createElement("span", null, "}"))))));
        };
        return FunctionElement;
    }(LogElement));
    function getKeyValuePairs(item, deep) {
        if (deep === void 0) { deep = false; }
        if (Array.isArray(item)) {
            return item.map(function (value, index) {
                return {
                    index: index,
                    value: value
                };
            });
        }
        else {
            var props = Object.getOwnPropertyNames(item).map(function (key) {
                if (key === '__proto__' && item[key] === null) {
                    return null;
                }
                else if (key !== '__parent') {
                    return {
                        index: key,
                        value: item[key]
                    };
                }
                return null;
            }).filter(function (pair) {
                return pair !== null;
            });
            if (deep && Object.getOwnPropertyNames(item).indexOf('__proto__') === -1) {
                props.push({
                    index: '__proto__',
                    value: Object.getPrototypeOf(item)
                });
            }
            return props;
        }
    }
    var ObjectElement = (function (_super) {
        __extends(ObjectElement, _super);
        function ObjectElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ObjectElement.prototype.expand = function () {
            if (!this.props.expanded && !this.props.renderedExpanded) {
                this.props.renderedExpanded = true;
                var _this_1 = this;
                var expandedElements_1 = [];
                var pairs = getKeyValuePairs(this.props.value, true);
                var lastElementIndex_1 = pairs.length - 1;
                pairs.forEach(function (item, i) {
                    expandedElements_1.push(React.createElement("div", { className: "expandedObjectElement" },
                        React.createElement("div", { className: "expandedObjectElementIndex" },
                            item.index,
                            ":"),
                        React.createElement("div", { className: "expandedObjectElementValue" }, getTag(item.value, _this_1, {
                            isProto: item.index === '__proto__'
                        })),
                        i < lastElementIndex_1 ? React.createElement("span", { className: "arrayComma" }, ",") : null));
                });
                this.props.expandedElements = expandedElements_1;
                this.setState({
                    expanded: true
                });
            }
            this.refs.arrow.classList.toggle('toggled');
            this.refs.expandedElements.classList.toggle('visible');
        };
        ObjectElement.prototype.componentDidMount = function () {
            this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
        };
        ObjectElement.prototype.render = function () {
            var dataType = Array.isArray(this.props.value) ? 'arr' : 'object';
            var expandClick = this.expand.bind(this);
            var dataPairs = getKeyValuePairs(this.props.value);
            var lastElIndex = dataPairs.length - 1;
            var isExpandable = dataType === 'object' ||
                dataPairs.length >= 10 ||
                dataPairs.filter(function (pair) {
                    return typeof pair.value === 'object';
                }).length > 0;
            var overflows = (dataType === 'object' && dataPairs.length > 3) ||
                (dataType === 'arr' && dataPairs.length > 10);
            var nonOverflowItems = dataPairs.slice(0, (this.props.isProto ? 0 :
                dataType === 'object' ? 3 : 10));
            if (overflows) {
                nonOverflowItems.push({
                    overflow: true
                });
            }
            return (React.createElement("div", { ref: "cont", className: "objectElementCont" },
                React.createElement("div", { className: "objectElementPreviewArea" },
                    React.createElement("div", { ref: "arrow", className: "objectElementExpandArrow", hidden: !isExpandable, onClick: expandClick },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 48 48" },
                            React.createElement("path", { d: "M16 10v28l22-14z" }))),
                    React.createElement("div", { className: "objectElementPreviewCont" },
                        React.createElement("span", null, dataType === 'arr' ? '[' : '{'),
                        nonOverflowItems.map(function (item, i) {
                            var index = item.index;
                            var data = item.value;
                            if (typeof data === 'object') {
                                if (Array.isArray(data)) {
                                    return (React.createElement("span", { className: "objectElementValueCont" },
                                        dataType === 'object' ? React.createElement("span", { className: "objectElementKey" },
                                            index,
                                            ":") : null,
                                        React.createElement("span", { className: "specialArrayElement" }, "Array"),
                                        i < lastElIndex ? React.createElement("span", { className: "arrayComma" }, ",") : null));
                                    ;
                                }
                                else {
                                    return (React.createElement("span", { className: "objectElementValueCont" },
                                        dataType === 'object' ? React.createElement("span", { className: "objectElementKey" },
                                            index,
                                            ":") : null,
                                        React.createElement("span", { className: "specialArrayElement" }, "Object"),
                                        i < lastElIndex ? React.createElement("span", { className: "arrayComma" }, ",") : null));
                                    ;
                                }
                            }
                            else if (typeof data === 'function') {
                                return (React.createElement("span", { className: "objectElementValueCont" },
                                    dataType === 'object' ? React.createElement("span", { className: "objectElementKey" },
                                        index,
                                        ":") : null,
                                    React.createElement("span", { className: "specialArrayElement" }, "Function"),
                                    i < lastElIndex ? React.createElement("span", { className: "arrayComma" }, ",") : null));
                                ;
                            }
                            else if (item.overflow) {
                                return (React.createElement("span", { className: "objectElementValueCont" },
                                    React.createElement("span", { className: "specialArrayElement" }, "...")));
                                ;
                            }
                            return (React.createElement("span", { className: "objectElementValueCont" },
                                dataType === 'object' ? React.createElement("span", { className: "objectElementKey" },
                                    index,
                                    ":") : null,
                                React.createElement(StringElement, { nolistener: "true", value: data }),
                                i < lastElIndex ? React.createElement("span", { className: "arrayComma" }, ",") : null));
                            ;
                        }, this),
                        React.createElement("span", null, dataType === 'arr' ? ']' : '}'))),
                React.createElement("div", { ref: "expandedElements", className: "objectElementExpanded" }, this.props.expandedElements)));
            ;
        };
        return ObjectElement;
    }(LogElement));
    var LogLine = (function (_super) {
        __extends(LogLine, _super);
        function LogLine(props) {
            return _super.call(this, props) || this;
        }
        LogLine.prototype.isLine = function () {
            return true;
        };
        LogLine.prototype.takeToTab = function () {
            chrome.tabs.get(~~this.props.line.tabId, function (tab) {
                if (chrome.runtime.lastError) {
                    window.logConsole.$['genericToast'].text = 'Tab has been closed';
                    window.logConsole.$['genericToast'].show();
                    return;
                }
                chrome.tabs.highlight({
                    windowId: tab.windowId,
                    tabs: tab.index
                }, function () {
                    if (chrome.runtime.lastError) {
                        console.log(chrome.runtime.lastError);
                        console.log('Something went wrong highlighting the tab');
                    }
                });
            });
        };
        LogLine.prototype.render = function () {
            var _this = this;
            var takeToTab = this.takeToTab.bind(this);
            return (React.createElement("div", { "data-error": this.props.line.isError, className: "logLine" },
                React.createElement("div", { className: "lineData" },
                    React.createElement("div", { className: "lineTimestamp" }, this.props.line.timestamp),
                    React.createElement("div", { className: "lineContent" }, this.props.value.map(function (value) {
                        return getTag(value, _this, {
                            isEval: _this.props.line.isEval
                        });
                    }))),
                React.createElement("div", { className: "lineSource" },
                    React.createElement("span", { className: "lineSourceIdCont", title: this.props.line.nodeTitle },
                        "[id-",
                        React.createElement("span", { className: "lineSourceId" }, this.props.line.id),
                        "]"),
                    React.createElement("span", { className: "lineSourceTabCont", onClick: takeToTab, tabIndex: 1, title: this.props.line.tabTitle },
                        "[tab-",
                        React.createElement("span", { className: "lineSourceTab" }, this.props.line.tabId),
                        "][",
                        this.props.line.tabIndex,
                        "]"),
                    React.createElement("span", { className: "lineSourceLineCont" },
                        "@",
                        React.createElement("span", { className: "lineSourceLineNumber" }, this.props.line.lineNumber.trim())))));
        };
        return LogLine;
    }(React.Component));
    var LogLineContainer = (function (_super) {
        __extends(LogLineContainer, _super);
        function LogLineContainer(props) {
            return _super.call(this, props) || this;
        }
        LogLineContainer.prototype.add = function (lineData, line) {
            this.setState({
                lines: this.state.lines.concat([{
                        data: lineData,
                        line: line
                    }])
            });
            this.props.logConsole.set('lines', this.state.lines.length);
        };
        LogLineContainer.prototype.popEval = function () {
            var lines = this.state.lines.reverse();
            var popped = null;
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].line.isEval) {
                    popped = lines.splice(i, 1);
                    break;
                }
            }
            if (popped) {
                this.setState({
                    lines: lines.reverse()
                });
                this.props.logConsole.set('lines', this.state.lines.length);
            }
            return popped[0];
        };
        LogLineContainer.prototype.clear = function () {
            this.setState({
                lines: []
            });
            this.props.logConsole.set('lines', this.state.lines.length);
        };
        LogLineContainer.prototype.render = function () {
            var children = [];
            this.state = this.state || {
                lines: []
            };
            for (var i = 0; i < this.state.lines.length; i++) {
                children.push(React.createElement(LogLine, { value: this.state.lines[i].data, line: this.state.lines[i].line }));
            }
            return (React.createElement("div", { className: "logLines" }, children));
            ;
        };
        return LogLineContainer;
    }(React.Component));
    return {
        logLines: LogLineContainer
    };
})();
