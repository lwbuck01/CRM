"use strict";
var installPageProperties = {
    fetchFailed: {
        type: Boolean,
        value: false,
        notify: true
    },
    fetchCompleted: {
        type: Boolean,
        value: false,
        notify: true
    },
    fetchedData: {
        type: String,
        value: '',
        notify: true
    },
    userscriptUrlCalculated: {
        type: Boolean,
        notify: false,
        value: false
    },
    userscriptUrl: {
        type: String,
        computed: 'getUserscriptUrl(userscriptUrlCalculated)'
    },
    isLoading: {
        type: Boolean,
        value: false,
        notify: true,
        computed: 'isPageLoading(fetchFailed, fetchCompleted)'
    }
};
var IP = (function () {
    function IP() {
    }
    IP.isPageLoading = function (fetchFailed, fetchCompleted) {
        return !fetchFailed && !fetchCompleted;
    };
    ;
    IP.getInstallSource = function () {
        var searchParams = this.getSearchParams(location.href);
        return searchParams['s'];
    };
    IP.getSearchParams = function (url) {
        var queryString = url.split('?').slice(1).join('?');
        var searchParamsArr = queryString.split('&').map(function (keyVal) {
            var split = keyVal.split('=');
            return {
                key: split[0],
                val: decodeURIComponent(split[1])
            };
        });
        var searchParams = {};
        for (var i = 0; i < searchParamsArr.length; i++) {
            searchParams[searchParamsArr[i].key] = searchParamsArr[i].val;
        }
        return searchParams;
    };
    IP.getUserscriptUrl = function () {
        this.userscriptUrlCalculated = true;
        var searchParams = this.getSearchParams(location.href);
        return searchParams['i'];
    };
    ;
    IP.displayFetchedUserscript = function (script) {
        this.fetchCompleted = true;
        this.fetchedData = script;
    };
    ;
    IP.notifyFetchError = function () {
        this.fetchFailed = true;
    };
    ;
    IP.fetchUserscript = function (url) {
        var _this = this;
        $.ajax({
            url: url + '?noInstall',
            dataType: 'text'
        }).done(function (script) {
            _this.displayFetchedUserscript(script);
        }).fail(function () {
            _this.notifyFetchError();
        });
    };
    ;
    IP.ready = function () {
        this.userscriptUrl = this.getUserscriptUrl();
        this.$.title.innerHTML = 'Installing userscript from ' + this.userscriptUrl;
        this.fetchUserscript(this.userscriptUrl);
        window.installPage = this;
    };
    return IP;
}());
IP.is = 'install-page';
IP.properties = installPageProperties;
Polymer(IP);
