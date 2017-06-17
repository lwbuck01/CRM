"use strict";
var errorReportingTool = {
    reportType: 'bug',
    image: '',
    hide: {
        type: Boolean,
        value: true,
        notify: true
    }
};
var ERT = (function () {
    function ERT() {
    }
    ERT.toggleVisibility = function () {
        this.hide = !this.hide;
    };
    ;
    ERT.isBugType = function (reportType) {
        return reportType === 'bug';
    };
    ;
    ERT.isEmptyImage = function (img) {
        return img === '';
    };
    ;
    ERT.scaleScreenshot = function (canvas, newImg, callback) {
        this.image = canvas.toDataURL();
        var maxViewportHeight = window.innerHeight - 450;
        if (maxViewportHeight > 750) {
            maxViewportHeight = 750;
        }
        if ((750 / newImg.width) * newImg.height > maxViewportHeight) {
            $('.captureCont').css('width', ((maxViewportHeight / newImg.height) * newImg.width));
        }
        callback && callback();
    };
    ;
    ERT.cropScreenshot = function (dataURI, cropData, callback) {
        var _this = this;
        var img = new Image();
        var canvas = _this.$.cropCanvas;
        var context = canvas.getContext('2d');
        img.onload = function () {
            context.clearRect(0, 0, canvas.width, canvas.height);
            canvas.setAttribute('height', cropData.height + '');
            canvas.setAttribute('width', cropData.width + '');
            canvas.style.display = 'none';
            _this.appendChild(canvas);
            context.drawImage(img, cropData.left, cropData.top, cropData.width, cropData.height, 0, 0, cropData.width, cropData.height);
            var base64 = canvas.toDataURL();
            var newImg = new Image();
            newImg.onload = function () {
                _this.scaleScreenshot(canvas, newImg, callback);
            };
            newImg.src = base64;
            var imgTag = document.createElement('img');
            imgTag.src = base64;
            document.body.appendChild(imgTag);
        };
        img.src = dataURI;
        var imgTag2 = document.createElement('img');
        imgTag2.src = dataURI;
        document.body.appendChild(imgTag2);
    };
    ;
    ERT.screenshot = function (cropData, callback) {
        var _this = this;
        this.$.overlay.style.display = 'none';
        chrome.tabs.captureVisibleTab({
            format: 'png'
        }, function (dataURI) {
            _this.$.overlay.style.display = 'block';
            _this.cropScreenshot(dataURI, cropData, callback);
        });
    };
    ;
    ERT.px = function (num) {
        return num + 'px';
    };
    ;
    ERT.translateX = function (el, x) {
        el.xPos = x;
        el.style.transform = 'translate(' + x + ',' + (el.yPos || '0px') + ')';
    };
    ;
    ERT.translateY = function (el, y) {
        el.yPos = y;
        el.style.transform = 'translate(' + (el.xPos || '0px') + ',' + y + ')';
    };
    ;
    ERT.getDivs = function (direction) {
        var x = [this.$.highlightingLeftSquare, this.$.highlightingRightSquare];
        var y = [this.$.highlightingTopSquare, this.$.highlightingBotSquare];
        switch (direction) {
            case 'x':
                return x;
            case 'y':
                return y;
            case 'xy':
                return x.concat(y);
        }
    };
    ERT.setDivsXValues = function (left, marginLeftPx, rightDivTranslate) {
        var _a = this.getDivs('x'), leftDiv = _a[0], rightDiv = _a[1];
        leftDiv.style.width = left;
        rightDiv.style.width = 'calc(100vw - (' + marginLeftPx + '))';
        this.translateX(rightDiv, rightDivTranslate);
    };
    ERT.setSelectionX = function (startX, width, posX) {
        if (this.lastPos.X !== posX) {
            if (width < 0) {
                var left = startX + width;
                this.setDivsXValues(this.px(left), this.px(startX), this.px(left - width));
            }
            else {
                var marginLeftPx = this.px(startX + width);
                this.setDivsXValues(this.px(startX), marginLeftPx, marginLeftPx);
            }
        }
    };
    ERT.setDivsYValues = function (_a) {
        var topHeight = _a.topHeight, botTranslate = _a.botTranslate, heights = _a.heights, botHeight = _a.botHeight, divsOffsetY = _a.divsOffsetY;
        var _b = this.getDivs('xy'), leftDiv = _b[0], rightDiv = _b[1], topDiv = _b[2], botDiv = _b[3];
        topDiv.style.height = topHeight;
        leftDiv.style.height = rightDiv.style.height = heights + 'px';
        botDiv.style.height = 'calc(100vh - (' + botHeight + '))';
        this.translateY(botDiv, botTranslate);
        this.translateY(leftDiv, divsOffsetY);
        this.translateY(rightDiv, divsOffsetY);
    };
    ERT.setSelectionY = function (startY, height, posY) {
        if (this.lastPos.Y !== posY) {
            if (height < 0) {
                var top_1 = this.px(startY + height);
                this.setDivsYValues({
                    topHeight: top_1,
                    botTranslate: this.px(startY),
                    heights: this.px(-height),
                    botHeight: this.px(startY),
                    divsOffsetY: top_1
                });
            }
            else {
                var marginTopPx = (startY + height) + 'px';
                this.setDivsYValues({
                    topHeight: this.px(startY),
                    botTranslate: marginTopPx,
                    heights: this.px(height),
                    botHeight: marginTopPx,
                    divsOffsetY: this.px(startY)
                });
            }
        }
    };
    ERT.handleSelection = function (e) {
        switch (e.detail.state) {
            case 'start':
                this.$.highlightButtons.classList.add('hidden');
                var startYPx = e.detail.y + 'px';
                this.lastSize.X = this.lastSize.Y = 0;
                this.dragStart.X = this.lastPos.X = e.detail.x;
                this.dragStart.Y = this.lastPos.Y = e.detail.y;
                this.$.highlightingTopSquare.style.width = '100vw';
                this.$.highlightingTopSquare.style.height = startYPx;
                this.$.highlightingLeftSquare.style.width = startYPx;
                this.translateY(this.$.highlightingBotSquare, startYPx);
                this.translateY(this.$.highlightingLeftSquare, startYPx);
                this.translateY(this.$.highlightingRightSquare, startYPx);
                break;
            case 'end':
                this.$.highlightButtons.classList.remove('hidden');
                break;
            case 'track':
                if (e.detail.x !== this.lastPos.X || e.detail.y !== this.lastPos.Y) {
                    var width = (e.detail.x - this.dragStart.X);
                    var height = (e.detail.y - this.dragStart.Y);
                    this.setSelectionX(this.dragStart.X, width, e.detail.x);
                    this.setSelectionY(this.dragStart.Y, height, e.detail.y);
                    this.lastSize.X = width;
                    this.lastSize.Y = height;
                    this.lastPos.X = e.detail.x;
                    this.lastPos.Y = e.detail.y;
                }
                break;
        }
    };
    ;
    ERT.resetSelection = function () {
        this.setSelectionX(0, 0, 0);
        this.setSelectionY(0, 0, 0);
    };
    ERT.toggleScreenCapArea = function (visible) {
        this.$.highlightingTopSquare.style.height = '100vh';
        this.$.highlightingTopSquare.style.width = '100vw';
        this.resetSelection();
        this.$.overlay.classList[visible ? 'add' : 'remove']('toggled');
        this.$.overlay.style.pointerEvents = visible ? 'initial' : 'none';
    };
    ERT.cancelScreencap = function () {
        this.toggleScreenCapArea(false);
        this.$.errorReportingDialog.open();
    };
    ;
    ERT.finishScreencap = function () {
        var _this = this;
        this.toggleScreenCapArea(false);
        this.screenshot({
            top: this.dragStart.Y,
            left: this.dragStart.X,
            height: this.lastSize.Y,
            width: this.lastSize.X
        }, function () {
            _this.$.errorReportingDialog.open();
        });
    };
    ;
    ERT.addCapture = function () {
        var _this = this;
        _this.$.errorReportingDialog.close();
        this.toggleScreenCapArea(true);
    };
    ;
    ERT.reportBug = function () {
        this.reportType = 'bug';
        this.image = '';
        this.$.errorReportingDialog.open();
    };
    ;
    ERT.getStorages = function (callback) {
        chrome.storage.local.get(function (local) {
            chrome.storage.sync.get(function (sync) {
                callback(local, sync);
            });
        });
    };
    ERT.downloadFiles = function (callback) {
        var _this = this;
        chrome.downloads.download({
            url: this.image,
            filename: 'screencap.png'
        }, function () {
            if (_this.reportType === 'bug') {
                _this.getStorages(function (localKeys, syncKeys) {
                    var dataCont = {
                        local: localKeys,
                        sync: syncKeys,
                        lastError: _this.lastError
                    };
                    chrome.downloads.download({
                        url: 'data:text/plain;base64,' + window.btoa(JSON.stringify(dataCont)),
                        filename: 'settings.txt'
                    }, callback);
                });
            }
            else {
                callback();
            }
        });
    };
    ;
    ERT.hideCheckmark = function () {
        var _this = this;
        this.$.bugCheckmarkCont.classList.remove('checkmark');
        this.async(function () {
            _this.$.reportingButtonElevation.classList.remove('checkmark');
            _this.$.bugButton.classList.remove('checkmark');
            _this.$.bugCheckmark.classList.remove('checked');
        }, 350);
    };
    ERT.checkCheckmark = function () {
        var _this = this;
        this.$.bugButton.classList.add('checkmark');
        this.async(function () {
            _this.$.reportingButtonElevation.classList.add('checkmark');
            _this.$.bugCheckmarkCont.classList.add('checkmark');
            _this.async(function () {
                _this.$.bugCheckmark.classList.add('checked');
                _this.async(_this.hideCheckmark, 5000);
            }, 350);
        }, 350);
    };
    ;
    ERT.getDownloadPermission = function (callback) {
        var _this = this;
        chrome.permissions.request({
            permissions: [
                'downloads'
            ]
        }, function (granted) {
            if (granted) {
                callback();
                window.errorReportingTool.$.errorReportingDialog.close();
                var listener_1 = function () {
                    _this.checkCheckmark();
                    window.removeEventListener('focus', listener_1);
                };
                window.addEventListener('focus', listener_1);
            }
            else {
                window.doc.acceptDownloadToast.show();
            }
        });
    };
    ;
    ERT.submitErrorReport = function () {
        var _this = this;
        this.getDownloadPermission(function () {
            _this.downloadFiles(function () {
                var messageBody = 'WRITE MESSAGE HERE\n';
                var title = (_this.reportType === 'bug' ? 'Bug: ' : 'Feature: ') + 'TITLE HERE';
                window.open('https://github.com/SanderRonde/CustomRightClickMenu/issues/new?title=' + title + '&body=' + messageBody, '_blank');
            });
        });
    };
    ;
    ERT.onError = function (message, source, lineno, colno, error) {
        this.lastError = {
            message: message,
            source: source,
            lineno: lineno,
            colno: colno,
            error: error
        };
    };
    ;
    ERT.ready = function () {
        window.errorReportingTool = this;
        window.onerror = this.onError;
    };
    return ERT;
}());
ERT.is = 'error-reporting-tool';
ERT.properties = errorReportingTool;
Polymer(ERT);
