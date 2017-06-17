"use strict";
var editCrmProperties = {
    crm: {
        type: Array,
        value: [],
        notify: true
    },
    crmLoading: {
        type: Boolean,
        value: false,
        notify: true
    },
    crmEmpty: {
        type: Boolean,
        value: true,
        notify: true,
        computed: '_isCrmEmpty(crm, crmLoading)'
    },
    isSelecting: {
        type: Boolean,
        value: false,
        notify: true
    },
    isAdding: {
        type: Boolean,
        value: false,
        notify: true
    }
};
var EC = (function () {
    function EC() {
    }
    EC._isColumnEmpty = function (column) {
        return column.list.length === 0 && !this.isAdding;
    };
    ;
    EC._isCrmEmpty = function (crm, crmLoading) {
        return !crmLoading && crm.length === 0;
    };
    ;
    EC._getAriaLabel = function (item) {
        return 'Edit item "' + item.name + '"';
    };
    ;
    EC.getColumns = function () {
        if (this.columns && document.contains(this.columns[0])) {
            return this.columns;
        }
        return (this.columns = Array.prototype.slice.apply(this.$.mainCont.children).filter(function (element) {
            return element.classList.contains('CRMEditColumnCont');
        }).map(function (columnCont) {
            return columnCont.querySelector('.CRMEditColumn');
        }));
    };
    ;
    EC.getLastMenu = function (list, hidden, exclude) {
        var lastMenu = -1;
        var lastFilledMenu = -1;
        if (list) {
            list.forEach(function (item, index) {
                if ((item.type === 'menu' || (window.app.shadowStart && item.menuVal)) && !hidden[item.id]) {
                    item.children = item.children || [];
                    if (exclude === undefined || index !== exclude) {
                        lastMenu = index;
                        if (item.children.length > 0) {
                            lastFilledMenu = index;
                        }
                    }
                }
            });
            if (lastFilledMenu !== -1) {
                return lastFilledMenu;
            }
        }
        return lastMenu;
    };
    ;
    EC.isNodeVisible = function (result, node, showContentType) {
        var length;
        if (node.children && node.children.length > 0) {
            length = node.children.length;
            for (var i = 0; i < length; i++) {
                this.isNodeVisible(result, node.children[i], showContentType);
            }
        }
        if (!node.onContentTypes[showContentType]) {
            result[node.id] = true;
            return 0;
        }
        return 1;
    };
    ;
    EC.getIndent = function (data, lastMenu, hiddenNodes) {
        var i;
        var length = data.length - 1;
        var visibleIndent = lastMenu;
        for (i = 0; i < length; i++) {
            if (hiddenNodes[data[i].id]) {
                visibleIndent--;
            }
        }
        return visibleIndent;
    };
    ;
    EC.buildCRMEditObj = function (setMenus, unsetMenus) {
        var column;
        var indent;
        var path = [];
        var columnCopy;
        var columnNum = 0;
        var lastMenu = -2;
        var indentTop = 0;
        var crmEditObj = [];
        var newSetMenus = [];
        var list = window.app.settings.crm;
        var setMenusLength = setMenus.length;
        var showContentTypes = window.app.crmType;
        var hiddenNodes = {};
        var shown = 0;
        for (var i = 0; i < list.length; i++) {
            shown += this.isNodeVisible(hiddenNodes, list[i], showContentTypes);
        }
        if (shown || this.isAdding) {
            while (lastMenu !== -1) {
                if (setMenusLength > columnNum && setMenus[columnNum] !== -1 &&
                    !hiddenNodes[list[setMenus[columnNum]].id]) {
                    lastMenu = setMenus[columnNum];
                }
                else {
                    lastMenu = this.getLastMenu(list, hiddenNodes, unsetMenus[columnNum]);
                }
                newSetMenus[columnNum] = lastMenu;
                indent = this.getIndent(list, lastMenu, hiddenNodes);
                var columnIndent = [];
                columnIndent[indentTop - 1] = undefined;
                column = {
                    indent: columnIndent,
                    menuPath: path.concat(lastMenu),
                    list: list,
                    index: columnNum,
                    shadow: window.app.shadowStart && window.app.shadowStart <= columnNum
                };
                list.forEach(function (item) {
                    item.expanded = false;
                });
                if (lastMenu !== -1) {
                    indentTop += indent;
                    var lastNode = list[lastMenu];
                    lastNode.expanded = true;
                    if (window.app.shadowStart && lastNode.menuVal) {
                        list = lastNode.menuVal;
                    }
                    else {
                        list = list[lastMenu].children;
                    }
                }
                column.list.map(function (currentVal, index) {
                    currentVal.path = [];
                    path.forEach(function (item, pathIndex) {
                        currentVal.path[pathIndex] = item;
                    });
                    currentVal.index = index;
                    currentVal.isPossibleAddLocation = false;
                    currentVal.path.push(index);
                    return currentVal;
                });
                columnCopy = column.list.filter(function (item) {
                    return !hiddenNodes[item.id];
                });
                column.list = columnCopy;
                path.push(lastMenu);
                crmEditObj.push(column);
                columnNum++;
            }
        }
        this.columns = null;
        return {
            crm: crmEditObj,
            setMenus: newSetMenus
        };
    };
    ;
    EC.setColumnContOffset = function (column, offset, force) {
        if (force === void 0) { force = false; }
        if (column.offset === undefined) {
            column.offset = 0;
        }
        if (force) {
            column.offset = offset;
        }
        else {
            column.offset += offset;
        }
        column.style.transform = "translateY(" + column.offset + "px)";
    };
    EC.moveFollowingColumns = function (startColumn, offset) {
        var topLevelColumns = window.app.editCRM.querySelectorAll('.CRMEditColumnCont');
        for (var i = startColumn.index + 1; i < topLevelColumns.length; i++) {
            this.setColumnContOffset(topLevelColumns[i], offset);
        }
    };
    EC.createSorter = function () {
        var _this = this;
        this.sortables = this.sortables.filter(function (sortable) {
            sortable.destroy();
            return false;
        });
        this.getColumns().forEach(function (column, columnIndex, allColumns) {
            var draggedNode = null;
            var lastRelated = null;
            var moves = 0;
            var movedUp = false;
            _this.sortables.push(new Sortable(column, {
                group: 'crm',
                animation: 50,
                handle: '.dragger',
                ghostClass: 'draggingCRMItem',
                chosenClass: 'draggingFiller',
                scroll: true,
                onChoose: function (event) {
                    var node = event.item;
                    draggedNode = node;
                    lastRelated = node;
                    if (node.item.type === 'menu' && node.expanded) {
                        node.expanded = false;
                        node.querySelector('.menuArrow').removeAttribute('expanded');
                        for (var i = columnIndex + 1; i < allColumns.length; i++) {
                            allColumns[i].style.display = 'none';
                        }
                    }
                    node.currentColumn = column;
                },
                onEnd: function (event) {
                    var newColumn = event.item.parentNode.index;
                    var index = event.newIndex;
                    window.app.crm.move(event.item.item.path, window.app.editCRM.setMenus.slice(0, newColumn).concat(index), allColumns[newColumn] === column);
                },
                onMove: function (event) {
                    _this.async(function () {
                        if (event.to !== event.dragged.currentColumn) {
                            var topLevelColumns = window.app.editCRM.querySelectorAll('.CRMEditColumnCont');
                            var leftmostColumn = Math.min(event.dragged.currentColumn.index, event.to.index);
                            _this.setColumnContOffset(topLevelColumns[leftmostColumn], 0, true);
                            for (var i = leftmostColumn; i < topLevelColumns.length - 1; i++) {
                                var col = topLevelColumns[i];
                                var colMenu = Array.prototype.slice.apply(col.querySelectorAll('edit-crm-item'))
                                    .filter(function (node) {
                                    return node !== event.dragged && node.item && node.item.type === 'menu' && node.expanded;
                                })[0];
                                if (!colMenu) {
                                    break;
                                }
                                var colMenuIndex = Array.prototype.slice.apply(colMenu.parentElement.children)
                                    .indexOf(colMenu) + window.app.editCRM.crm[i].indent.length + col.offset;
                                var baseOffset = window.app.editCRM.crm[i + 1].indent.length;
                                _this.setColumnContOffset(topLevelColumns[i + 1], ((colMenuIndex - baseOffset) * 50), true);
                            }
                        }
                        else {
                            if (event.related.item.type === 'menu' && event.related.expanded) {
                                if (event.relatedRect.top < event.draggedRect.top) {
                                    if (moves !== 1 || !movedUp) {
                                        _this.moveFollowingColumns(event.to, 50);
                                        movedUp = true;
                                    }
                                }
                                else {
                                    _this.moveFollowingColumns(event.to, -50);
                                }
                            }
                        }
                        draggedNode.currentColumn = event.to;
                        lastRelated = event.related;
                        moves++;
                    }, 10);
                }
            }));
        });
    };
    EC.build = function (settings) {
        if (settings === void 0) { settings = {
            setItems: [],
            unsetItems: [],
            quick: false,
            superquick: false
        }; }
        var setItems = settings.setItems, unsetItems = settings.unsetItems, quick = settings.quick, superquick = settings.superquick;
        setItems = setItems || [];
        unsetItems = unsetItems || [];
        quick = quick || false;
        superquick = superquick || false;
        var obj = this.buildCRMEditObj(setItems, unsetItems);
        this.setMenus = obj.setMenus;
        var crmBuilder = obj.crm;
        var hight;
        var highest = 0;
        crmBuilder.forEach(function (column) {
            hight = column.indent.length + column.list.length;
            hight > highest && (highest = hight);
        });
        this.$.mainCont.style.minHeight = (highest * 50) + 'px';
        this.crm = [];
        if (this.currentTimeout !== null) {
            window.clearTimeout(this.currentTimeout);
        }
        this.crmLoading = true;
        this.columns = null;
        function func() {
            var _this = this;
            this.crm = crmBuilder;
            this.notifyPath('crm', this.crm);
            this.currentTimeout = null;
            setTimeout(function () {
                _this.crmLoading = false;
                var els = document.getElementsByTagName('edit-crm-item');
                for (var i = 0; i < els.length; i++) {
                    els[i].update && els[i].update();
                }
                setTimeout(function () {
                    window.app.pageDemo.create();
                    _this.createSorter();
                }, 0);
            }, 50);
        }
        if (superquick) {
            func.apply(this);
        }
        else {
            this.currentTimeout = window.setTimeout(func.bind(this), quick ? 150 : 1000);
        }
        return crmBuilder;
    };
    ;
    EC.ready = function () {
        var _this = this;
        window.app.editCRM = this;
        window.app.addEventListener('crmTypeChanged', function () {
            _this._typeChanged();
        });
        this._typeChanged(true);
    };
    ;
    EC.addToPosition = function (e) {
        var node = window.app.util.findElementWithClassName(e.path, 'addingItemPlaceholder');
        this.addItem(JSON.parse(node.getAttribute('data-path')));
        this.isAdding = false;
    };
    ;
    EC.cancelAdding = function () {
        if (this.isAdding) {
            this.isAdding = false;
            this.build({
                setItems: this.setItems,
                superquick: true
            });
        }
    };
    ;
    EC.toggleAddState = function () {
        if (!this.isAdding) {
            this.isSelecting && this.cancelSelecting();
            this.isAdding = true;
            this.build({
                setItems: this.setItems,
                superquick: true
            });
        }
        else {
            this.cancelAdding();
        }
    };
    ;
    EC.addItem = function (path) {
        var newItem = window.app.templates.getDefaultLinkNode({
            id: window.app.generateItemId()
        });
        var container = window.app.crm.lookup(path, true);
        container.push(newItem);
        window.app.editCRM.build({
            setItems: window.app.editCRM.setMenus,
            superquick: true
        });
        window.app.upload();
    };
    ;
    EC.getSelected = function () {
        var selected = [];
        var editCrmItems = document.getElementsByTagName('edit-crm-item');
        var i;
        for (i = 0; i < editCrmItems.length; i++) {
            if (editCrmItems[i].classList.contains('highlighted')) {
                selected.push(editCrmItems[i].item.id);
            }
        }
        return selected;
    };
    ;
    EC.ifDefSet = function (node, target) {
        var props = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            props[_i - 2] = arguments[_i];
        }
        for (var i = 0; i < props.length; i++) {
            var property = props[i];
            if (node[property] !== void 0) {
                target[property] = node[property];
            }
        }
    };
    EC.makeNodeSafe = function (node) {
        var newNode = {};
        this.ifDefSet(node, newNode, 'type', 'name', 'value', 'linkVal', 'menuVal', 'nodeInfo', 'triggers', 'scriptVal', 'stylesheetVal', 'onContentTypes', 'showOnSpecified');
        if (node.children) {
            newNode.children = [];
            for (var i = 0; i < node.children.length; i++) {
                newNode.children[i] = this.makeNodeSafe(node.children[i]);
            }
        }
        return newNode;
    };
    ;
    EC.extractUniqueChildren = function (node, toExportIds, results) {
        if (toExportIds.indexOf(node.id) > -1) {
            results.push(node);
        }
        else {
            for (var i = 0; node.children && i < node.children.length; i++) {
                this.extractUniqueChildren(node.children[i], toExportIds, results);
            }
        }
    };
    ;
    EC.changeAuthor = function (node, authorName) {
        if (node.nodeInfo.source !== 'local') {
            node.nodeInfo.source.author = authorName;
            for (var i = 0; node.children && i < node.children.length; i++) {
                this.changeAuthor(node.children[i], authorName);
            }
        }
    };
    ;
    EC.crmExportNameChange = function (node, author) {
        if (author) {
            node.nodeInfo && node.nodeInfo.source && node.nodeInfo.source !== 'local' &&
                (node.nodeInfo.source.author = author);
        }
        return JSON.stringify(node);
    };
    ;
    EC.getMetaIndexes = function (script) {
        var metaStart = -1;
        var metaEnd = -1;
        var lines = script.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (metaStart !== -1) {
                if (lines[i].indexOf('==/UserScript==') > -1) {
                    metaEnd = i;
                    break;
                }
            }
            else if (lines[i].indexOf('==UserScript==') > -1) {
                metaStart = i;
            }
        }
        return {
            start: metaStart,
            end: metaEnd
        };
    };
    ;
    EC.getMetaLines = function (script) {
        var metaIndexes = this.getMetaIndexes(script);
        if (metaIndexes.start === -1) {
            return null;
        }
        var metaStart = metaIndexes.start;
        var metaEnd = metaIndexes.end;
        var startPlusOne = metaStart + 1;
        var lines = script.split('\n');
        var metaLines = lines.splice(startPlusOne, (metaEnd - startPlusOne));
        return metaLines;
    };
    ;
    EC.getMetaTags = function (script) {
        var metaLines = this.getMetaLines(script);
        var metaTags = {};
        var regex = new RegExp(/@(\w+)(\s+)(.+)/);
        var regexMatches;
        for (var i = 0; i < metaLines.length; i++) {
            regexMatches = metaLines[i].match(regex);
            if (regexMatches) {
                metaTags[regexMatches[1]] = metaTags[regexMatches[1]] || [];
                metaTags[regexMatches[1]].push(regexMatches[3]);
            }
        }
        return metaTags;
    };
    ;
    EC.setMetaTagIfSet = function (metaTags, metaTagKey, nodeKey, node) {
        if (node && node[nodeKey]) {
            if (Array.isArray(node[nodeKey])) {
                metaTags[metaTagKey] = node[nodeKey];
            }
            else {
                metaTags[metaTagKey] = [node[nodeKey]];
            }
        }
    };
    ;
    EC.getUserscriptString = function (node, author) {
        var i;
        var code = (node.type === 'script' ? node.value.script : node.value.stylesheet);
        var codeSplit = code.split('\n');
        var metaIndexes = this.getMetaIndexes(code);
        var metaTags = {};
        if (metaIndexes.start !== -1) {
            codeSplit.splice(metaIndexes.start, (metaIndexes.end - metaIndexes.start) + 1);
            metaTags = this.getMetaTags(code);
        }
        this.setMetaTagIfSet(metaTags, 'name', 'name', node);
        author = (metaTags['nodeInfo'] && JSON.parse(metaTags['nodeInfo'][0]).author) || author || 'anonymous';
        var authorArr = [];
        if (!Array.isArray(author)) {
            authorArr = [author];
        }
        metaTags['author'] = authorArr;
        if (node.nodeInfo.source !== 'local') {
            this.setMetaTagIfSet(metaTags, 'downloadURL', 'url', node.nodeInfo.source);
        }
        this.setMetaTagIfSet(metaTags, 'version', 'version', node.nodeInfo);
        metaTags['CRM_contentTypes'] = [JSON.stringify(node.onContentTypes)];
        this.setMetaTagIfSet(metaTags, 'grant', 'permissions', node);
        var matches = [];
        var excludes = [];
        for (i = 0; i < node.triggers.length; i++) {
            if (node.triggers[i].not) {
                excludes.push(node.triggers[i].url);
            }
            else {
                matches.push(node.triggers[i].url);
            }
        }
        metaTags['match'] = matches;
        metaTags['exclude'] = excludes;
        this.setMetaTagIfSet(metaTags, 'CRM_launchMode', 'launchMode', node.value);
        if (node.type === 'script' && node.value.libraries) {
            metaTags['require'] = [];
            for (i = 0; i < node.value.libraries.length; i++) {
                if (node.value.libraries[i].url) {
                    metaTags['require'].push(node.value.libraries[i].url);
                }
            }
        }
        if (node.type === 'stylesheet') {
            metaTags['CRM_stylesheet'] = ['true'];
            this.setMetaTagIfSet(metaTags, 'CRM_toggle', 'toggle', node.value);
            this.setMetaTagIfSet(metaTags, 'CRM_defaultOn', 'defaultOn', node.value);
            var stylesheetCode = codeSplit.join('\n');
            codeSplit = ["GM_addStyle('" + stylesheetCode.replace(/\n/g, '\\n\' + \n\'') + "');"];
        }
        var metaLines = [];
        for (var metaKey in metaTags) {
            if (metaTags.hasOwnProperty(metaKey)) {
                for (i = 0; i < metaTags[metaKey].length; i++) {
                    metaLines.push('// @' + metaKey + '	' + metaTags[metaKey][i]);
                }
            }
        }
        var newScript = "// ==UserScript==\n" + metaLines.join('\n') + "\n// ==/UserScript\n" + codeSplit.join('\n');
        return newScript;
    };
    ;
    EC.generateDocumentRule = function (node) {
        var rules = node.triggers.map(function (trigger) {
            if (trigger.url.indexOf('*') === -1) {
                return 'url(' + trigger + ')';
            }
            else {
                var schemeAndDomainPath = trigger.url.split('://');
                var scheme = schemeAndDomainPath[0];
                var domainPath = schemeAndDomainPath.slice(1).join('://');
                var domainAndPath = domainPath.split('/');
                var domain = domainAndPath[0];
                var path = domainAndPath.slice(1).join('/');
                var schemeWildCard = scheme.indexOf('*') > -1;
                var domainWildcard = domain.indexOf('*') > -1;
                var pathWildcard = path.indexOf('*') > -1;
                if (~~schemeWildCard + ~~domainWildcard + ~~pathWildcard > 1 ||
                    domainWildcard || schemeWildCard) {
                    return 'regexp("' +
                        trigger.url
                            .replace(/\*/, '.*')
                            .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") +
                        '")';
                }
                else {
                    return 'url-prefix(' + scheme + '://' + domain + ')';
                }
            }
        });
        var match;
        var indentation;
        var lines = node.value.stylesheet.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if ((match = /(\s+)(\w+)/.exec(lines[i]))) {
                indentation = match[1];
                break;
            }
        }
        indentation = indentation || '	';
        return '@-moz-document ' + rules.join(', ') + ' {' +
            lines.map(function (line) {
                return indentation + line;
            }).join('\n') +
            '}';
    };
    ;
    EC.getExportString = function (node, type, author) {
        switch (type) {
            case 'Userscript':
                return this.getUserscriptString(node, author);
            case 'Userstyle':
                if (node.value.launchMode === 0 || node.value.launchMode === 1) {
                    return node.value.stylesheet;
                }
                else {
                    return this.generateDocumentRule(node);
                }
            default:
            case 'CRM':
                return this.crmExportNameChange(node, author);
        }
    };
    ;
    EC.exportSingleNode = function (exportNode, exportType) {
        var __this = this;
        var textArea = $('#exportJSONData')[0];
        textArea.value = this.getExportString(exportNode, exportType, null);
        $('#exportAuthorName')[0].value =
            (exportNode.nodeInfo && exportNode.nodeInfo.source &&
                exportNode.nodeInfo.source &&
                exportNode.nodeInfo.source !== 'local' &&
                exportNode.nodeInfo.source.author) || 'anonymous';
        $('#exportAuthorName').on('keydown', function () {
            var _this = this;
            window.setTimeout(function () {
                var author = _this.value;
                chrome.storage.local.set({
                    authorName: author
                });
                var data;
                data = __this.getExportString(exportNode, exportType, author);
                textArea.value = data;
            }, 0);
        });
        $('#exportDialog')[0].open();
        setTimeout(function () {
            textArea.focus();
            textArea.select();
        }, 150);
    };
    ;
    EC.exportGivenNodes = function (exports) {
        var _this = this;
        var safeExports = [];
        for (var i = 0; i < exports.length; i++) {
            safeExports[i] = this.makeNodeSafe(exports[i]);
        }
        var data = {
            crm: safeExports
        };
        var textarea = $('#exportJSONData')[0];
        function authorNameChange(event) {
            var author = event.target.value;
            chrome.storage.local.set({
                authorName: author
            });
            for (var j = 0; j < safeExports.length; j++) {
                _this.changeAuthor(safeExports[j], author);
            }
            var dataJson = JSON.stringify({
                crm: safeExports
            });
            textarea.value = dataJson;
        }
        $('#exportAuthorName').on('change', authorNameChange);
        textarea.value = JSON.stringify(data);
        $('#exportDialog')[0].open();
        setTimeout(function () {
            textarea.focus();
            textarea.select();
        }, 150);
        if (window.app.storageLocal.authorName) {
            authorNameChange({
                target: {
                    value: window.app.storageLocal.authorName
                }
            });
        }
    };
    ;
    EC.exportGivenNodeIDs = function (toExport) {
        var exports = [];
        for (var i = 0; i < window.app.settings.crm.length; i++) {
            this.extractUniqueChildren(window.app.settings.crm[i], toExport, exports);
        }
        this.exportGivenNodes(exports);
    };
    ;
    EC.exportSelected = function () {
        var toExport = this.getSelected();
        this.exportGivenNodeIDs(toExport);
    };
    ;
    EC.cancelSelecting = function () {
        var _this = this;
        var editCrmItems = document.getElementsByTagName('edit-crm-item');
        for (var i = 0; i < editCrmItems.length; i++) {
            editCrmItems[i].classList.remove('selecting');
            editCrmItems[i].classList.remove('highlighted');
        }
        setTimeout(function () {
            _this.isSelecting = false;
        }, 150);
    };
    ;
    EC.removeSelected = function () {
        var j;
        var arr;
        var toRemove = this.getSelected();
        for (var i = 0; i < toRemove.length; i++) {
            arr = window.app.crm.lookupId(toRemove[i], true);
            if (!arr) {
                continue;
            }
            for (j = 0; j < arr.length; j++) {
                if (arr[j].id === toRemove[i]) {
                    arr.splice(j, 1);
                }
            }
        }
        window.app.upload();
        this.build({
            quick: true
        });
        this.isSelecting = false;
    };
    ;
    EC.selectItems = function () {
        var _this = this;
        var editCrmItems = document.getElementsByTagName('edit-crm-item');
        for (var i = 0; i < editCrmItems.length; i++) {
            editCrmItems[i].classList.add('selecting');
        }
        setTimeout(function () {
            _this.isSelecting = true;
        }, 150);
    };
    ;
    EC.getCRMElementFromPath = function (path, showPath) {
        if (showPath === void 0) { showPath = false; }
        var i;
        for (i = 0; i < path.length - 1; i++) {
            if (this.setMenus[i] !== path[i]) {
                if (showPath) {
                    this.build({
                        setItems: path,
                        superquick: true
                    });
                    break;
                }
                else {
                    return null;
                }
            }
        }
        var cols = this.$.mainCont.children;
        var row = cols[path.length + 1].children;
        for (i = 0; i < row.length; i++) {
            if (row[i].tagName === 'PAPER-MATERIAL') {
                row = row[i].children[0].children;
                break;
            }
        }
        for (i = 0; i < row.length; i++) {
            if (window.app.util.compareArray(row[i].item.path, path)) {
                return row[i];
            }
        }
        return null;
    };
    ;
    EC._typeChanged = function (quick) {
        if (quick === void 0) { quick = false; }
        for (var i = 0; i < 6; i++) {
            window.app.editCRM.classList[(i === window.app.crmType ? 'add' : 'remove')](window.app.pageDemo.getCrmTypeFromNumber(i));
        }
        window.runOrAddAsCallback(window.app.editCRM.build, window.app.editCRM, [{
                quick: quick
            }]);
    };
    return EC;
}());
EC.is = 'edit-crm';
EC.currentTimeout = null;
EC.setMenus = [];
EC.selectedElements = [];
EC.columns = [];
EC.sortables = [];
EC.properties = editCrmProperties;
EC.listeners = {
    'crmTypeChanged': '_typeChanged'
};
Polymer(EC);
