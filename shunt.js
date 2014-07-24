/*global jQuery, XDomainRequest*/
//Internet Explorer 8,9 XDR shunt
if (window.XDomainRequest) {
    jQuery.ajaxTransport(function (s) {
        if (s.crossDomain && s.async) {
            if (s.timeout) {
                s.xdrTimeout = s.timeout;
                delete s.timeout;
            }
            var xdr;
            return {
                send: function (_, complete) {
                    function callback(status, statusText, responses, responseHeaders) {
                        xdr.onload = xdr.onerror = xdr.ontimeout = jQuery.noop;
                        xdr = undefined;
                        complete(status, statusText, responses, responseHeaders);
                    }
                    xdr = new XDomainRequest();
                    xdr.onload = function () {
                        callback(200, "OK", { text: xdr.responseText }, "Content-Type: " + xdr.contentType);
                    };
                    xdr.onerror = function () {
                        callback(404, "Not Found");
                    };
                    xdr.onprogress = jQuery.noop;
                    xdr.ontimeout = function () {
                        callback(0, "timeout");
                    };
                    xdr.timeout = s.xdrTimeout || Number.MAX_VALUE;
                    xdr.open(s.type, s.url);
                    setTimeout(function () {
                        xdr.send((s.hasContent && s.data) || null);
                    }, 100);
                },
                abort: function () {
                    if (xdr) {
                        xdr.onerror = jQuery.noop;
                        xdr.abort();
                    }
                }
            };
        }
    });
}