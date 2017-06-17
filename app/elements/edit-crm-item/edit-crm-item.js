"use strict";
var editCrmItemProperties = {
    item: {
        type: Object,
        notify: true
    },
    expanded: {
        type: Boolean,
        notify: true
    },
    shadow: {
        type: Boolean,
        notify: true
    },
    itemName: {
        type: String,
        notify: true
    },
    isMenu: {
        type: Boolean,
        notify: true
    },
    isCode: {
        type: Boolean,
        notify: true
    }
};
var ECI = (function () {
    function ECI() {
    }
    ECI._openCodeSettings = function () {
        window.app.initCodeOptions(this.item);
    };
    ECI.getMenuExpandMessage = function () {
        return 'Click to show ' + this.item.children.length + ' child' +
            (this.item.children.length > 1 ? 'ren' : '');
    };
    ;
    ECI.update = function () {
        if (!this.classList.contains('id' + this.item.id)) {
            var classes = this.classList;
            for (var i = 0; i < classes.length; i++) {
                if (classes[i].indexOf('id') > -1) {
                    this.classList.remove(classes[i]);
                    break;
                }
            }
            this.ready();
        }
    };
    ;
    ECI.ready = function () {
        if (this.classList.contains('draggingFiller')) {
            return;
        }
        var _this = this;
        this.classList.add('id' + this.item.id);
        if (this.classList[0] !== 'wait') {
            this.itemIndex = this.index;
            this.item = this.item;
            this.itemName = this.item.name;
            this.calculateType();
            this.itemIndex = this.index;
            this.$.typeSwitcher && this.$.typeSwitcher.ready && this.$.typeSwitcher.ready();
            if (window.app.editCRM.isSelecting) {
                this.classList.add('selecting');
                if (window.app.editCRM.selectedElements.indexOf(this.item.id) > -1) {
                    this.onSelect(true, true);
                }
                else {
                    this.onDeselect(true, true);
                }
            }
        }
        if (~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] >= 30) {
            this.$.typeSwitcher.addEventListener('mouseenter', function () {
                _this.typeIndicatorMouseOver.apply(_this, []);
            });
            this.$.typeSwitcher.addEventListener('mouseleave', function () {
                _this.typeIndicatorMouseLeave.apply(_this, []);
            });
        }
        else {
            var hoveringTypeSwitcher_1 = false;
            this.$.typeSwitcher.addEventListener('mouseover', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (!hoveringTypeSwitcher_1) {
                    hoveringTypeSwitcher_1 = true;
                    _this.typeIndicatorMouseOver.apply(_this, []);
                }
            });
            document.body.addEventListener('mouseover', function () {
                if (hoveringTypeSwitcher_1) {
                    hoveringTypeSwitcher_1 = false;
                    _this.typeIndicatorMouseLeave.apply(_this, []);
                }
            });
        }
    };
    ;
    ECI.openMenu = function () {
        window.app.editCRM.build({
            setItems: this.item.path,
            superquick: true
        });
    };
    ;
    ECI.selectThisNode = function () {
        var prevState = this.$.checkbox.checked;
        this.$.checkbox.checked = !prevState;
        if (document.getElementsByClassName('highlighted').length === 0) {
            this.classList.add('firstHighlighted');
        }
        prevState ? this.onDeselect() : this.onSelect();
    };
    ;
    ECI.openEditPage = function () {
        if (!this.shadow && !window.app.item) {
            if (!this.classList.contains('selecting')) {
                var item = this.item;
                window.app.item = item;
                if (item.type === 'script') {
                    window.app.stylesheetItem = {};
                    window.app.scriptItem = item;
                }
                else if (item.type === 'stylesheet') {
                    window.app.scriptItem = {};
                    window.app.stylesheetItem = item;
                }
                else {
                    window.app.stylesheetItem = {};
                    window.app.scriptItem = {};
                }
                window.crmEditPage.init();
            }
            else {
                this.selectThisNode();
            }
        }
    };
    ;
    ECI.getNextNode = function (node) {
        if (node.children) {
            return node.children[0];
        }
        var path = Array.prototype.slice.apply(node.path);
        var currentNodeSiblings = window.app.crm.lookup(path, true);
        var currentNodeIndex = path.splice(path.length - 1, 1)[0];
        while (currentNodeSiblings.length - 1 <= currentNodeIndex) {
            currentNodeSiblings = window.app.crm.lookup(path, true);
            currentNodeIndex = path.splice(path.length - 1, 1)[0];
        }
        return currentNodeSiblings[currentNodeIndex + 1];
    };
    ;
    ECI.getPreviousNode = function (node) {
        var path = Array.prototype.slice.apply(node.path);
        var currentNodeSiblings = window.app.crm.lookup(path, true);
        var currentNodeIndex = path.splice(path.length - 1, 1)[0];
        if (currentNodeIndex === 0) {
            var parent_1 = window.app.crm.lookup(path);
            return parent_1;
        }
        var possibleParent = currentNodeSiblings[currentNodeIndex - 1];
        if (possibleParent.children) {
            return possibleParent.children[possibleParent.children.length - 1];
        }
        return possibleParent;
    };
    ;
    ECI.getNodesOrder = function (reference, other) {
        var i;
        var referencePath = reference.path;
        var otherPath = other.path;
        if (referencePath.length === otherPath.length) {
            var same = true;
            for (i = 0; i < referencePath.length; i++) {
                if (referencePath[i] !== otherPath[i]) {
                    same = false;
                    break;
                }
            }
            if (same) {
                return 'same';
            }
        }
        var biggestArray = (referencePath.length > otherPath.length ? referencePath.length : otherPath.length);
        for (i = 0; i < biggestArray; i++) {
            if (otherPath[i] !== undefined && referencePath[i] !== undefined) {
                if (otherPath[i] > referencePath[i]) {
                    return 'after';
                }
                else if (otherPath[i] < referencePath[i]) {
                    return 'before';
                }
            }
            else {
                if (otherPath[i] !== undefined) {
                    return 'after';
                }
                else {
                    return 'before';
                }
            }
        }
        return 'same';
    };
    ;
    ECI.generateShiftSelectionCallback = function (node, wait) {
        return function () {
            window.setTimeout(function () {
                window.app.editCRM.getCRMElementFromPath(node.path).onSelect(true);
            }, wait);
        };
    };
    ;
    ECI.selectFromXToThis = function () {
        var _this = this;
        var firstHighlightedNode = document.getElementsByClassName('firstHighlighted')[0];
        var firstHighlightedItem = firstHighlightedNode.item;
        $('.highlighted').each(function () {
            this.classList.remove('highlighted');
        });
        var relation = this.getNodesOrder(firstHighlightedItem, this.item);
        if (relation === 'same') {
            this.classList.add('highlighted');
            this.$.checkbox.checked = true;
            window.app.editCRM.selectedElements = [this.item.id];
        }
        else {
            firstHighlightedNode.classList.add('highlighted');
            firstHighlightedNode.$.checkbox.checked = true;
            window.app.editCRM.selectedElements = [firstHighlightedNode.item.id];
            var wait = 0;
            var nodeWalker = (relation === 'after' ? this.getNextNode : this.getPreviousNode);
            var node = nodeWalker(firstHighlightedItem);
            while (node.id !== this.item.id) {
                this.generateShiftSelectionCallback(node, wait)();
                wait += 35;
                node = nodeWalker(node);
            }
            window.setTimeout(function () {
                _this.classList.add('highlighted');
                _this.$.checkbox.checked = true;
                window.app.editCRM.selectedElements.push(_this.item.id);
            }, wait);
        }
    };
    ;
    ECI.checkClickType = function (e) {
        if (e.detail.sourceEvent.ctrlKey) {
            window.app.editCRM.cancelAdding();
            window.app.editCRM.selectItems();
            this.selectThisNode();
        }
        else if (this.classList.contains('selecting') && e.detail.sourceEvent.shiftKey) {
            this.selectFromXToThis();
        }
        else {
            window.app.editCRM.cancelAdding();
            this.openEditPage();
        }
    };
    ;
    ECI.calculateType = function () {
        this.type = this.item.type;
        ((this.isScript = this.item.type === 'script') &&
            (this.isLink = this.isMenu = this.isDivider = this.isStylesheet = false)) ||
            ((this.isLink = this.item.type === 'link') &&
                (this.isMenu = this.isDivider = this.isStylesheet = false)) ||
            ((this.isStylesheet = this.item.type === 'stylesheet') &&
                (this.isMenu = this.isDivider = false)) ||
            ((this.isMenu = this.item.type === 'menu') &&
                (this.isDivider = false)) ||
            (this.isDivider = true);
        this.isCode = this.isScript || this.isStylesheet;
    };
    ;
    ECI.typeIndicatorMouseOver = function () {
        var _this = this;
        if (!this.shadow) {
            var time_1 = Date.now();
            this.lastTypeSwitchMouseover = time_1;
            this.async(function () {
                if (_this.lastTypeSwitchMouseover === time_1) {
                    _this.lastTypeSwitchMouseover = null;
                    _this.animationEl = _this.animationEl || _this.$$('type-switcher').$$('.TSContainer');
                    (_this.typeIndicatorAnimation && _this.typeIndicatorAnimation.play()) || (_this.typeIndicatorAnimation = _this.animationEl.animate([
                        {
                            marginLeft: '-193px'
                        }, {
                            marginLeft: 0
                        }
                    ], {
                        duration: 300,
                        fill: 'both',
                        easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                    }));
                }
            }, 25);
        }
    };
    ;
    ECI.animateOut = function () {
        this.typeIndicatorAnimation && this.typeIndicatorAnimation.reverse();
    };
    ;
    ECI.typeIndicatorMouseLeave = function () {
        var _this = this;
        this.lastTypeSwitchMouseover = null;
        if (!this.shadow) {
            var typeSwitcher_1 = this.$.typeSwitcher;
            if (typeSwitcher_1.toggledOpen) {
                typeSwitcher_1.closeTypeSwitchContainer(true, function () {
                    typeSwitcher_1.toggledOpen = false;
                    typeSwitcher_1.$.typeSwitchChoicesContainer.style.display = 'none';
                    typeSwitcher_1.$.typeSwitchArrow.style.transform = 'rotate(180deg)';
                    _this.animateOut();
                });
            }
            else {
                this.animateOut();
            }
        }
    };
    ;
    ECI._getOnSelectFunction = function (_this, index) {
        return function () {
            window.app.editCRM.getCRMElementFromPath(_this.item.children[index].path).onSelect(true);
        };
    };
    ;
    ECI.onSelect = function (selectCheckbox, dontSelectChildren) {
        if (selectCheckbox === void 0) { selectCheckbox = false; }
        if (dontSelectChildren === void 0) { dontSelectChildren = false; }
        this.classList.add('highlighted');
        selectCheckbox && (this.$.checkbox.checked = true);
        if (this.item.children && !dontSelectChildren) {
            for (var i = 0; i < this.item.children.length; i++) {
                setTimeout(this._getOnSelectFunction(this, i), (i * 35));
                window.app.editCRM.selectedElements.push(this.item.children[i].id);
            }
        }
    };
    ;
    ECI._getOnDeselectFunction = function (_this, index) {
        return function () {
            window.app.editCRM.getCRMElementFromPath(_this.item.children[index].path).onDeselect(true);
        };
    };
    ;
    ECI.onDeselect = function (selectCheckbox, dontSelectChildren) {
        if (selectCheckbox === void 0) { selectCheckbox = false; }
        if (dontSelectChildren === void 0) { dontSelectChildren = false; }
        this.classList.remove('highlighted');
        selectCheckbox && (this.$.checkbox.checked = false);
        if (this.item.children && !dontSelectChildren) {
            var selectedPaths = window.app.editCRM.selectedElements;
            for (var i = 0; i < this.item.children.length; i++) {
                setTimeout(this._getOnDeselectFunction(this, i), (i * 35));
                selectedPaths.splice(selectedPaths.indexOf(this.item.children[i].id), 1);
            }
        }
    };
    ;
    ECI.onToggle = function () {
        var _this = this;
        setTimeout(function () {
            if (_this.$.checkbox.checked) {
                _this.onSelect();
            }
            else {
                _this.onDeselect();
            }
        }, 0);
    };
    return ECI;
}());
ECI.is = 'edit-crm-item';
ECI.type = '';
ECI.isLink = false;
ECI.isScript = false;
ECI.isStylesheet = false;
ECI.isDivider = false;
ECI.properties = editCrmItemProperties;
ECI.animationEl = null;
ECI.typeIndicatorAnimation = null;
ECI.lastTypeSwitchMouseover = null;
Polymer(ECI);
