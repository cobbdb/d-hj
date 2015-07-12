(function() {
    Cocoon = window.Cocoon ? window.Cocoon : {};
    Cocoon.version = "3.0.5";
    Cocoon.nativeAvailable = !!window.ext;
    Cocoon.extend = function(subc, superc) {
        var subcp = subc.prototype;
        var CocoonJSExtendHierarchyChainClass = function() {};
        CocoonJSExtendHierarchyChainClass.prototype = superc.prototype;
        subc.prototype = new CocoonJSExtendHierarchyChainClass();
        subc.superclass = superc.prototype;
        subc.prototype.constructor = subc;
        if (superc.prototype.constructor === Object.prototype.constructor) {
            superc.prototype.constructor = superc;
        }
        for (var method in subcp) {
            if (subcp.hasOwnProperty(method)) {
                subc.prototype[method] = subcp[method];
            }
        }
    };
    Cocoon.clone = function(obj, copy) {
        if (null == obj || "object" != typeof obj) return obj;
        var arr = [];
        for (var attr in obj) {
            if (copy.hasOwnProperty(attr)) {
                arr.push(copy[attr]);
            } else {
                arr.push(obj[attr]);
            }
        }
        return arr;
    };
    Cocoon.callNative = function(nativeExtensionObjectName, nativeFunctionName, args, async) {
        if (Cocoon.nativeAvailable) {
            var argumentsArray = Array.prototype.slice.call(args);
            argumentsArray.unshift(nativeFunctionName);
            var nativeExtensionObject = ext[nativeExtensionObjectName];
            var makeCallFunction = async ? nativeExtensionObject.makeCallAsync : nativeExtensionObject.makeCall;
            var ret = makeCallFunction.apply(nativeExtensionObject, argumentsArray);
            var finalRet = ret;
            if (typeof ret === "string") {
                try {
                    finalRet = JSON.parse(ret);
                } catch (error) {
                    console.log(error);
                }
            }
            return finalRet;
        }
    };
    Cocoon.getObjectFromPath = function(baseObject, objectPath) {
        var parts = objectPath.split(".");
        var obj = baseObject;
        for (var i = 0, len = parts.length; i < len; ++i) {
            obj[parts[i]] = obj[parts[i]] || undefined;
            obj = obj[parts[i]];
        }
        return obj;
    };
    Cocoon.EventHandler = function(nativeExtensionObjectName, CocoonExtensionObjectName, nativeEventName, chainFunction) {
        this.listeners = [];
        this.listenersOnce = [];
        this.chainFunction = chainFunction;
        this.addEventListener = function(listener) {
            if (chainFunction) {
                var f = function() {
                    chainFunction.call(this, arguments.callee.sourceListener, Array.prototype.slice.call(arguments));
                };
                listener.CocoonEventHandlerChainFunction = f;
                f.sourceListener = listener;
                listener = f;
            }
            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject && CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].addEventListener(nativeEventName, listener);
            } else {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener < 0) {
                    this.listeners.push(listener);
                }
            }
        };
        this.addEventListenerOnce = function(listener) {
            if (chainFunction) {
                var f = function() {
                    chainFunction(arguments.callee.sourceListener, Array.prototype.slice.call(arguments));
                };
                f.sourceListener = listener;
                listener = f;
            }
            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].addEventListenerOnce(nativeEventName, listener);
            } else {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener < 0) {
                    this.listenersOnce.push(listener);
                }
            }
        };
        this.removeEventListener = function(listener) {
            if (chainFunction) {
                listener = listener.CocoonEventHandlerChainFunction;
                delete listener.CocoonEventHandlerChainFunction;
            }
            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].removeEventListener(nativeEventName, listener);
            } else {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener >= 0) {
                    this.listeners.splice(indexOfListener, 1);
                }
            }
        };
        this.removeEventListenerOnce = function(listener) {
            if (chainFunction) {
                listener = listener.CocoonEventHandlerChainFunction;
                delete listener.CocoonEventHandlerChainFunction;
            }
            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].removeEventListenerOnce(nativeEventName, listener);
            } else {
                var indexOfListener = this.listenersOnce.indexOf(listener);
                if (indexOfListener >= 0) {
                    this.listenersOnce.splice(indexOfListener, 1);
                }
            }
        };
        this.notifyEventListeners = function() {
            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject && CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].notifyEventListeners(nativeEventName);
            } else {
                var argumentsArray = Array.prototype.slice.call(arguments);
                var listeners = Array.prototype.slice.call(this.listeners);
                var listenersOnce = Array.prototype.slice.call(this.listenersOnce);
                var _this = this;
                setTimeout(function() {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i].apply(_this, argumentsArray);
                    }
                    for (var i = 0; i < listenersOnce.length; i++) {
                        listenersOnce[i].apply(_this, argumentsArray);
                    }
                }, 0);
                _this.listenersOnce = [];
            }
        };
        return this;
    };
    Cocoon.define = function(extName, ext) {
        var namespace = extName.substring(0, 7) == "Cocoon." ? extName.substr(7) : extName;
        var base = window.Cocoon;
        var parts = namespace.split(".");
        var object = base;
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            !object[part] ? console.log("Created namespace: " + extName) : console.log("Updated namespace: - " + extName);
            object = object[part] = i == parts.length - 1 ? ext(object[part] || {}) : {};
            if (!object) {
                throw "Unable to create class " + extName;
            }
        }
        return true;
    };
    console.log("Created namespace: Cocoon");
})();

Cocoon.define("Cocoon.Signal", function(extension) {
    "use strict";
    extension.createSignal = function() {
        this.handle = null;
        this.signals = {};
        this.register = function(namespace, handle) {
            if (!namespace && !handle) throw new Error("Can't create signal " + (namespace || ""));
            if (handle.addEventListener) {
                this.signals[namespace] = handle;
                return true;
            }
            if (!handle.addEventListener) {
                this.signals[namespace] = {};
                for (var prop in handle) {
                    if (handle.hasOwnProperty(prop)) {
                        this.signals[namespace][prop] = handle[prop];
                    }
                }
                return true;
            }
            throw new Error("Can't create handler for " + namespace + " signal.");
            return false;
        }, this.expose = function() {
            return function(signal, callback, params) {
                var once = false;
                if (arguments.length === 1) {
                    var that = this;
                    var fnc = function(signal) {
                        this.signal = signal;
                    };
                    fnc.prototype.remove = function(functionListener) {
                        var handle = that.signals[this.signal];
                        if (handle && handle.removeEventListener) {
                            handle.removeEventListener.apply(that, [ functionListener ]);
                            that.signals[this.signal] = undefined;
                        }
                    };
                    return new fnc(signal);
                }
                if (params && params.once) {
                    once = true;
                }
                if (!this.signals[signal]) throw new Error("The signal " + signal + " does not exists.");
                var handle = this.signals[signal];
                if (handle.addEventListener) {
                    if (once) {
                        handle.addEventListenerOnce(function() {
                            callback.apply(this || window, arguments);
                        });
                    } else {
                        handle.addEventListener(function() {
                            callback.apply(this || window, arguments);
                        });
                    }
                }
                if (!this.signals[signal].addEventListener) {
                    for (var prop in this.signals[signal]) {
                        if (!this.signals[signal].hasOwnProperty(prop)) continue;
                        var handle = this.signals[signal][prop];
                        if (once) {
                            handle.addEventListenerOnce(function() {
                                this.clbk[this.name].apply(this || window, arguments);
                            }.bind({
                                name: prop,
                                clbk: callback
                            }));
                        } else {
                            handle.addEventListener(function() {
                                this.clbk[this.name].apply(this || window, arguments);
                            }.bind({
                                name: prop,
                                clbk: callback
                            }));
                        }
                    }
                }
            }.bind(this);
        };
    };
    return extension;
});

Cocoon.define("Cocoon.App", function(extension) {
    extension.nativeAvailable = !!window.ext && !!window.ext.IDTK_APP;
    extension.isBridgeAvailable = function() {
        if (Cocoon.App.forward.nativeAvailable === "boolean") {
            return Cocoon.App.forward.nativeAvailable;
        } else {
            var available = Cocoon.callNative("IDTK_APP", "forwardAvailable", arguments);
            available = !!available;
            Cocoon.App.forward.nativeAvailable = available;
            return available;
        }
    };
    extension.forward = function(javaScriptCode) {
        if (Cocoon.App.nativeAvailable && Cocoon.App.isBridgeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "forward", arguments);
        } else if (!navigator.isCocoonJS) {
            if (window.name == "CocoonJS_App_ForCocoonJS_WebViewIFrame") {
                return window.parent.eval(javaScriptCode);
            } else {
                return window.frames["CocoonJS_App_ForCocoonJS_WebViewIFrame"].window.eval(javaScriptCode);
            }
        }
    };
    extension.forwardAsync = function(javaScriptCode, returnCallback) {
        if (Cocoon.App.nativeAvailable && Cocoon.App.isBridgeAvailable()) {
            if (typeof returnCallback !== "undefined") {
                return ext.IDTK_APP.makeCallAsync("forward", javaScriptCode, returnCallback);
            } else {
                return ext.IDTK_APP.makeCallAsync("forward", javaScriptCode);
            }
        } else {
            setTimeout(function() {
                var res;
                window.name == "CocoonJS_App_ForCocoonJS_WebViewIFrame" ? (res = window.parent.eval(javaScriptCode), 
                typeof returnCallback === "function" && returnCallback(res)) : (res = window.parent.frames["CocoonJS_App_ForCocoonJS_WebViewIFrame"].window.eval(javaScriptCode), 
                typeof returnCallback === "function" && returnCallback(res));
            }, 1);
        }
    };
    extension.load = function(path, storageType) {
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "loadPath", arguments);
        } else if (!navigator.isCocoonJS) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(event) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var jsCode;
                        if (!Cocoon.App.EmulatedWebViewIFrame) {
                            jsCode = "window.Cocoon && window.Cocoon.App.onLoadInTheWebViewSucceed.notifyEventListeners('" + path + "');";
                        } else {
                            jsCode = "window.Cocoon && window.Cocoon.App.onLoadInCocoonJSSucceed.notifyEventListeners('" + path + "');";
                        }
                        Cocoon.App.forwardAsync(jsCode);
                        window.location.href = path;
                    } else if (xhr.status === 404) {
                        this.onreadystatechange = null;
                        var jsCode;
                        if (!Cocoon.App.EmulatedWebViewIFrame) {
                            jsCode = "Cocoon && Cocoon.App.onLoadInTheWebViewFailed.notifyEventListeners('" + path + "');";
                        } else {
                            jsCode = "Cocoon && Cocoon.App.onLoadInCocoonJSFailed.notifyEventListeners('" + path + "');";
                        }
                        Cocoon.App.forwardAsync(jsCode);
                    }
                }
            };
            xhr.open("GET", path, true);
            xhr.send();
        }
    };
    extension.reload = function() {
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "reload", arguments);
        } else if (!navigator.isCocoonJS) {
            if (window.name == "CocoonJS_App_ForCocoonJS_WebViewIFrame") {
                return window.parent.location.reload();
            } else {
                return window.parent.frames["CocoonJS_App_ForCocoonJS_WebViewIFrame"].window.location.reload();
            }
        }
    };
    extension.openURL = function(url) {
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "openURL", arguments, true);
        } else if (!navigator.isCocoonJS) {
            window.open(url, "_blank");
        }
    };
    extension.exit = function() {
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "forceToFinish", arguments);
        } else if (!navigator.isCocoonJS) {
            window.close();
        }
    };
    extension.StorageType = {
        APP_STORAGE: "APP_STORAGE",
        INTERNAL_STORAGE: "INTERNAL_STORAGE",
        EXTERNAL_STORAGE: "EXTERNAL_STORAGE",
        TEMPORARY_STORAGE: "TEMPORARY_STORAGE"
    };
    extension.onSuspended = new Cocoon.EventHandler("IDTK_APP", "App", "onsuspended");
    extension.onActivated = new Cocoon.EventHandler("IDTK_APP", "App", "onactivated");
    extension.onSuspending = new Cocoon.EventHandler("IDTK_APP", "App", "onsuspending");
    extension.onMemoryWarning = new Cocoon.EventHandler("IDTK_APP", "App", "onmemorywarning");
    var signal = new Cocoon.Signal.createSignal();
    signal.register("suspended", extension.onSuspended);
    signal.register("activated", extension.onActivated);
    signal.register("suspending", extension.onSuspending);
    signal.register("memorywarning", extension.onMemoryWarning);
    extension.on = signal.expose();
    return extension;
});

Cocoon.define("Cocoon.App", function(extension) {
    function checkEmulatedWebViewReady() {
        var emulatedWB = Cocoon.App.EmulatedWebView;
        if (emulatedWB) {
            return;
        }
        emulatedWB = document.createElement("div");
        emulatedWB.setAttribute("id", "CocoonJS_App_ForCocoonJS_WebViewDiv");
        emulatedWB.style.width = 0;
        emulatedWB.style.height = 0;
        emulatedWB.style.position = "absolute";
        emulatedWB.style.left = 0;
        emulatedWB.style.top = 0;
        emulatedWB.style.backgroundColor = "transparent";
        emulatedWB.style.border = "0px solid #000";
        var frame = document.createElement("IFRAME");
        frame.setAttribute("id", "CocoonJS_App_ForCocoonJS_WebViewIFrame");
        frame.setAttribute("name", "CocoonJS_App_ForCocoonJS_WebViewIFrame");
        frame.style.width = 0;
        frame.style.height = 0;
        frame.frameBorder = 0;
        frame.allowtransparency = true;
        emulatedWB.appendChild(frame);
        Cocoon.App.EmulatedWebView = emulatedWB;
        Cocoon.App.EmulatedWebViewIFrame = frame;
        if (!document.body) {
            document.body = document.createElement("body");
        }
        document.body.appendChild(Cocoon.App.EmulatedWebView);
    }
    extension.pause = function() {
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "pause", arguments);
        }
    };
    extension.resume = function() {
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "resume", arguments);
        }
    };
    extension.loadInTheWebView = function(path, storageType) {
        if (navigator.isCocoonJS && Cocoon.App.nativeAvailable) {
            Cocoon.callNative("IDTK_APP", "loadInTheWebView", arguments);
        } else {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(event) {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status <= 299 || xhr.status === 0) {
                        checkEmulatedWebViewReady();
                        var callback = function(event) {
                            Cocoon.App.onLoadInTheWebViewSucceed.notifyEventListeners(path);
                            Cocoon.App.EmulatedWebViewIFrame.removeEventListener("load", callback);
                        };
                        Cocoon.App.EmulatedWebViewIFrame.addEventListener("load", callback);
                        Cocoon.App.EmulatedWebViewIFrame.contentWindow.location.href = path;
                    } else {
                        this.onreadystatechange = null;
                        Cocoon.App.onLoadInTheWebViewFailed.notifyEventListeners(path);
                    }
                }
            };
            xhr.open("GET", path, true);
            xhr.send();
        }
    };
    extension.reloadWebView = function() {
        if (Cocoon.App.nativeAvailable && navigator.isCocoonJS) {
            Cocoon.callNative("IDTK_APP", "reloadWebView", arguments);
        } else {
            checkEmulatedWebViewReady();
            Cocoon.App.EmulatedWebViewIFrame.contentWindow.location.reload();
        }
    };
    extension.showTheWebView = function(x, y, width, height) {
        if (Cocoon.App.nativeAvailable && navigator.isCocoonJS) {
            Cocoon.callNative("IDTK_APP", "showTheWebView", arguments);
        } else {
            checkEmulatedWebViewReady();
            Cocoon.App.EmulatedWebViewIFrame.style.width = (width ? width / window.devicePixelRatio : window.innerWidth) + "px";
            Cocoon.App.EmulatedWebViewIFrame.style.height = (height ? height / window.devicePixelRatio : window.innerHeight) + "px";
            Cocoon.App.EmulatedWebView.style.left = (x ? x : 0) + "px";
            Cocoon.App.EmulatedWebView.style.top = (y ? y : 0) + "px";
            Cocoon.App.EmulatedWebView.style.width = (width ? width / window.devicePixelRatio : window.innerWidth) + "px";
            Cocoon.App.EmulatedWebView.style.height = (height ? height / window.devicePixelRatio : window.innerHeight) + "px";
            Cocoon.App.EmulatedWebView.style.display = "block";
        }
    };
    extension.hideTheWebView = function() {
        if (Cocoon.App.nativeAvailable && navigator.isCocoonJS) {
            var javaScriptCodeToForward = "ext.IDTK_APP.makeCall('hide');";
            return Cocoon.App.forwardAsync(javaScriptCodeToForward);
        } else {
            checkEmulatedWebViewReady();
            Cocoon.App.EmulatedWebView.style.display = "none";
        }
    };
    extension.exitCallback = function(appShouldFinishCallback) {
        if (navigator.isCocoonJS && Cocoon.App.nativeAvailable) {
            window.onidtkappfinish = appShouldFinishCallback;
        }
    };
    extension.forwardedEventFromTheWebView = function(eventName, eventDataString) {
        var eventData = JSON.parse(eventDataString);
        eventData.target = window;
        var event = new Event(eventName);
        for (var att in eventData) {
            event[att] = eventData[att];
        }
        event.target = window;
        window.dispatchEvent(event);
        var canvases = document.getElementsByTagName("canvas");
        for (var i = 0; i < canvases.length; i++) {
            event.target = canvases[i];
            canvases[i].dispatchEvent(event);
        }
    };
    extension.onLoadInTheWebViewSucceed = new Cocoon.EventHandler("IDTK_APP", "App", "forwardpageload");
    extension.onLoadInTheWebViewFailed = new Cocoon.EventHandler("IDTK_APP", "App", "forwardpagefail");
    var signal = new Cocoon.Signal.createSignal();
    signal.register("load", {
        success: extension.onLoadInTheWebViewSucceed,
        error: extension.onLoadInTheWebViewFailed
    });
    extension.WebView = Cocoon.WebView || {};
    extension.WebView.on = signal.expose();
    return extension;
});

Cocoon.define("Cocoon.Utils", function(extension) {
    "use strict";
    extension.logMemoryInfo = function() {
        if (Cocoon.nativeAvailable && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_APP", "logMemoryInfo", arguments);
        }
    };
    extension.textureReduction = function(sizeThreshold, applyTo, forbidFor) {
        if (Cocoon.nativeAvailable && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_APP", "setDefaultTextureReducerThreshold", arguments);
        }
    };
    extension.markAsMusic = function(audioFilePath) {
        if (Cocoon.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "addForceMusic", arguments);
        }
    };
    extension.captureScreen = function(fileName, storageType, captureType, saveToGallery) {
        if (Cocoon.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "captureScreen", arguments);
        }
    };
    extension.captureScreenAsync = function(fileName, storageType, captureType, saveToGallery, callback) {
        if (Cocoon.nativeAvailable) {
            Cocoon.callNative("IDTK_APP", "captureScreen", arguments, true);
        }
    };
    extension.setAntialias = function(enable) {
        if (Cocoon.nativeAvailable && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_APP", "setDefaultAntialias", arguments);
        }
    };
    extension.setWebGLEnabled = function(enabled) {
        if (Cocoon.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "setDefaultAntialias", arguments);
        }
    };
    extension.setNPOTEnabled = function(enabled) {
        if (Cocoon.nativeAvailable && navigator.isCocoonJS) {
            return window.ext.IDTK_APP.makeCall("setNPOTEnabled", enabled);
        }
    };
    extension.setMaxMemory = function(memoryInMBs) {
        if (Cocoon.nativeAvailable && navigator.isCocoonJS) {
            return window.ext.IDTK_APP.makeCall("setMaxMemory", memoryInMBs);
        }
    };
    extension.CaptureType = {
        EVERYTHING: 0,
        COCOONJS_GL_SURFACE: 1,
        JUST_SYSTEM_VIEWS: 2
    };
    extension.existsPath = function(path, storageType) {
        if (Cocoon.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "existsPath", arguments);
        }
        return false;
    };
    extension.setTextCacheSize = function(size) {
        if (Cocoon.nativeAvailable && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_APP", "setTextCacheSize", arguments);
        }
    };
    return extension;
});

Cocoon.define("Cocoon.Dialog", function(extension) {
    "use strict";
    extension.keyboardType = {
        TEXT: "text",
        NUMBER: "num",
        PHONE: "phone",
        EMAIL: "email",
        URL: "url"
    };
    extension.prompt = function(params, callbacks) {
        if (!callbacks) throw "Callback missing for Cocoon.Dialog.prompt();";
        var defaultKeyboard = Cocoon.Dialog.keyboardType.TEXT;
        switch (params.type) {
          case Cocoon.Dialog.keyboardType.TEXT:
            defaultKeyboard = Cocoon.Dialog.keyboardType.TEXT;
            break;

          case Cocoon.Dialog.keyboardType.NUMBER:
            defaultKeyboard = Cocoon.Dialog.keyboardType.NUMBER;
            break;

          case Cocoon.Dialog.keyboardType.PHONE:
            defaultKeyboard = Cocoon.Dialog.keyboardType.PHONE;
            break;

          case Cocoon.Dialog.keyboardType.EMAIL:
            defaultKeyboard = Cocoon.Dialog.keyboardType.EMAIL;
            break;

          case Cocoon.Dialog.keyboardType.URL:
            defaultKeyboard = Cocoon.Dialog.keyboardType.URL;
            break;
        }
        var properties = {
            title: "",
            message: "",
            text: "",
            type: defaultKeyboard,
            cancelText: "Cancel",
            confirmText: "Ok"
        };
        var args = Cocoon.clone(properties, params);
        var succedListener = function() {
            Cocoon.Dialog.onTextDialogCancelled.removeEventListener(errorListener);
            Cocoon.Dialog.onTextDialogFinished.removeEventListener(succedListener);
            callbacks.success.apply(window, Array.prototype.slice.call(arguments));
        };
        var errorListener = function() {
            Cocoon.Dialog.onTextDialogCancelled.removeEventListener(errorListener);
            Cocoon.Dialog.onTextDialogFinished.removeEventListener(succedListener);
            callbacks.cancel.apply(window, Array.prototype.slice.call(arguments));
        };
        Cocoon.Dialog.onTextDialogCancelled.addEventListener(errorListener);
        Cocoon.Dialog.onTextDialogFinished.addEventListener(succedListener);
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "showTextDialog", args, true);
        } else {
            setTimeout(function() {
                var result = prompt(properties.message, properties.text);
                var eventObject = result ? Cocoon.Dialog.onTextDialogFinished : Cocoon.Dialog.onTextDialogCancelled;
                eventObject.notifyEventListeners(result);
            }, 0);
        }
    };
    extension.confirm = function(params, callback) {
        if (!callback) throw "Callback missing for Cocoon.Dialog.confirm();";
        var properties = {
            title: "",
            message: "",
            cancelText: "Cancel",
            confirmText: "Ok"
        };
        var args = Cocoon.clone(properties, params);
        var succedListener = function() {
            Cocoon.Dialog.onMessageBoxDenied.removeEventListenerOnce(errorListener);
            callback(true);
        };
        var errorListener = function() {
            Cocoon.Dialog.onMessageBoxConfirmed.removeEventListenerOnce(succedListener);
            callback(false);
        };
        Cocoon.Dialog.onMessageBoxDenied.addEventListenerOnce(errorListener);
        Cocoon.Dialog.onMessageBoxConfirmed.addEventListenerOnce(succedListener);
        if (Cocoon.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "showMessageBox", args, true);
        } else {
            setTimeout(function() {
                var result = confirm(properties.message);
                var eventObject = result ? Cocoon.Dialog.onMessageBoxConfirmed : Cocoon.Dialog.onMessageBoxDenied;
                eventObject.notifyEventListeners();
            }, 0);
        }
    };
    extension.showKeyboard = function(params, callbacks) {
        params = params || {};
        params.type = params.type || Cocoon.Dialog.keyboardType.TEXT;
        var insertCallback = callbacks && callbacks.insertText;
        var deleteCallback = callbacks && callbacks.deleteBackward;
        var doneCallback = callbacks && callbacks.done;
        var cancelCallback = callbacks && callbacks.cancel;
        if (Cocoon.nativeAvailable) {
            Cocoon.callNative("IDTK_APP", "showKeyboard", [ params, insertCallback, deleteCallback, doneCallback, cancelCallback ], true);
        }
    };
    extension.dismissKeyboard = function() {
        if (Cocoon.nativeAvailable) {
            Cocoon.callNative("IDTK_APP", "dismissKeyboard", [], true);
        }
    };
    extension.onTextDialogFinished = new Cocoon.EventHandler("IDTK_APP", "App", "ontextdialogfinish");
    extension.onTextDialogCancelled = new Cocoon.EventHandler("IDTK_APP", "App", "ontextdialogcancel");
    extension.onMessageBoxConfirmed = new Cocoon.EventHandler("IDTK_APP", "App", "onmessageboxconfirmed");
    extension.onMessageBoxDenied = new Cocoon.EventHandler("IDTK_APP", "App", "onmessageboxdenied");
    return extension;
});

Cocoon.define("Cocoon.WebView", function(extension) {
    if (typeof Cocoon === "undefined" || Cocoon === null) return extension;
    if (typeof Cocoon.App === "undefined" || Cocoon.App === null) return extension;
    if (navigator.isCocoonJS) return extension;
    extension.show = function(x, y, width, height) {
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "show", arguments);
        } else {
            var div = window.parent.document.getElementById("CocoonJS_App_ForCocoonJS_WebViewDiv");
            div.style.left = (x ? x : div.style.left) + "px";
            div.style.top = (y ? y : div.style.top) + "px";
            div.style.width = (width ? width / window.devicePixelRatio : window.parent.innerWidth) + "px";
            div.style.height = (height ? height / window.devicePixelRatio : window.parent.innerHeight) + "px";
            div.style.display = "block";
            var iframe = window.parent.document.getElementById("CocoonJS_App_ForCocoonJS_WebViewIFrame");
            iframe.style.width = (width ? width / window.devicePixelRatio : window.parent.innerWidth) + "px";
            iframe.style.height = (height ? height / window.devicePixelRatio : window.parent.innerHeight) + "px";
        }
    };
    extension.hide = function() {
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "hide", arguments);
        } else {
            window.parent.document.getElementById("CocoonJS_App_ForCocoonJS_WebViewDiv").style.display = "none";
        }
    };
    extension.loadInCocoon = function(path, callbacks, storageType) {
        if (Cocoon.App.nativeAvailable) {
            var javaScriptCodeToForward = "ext.IDTK_APP.makeCall('loadPath'";
            if (typeof path !== "undefined") {
                javaScriptCodeToForward += ", '" + path + "'";
                if (typeof storageType !== "undefined") {
                    javaScriptCodeToForward += ", '" + storageType + "'";
                }
            }
            javaScriptCodeToForward += ");";
            return Cocoon.App.forwardAsync(javaScriptCodeToForward);
        } else {
            Cocoon.App.forwardAsync("Cocoon.App.load('" + path + "');");
        }
    };
    extension.reloadCocoonJS = function() {
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.App.forwardAsync("ext.IDTK_APP.makeCall('reload');");
        } else if (!navigator.isCocoonJS) {
            window.parent.location.reload();
        }
    };
    window.addEventListener("load", function() {
        if (!Cocoon.App.nativeAvailable && window.name == "CocoonJS_App_ForCocoonJS_WebViewIFrame") {
            Cocoon.App.forwardEventsToCocoonJSEnabled = false;
            var EVENT_ATTRIBUTES = [ "timeStamp", "button", "type", "x", "y", "pageX", "pageY", "clientX", "clientY", "offsetX", "offsetY" ];
            var EVENTS = [ "dblclick", "touchmove", "mousemove", "touchend", "touchcancel", "mouseup", "touchstart", "mousedown", "release", "dragleft", "dragright", "swipeleft", "swiperight" ];
            function forwardEventToCocoonJS(eventName, event) {
                var eventData = {};
                var att, i;
                for (var att in event) {
                    i = EVENT_ATTRIBUTES.indexOf(att);
                    if (i >= 0) {
                        eventData[att] = event[att];
                    }
                }
                var jsCode = "Cocoon && Cocoon.App && Cocoon.App.forwardedEventFromTheWebView && Cocoon.App.forwardedEventFromTheWebView(" + JSON.stringify(eventName) + ", '" + JSON.stringify(eventData) + "');";
                Cocoon.App.forward(jsCode);
            }
            for (i = 0; i < EVENTS.length; i++) {
                window.addEventListener(EVENTS[i], function(eventName) {
                    return function(event) {
                        if (Cocoon.App.forwardEventsToCocoonJSEnabled) {
                            forwardEventToCocoonJS(eventName, event);
                        }
                    };
                }(EVENTS[i]));
            }
        }
    });
    extension.onLoadInCocoonJSSucceed = new Cocoon.EventHandler("IDTK_APP", "App", "forwardpageload");
    extension.onLoadInCocoonJSFailed = new Cocoon.EventHandler("IDTK_APP", "App", "forwardpagefail");
    return extension;
});

Cocoon.define("Cocoon.Proxify", function(extension) {
    "use strict";
    extension.getKeyForValueInDictionary = function(dictionary, value) {
        var finalKey = null;
        for (var key in dictionary) {
            if (dictionary[key] === value) {
                finalKey = key;
                break;
            }
        }
        return finalKey;
    };
    extension.setupOriginProxyType = function(typeName, attributeNames, functionNames, eventHandlerNames) {
        if (Cocoon.nativeAvailable) {
            if (!typeName) throw "The given typeName must be valid.";
            if (!attributeNames && !functionNames && !eventHandlerNames) throw "There is no point on setting up a proxy for no attributes, functions nor eventHandlers.";
            attributeNames = attributeNames ? attributeNames : [];
            functionNames = functionNames ? functionNames : [];
            eventHandlerNames = eventHandlerNames ? eventHandlerNames : [];
            var parentObject = window;
            var jsCode = "Cocoon.Proxify.setupDestinationProxyType(" + JSON.stringify(typeName) + ", " + JSON.stringify(eventHandlerNames) + ");";
            Cocoon.App.forward(jsCode);
            var originalType = parentObject[typeName];
            parentObject[typeName] = function() {
                var _this = this;
                this._cocoonjs_proxy_object_data = {};
                var jsCode = "Cocoon.Proxify.newDestinationProxyObject(" + JSON.stringify(typeName) + ");";
                this._cocoonjs_proxy_object_data.id = Cocoon.App.forward(jsCode);
                this._cocoonjs_proxy_object_data.eventHandlers = {};
                this._cocoonjs_proxy_object_data.typeName = typeName;
                this._cocoonjs_proxy_object_data.eventListeners = {};
                parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[this._cocoonjs_proxy_object_data.id] = this;
                for (var i = 0; i < attributeNames.length; i++) {
                    (function(attributeName) {
                        _this.__defineSetter__(attributeName, function(value) {
                            var jsCode = "Cocoon.Proxify.setDestinationProxyObjectAttribute(" + JSON.stringify(typeName) + ", " + _this._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(attributeName) + ", " + JSON.stringify(value) + ");";
                            return Cocoon.App.forward(jsCode);
                        });
                        _this.__defineGetter__(attributeName, function() {
                            var jsCode = "Cocoon.Proxify.getDestinationProxyObjectAttribute(" + JSON.stringify(typeName) + ", " + _this._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(attributeName) + ");";
                            return Cocoon.App.forward(jsCode);
                        });
                    })(attributeNames[i]);
                }
                for (var i = 0; i < functionNames.length; i++) {
                    (function(functionName) {
                        _this[functionName] = function() {
                            var argumentsArray = Array.prototype.slice.call(arguments);
                            argumentsArray.unshift(functionName);
                            argumentsArray.unshift(this._cocoonjs_proxy_object_data.id);
                            argumentsArray.unshift(typeName);
                            var jsCode = "Cocoon.Proxify.callDestinationProxyObjectFunction(";
                            for (var i = 0; i < argumentsArray.length; i++) {
                                jsCode += (i !== 1 ? JSON.stringify(argumentsArray[i]) : argumentsArray[i]) + (i < argumentsArray.length - 1 ? ", " : "");
                            }
                            jsCode += ");";
                            var ret = Cocoon.App.forwardAsync(jsCode);
                            return ret;
                        };
                    })(functionNames[i]);
                }
                for (var i = 0; i < eventHandlerNames.length; i++) {
                    (function(eventHandlerName) {
                        _this.__defineSetter__(eventHandlerName, function(value) {
                            _this._cocoonjs_proxy_object_data.eventHandlers[eventHandlerName] = value;
                        });
                        _this.__defineGetter__(eventHandlerName, function() {
                            return _this._cocoonjs_proxy_object_data.eventHandlers[eventHandlerName];
                        });
                    })(eventHandlerNames[i]);
                }
                _this.addEventListener = function(eventTypeName, eventCallback) {
                    var addEventCallback = true;
                    var eventListeners = _this._cocoonjs_proxy_object_data.eventListeners[eventTypeName];
                    if (eventListeners) {
                        addEventCallback = eventListeners.indexOf(eventCallback) < 0;
                    } else {
                        eventListeners = [];
                        _this._cocoonjs_proxy_object_data.eventListeners[eventTypeName] = eventListeners;
                        var jsCode = "Cocoon.Proxify.addDestinationProxyObjectEventListener(" + JSON.stringify(_this._cocoonjs_proxy_object_data.typeName) + ", " + _this._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(eventTypeName) + ");";
                        Cocoon.App.forwardAsync(jsCode);
                    }
                    if (addEventCallback) {
                        eventListeners.push(eventCallback);
                    }
                };
                _this.removeEventListener = function(eventTypeName, eventCallback) {
                    var eventListeners = _this._cocoonjs_proxy_object_data.eventListeners[eventTypeName];
                    if (eventListeners) {
                        var eventCallbackIndex = eventListeners.indexOf(eventCallback);
                        if (eventCallbackIndex >= 0) {
                            eventListeners.splice(eventCallbackIndex, 1);
                        }
                    }
                };
                return this;
            };
            parentObject[typeName]._cocoonjs_proxy_type_data = {
                originalType: originalType,
                proxyObjects: []
            };
            parentObject[typeName]._cocoonjs_proxy_type_data.deleteProxyObject = function(object) {
                var proxyObjectKey = extension.getKeyForValueInDictionary(this.proxyObjects, object);
                if (proxyObjectKey) {
                    var jsCode = "Cocoon.Proxify.deleteDestinationProxyObject(" + JSON.stringify(typeName) + ", " + object._cocoonjs_proxy_object_data.id + ");";
                    Cocoon.App.forwardAsync(jsCode);
                    object._cocoonjs_proxy_object_data = null;
                    delete this.proxyObjects[proxyObjectKey];
                }
            };
            parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventHandler = function(id, eventHandlerName) {
                var object = this.proxyObjects[id];
                var eventHandler = object._cocoonjs_proxy_object_data.eventHandlers[eventHandlerName];
                if (eventHandler) {
                    eventHandler({
                        target: object
                    });
                }
            };
            parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventListeners = function(id, eventTypeName) {
                var object = this.proxyObjects[id];
                var eventListeners = object._cocoonjs_proxy_object_data.eventListeners[eventTypeName].slice();
                for (var i = 0; i < eventListeners.length; i++) {
                    eventListeners[i]({
                        target: object
                    });
                }
            };
        }
    };
    extension.takedownOriginProxyType = function(typeName) {
        if (Cocoon.App.nativeAvailable) {
            var parentObject = window;
            if (parentObject[typeName] && parentObject[typeName]._cocoonjs_proxy_type_data) {
                parentObject[typeName] = parentObject[typeName]._cocoonjs_proxy_type_data.originalType;
            }
        }
    };
    extension.deleteOriginProxyObject = function(object) {
        if (Cocoon.App.nativeAvailable) {
            var parentObject = window;
            if (object && object._cocoonjs_proxy_object_data) {
                parentObject[object._cocoonjs_proxy_object_data.typeName]._cocoonjs_proxy_type_data.deleteProxyObject(object);
            }
        }
    };
    extension.callOriginProxyObjectEventHandler = function(typeName, id, eventHandlerName) {
        if (Cocoon.App.nativeAvailable) {
            var parentObject = window;
            parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventHandler(id, eventHandlerName);
        }
    };
    extension.callOriginProxyObjectEventListeners = function(typeName, id, eventTypeName) {
        if (Cocoon.App.nativeAvailable) {
            var parentObject = window;
            parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventListeners(id, eventTypeName);
        }
    };
    extension.setupDestinationProxyType = function(typeName, eventHandlerNames) {
        if (Cocoon.App.nativeAvailable) {
            var parentObject = window;
            parentObject[typeName]._cocoonjs_proxy_type_data = {
                nextId: 0,
                proxyObjects: {},
                eventHandlerNames: eventHandlerNames
            };
        }
    };
    extension.takedownDestinationProxyType = function(typeName) {
        if (Cocoon.App.nativeAvailable) {
            var parentObject = window;
            if (parent[typeName] && parentObject[typeName]._cocoonjs_proxy_type_data) {
                delete parentObject[typeName]._cocoonjs_proxy_type_data;
            }
        }
    };
    extension.newDestinationProxyObject = function(typeName) {
        if (Cocoon.App.nativeAvailable) {
            var parentObject = window;
            var proxyObject = new parentObject[typeName]();
            proxyObject._cocoonjs_proxy_object_data = {};
            proxyObject._cocoonjs_proxy_object_data.typeName = typeName;
            var proxyObjectId = parentObject[typeName]._cocoonjs_proxy_type_data.nextId;
            parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[proxyObjectId] = proxyObject;
            proxyObject._cocoonjs_proxy_object_data.id = proxyObjectId;
            parentObject[typeName]._cocoonjs_proxy_type_data.nextId++;
            for (var i = 0; i < parentObject[typeName]._cocoonjs_proxy_type_data.eventHandlerNames.length; i++) {
                (function(eventHandlerName) {
                    proxyObject[eventHandlerName] = function(event) {
                        var proxyObject = this;
                        var jsCode = "Cocoon.App.callOriginProxyObjectEventHandler(" + JSON.stringify(proxyObject._cocoonjs_proxy_object_data.typeName) + ", " + proxyObject._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(eventHandlerName) + ");";
                        Cocoon.App.forwardAsync(jsCode);
                    };
                })(parentObject[typeName]._cocoonjs_proxy_type_data.eventHandlerNames[i]);
            }
            proxyObject._cocoonjs_proxy_object_data.eventListeners = {};
            return proxyObjectId;
        }
    };
    extension.callDestinationProxyObjectFunction = function(typeName, id, functionName) {
        if (Cocoon.App.nativeAvailable) {
            var parentObject = window;
            var argumentsArray = Array.prototype.slice.call(arguments);
            argumentsArray.splice(0, 3);
            var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
            var result = proxyObject[functionName].apply(proxyObject, argumentsArray);
            return result;
        }
    };
    extension.setDestinationProxyObjectAttribute = function(typeName, id, attributeName, attributeValue) {
        if (Cocoon.App.nativeAvailable) {
            var parentObject = window;
            var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
            proxyObject[attributeName] = attributeValue;
        }
    };
    extension.getDestinationProxyObjectAttribute = function(typeName, id, attributeName) {
        if (Cocoon.App.nativeAvailable) {
            var parentObject = window;
            var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
            return proxyObject[attributeName];
        }
    };
    extension.deleteDestinationProxyObject = function(typeName, id) {
        if (Cocoon.App.nativeAvailable) {
            var parentObject = window;
            delete parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
        }
    };
    extension.addDestinationProxyObjectEventListener = function(typeName, id, eventTypeName) {
        if (Cocoon.App.nativeAvailable) {
            var parentObject = window;
            var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
            var callback = function(event) {
                var proxyObject = this;
                var jsCode = "Cocoon.Proxify.callOriginProxyObjectEventListeners(" + JSON.stringify(proxyObject._cocoonjs_proxy_object_data.typeName) + ", " + proxyObject._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(eventTypeName) + ");";
                Cocoon.App.forwardAsync(jsCode);
            };
            proxyObject._cocoonjs_proxy_object_data.eventListeners[eventTypeName] = callback;
            proxyObject.addEventListener(eventTypeName, callback);
        }
    };
    extension.xhr = function() {
        var ATTRIBUTE_NAMES = [ "timeout", "withCredentials", "upload", "status", "statusText", "responseType", "response", "responseText", "responseXML", "readyState" ];
        var FUNCTION_NAMES = [ "open", "setRequestHeader", "send", "abort", "getResponseHeader", "getAllResponseHeaders", "overrideMimeType" ];
        var EVENT_HANDLER_NAMES = [ "onloadstart", "onprogress", "onabort", "onerror", "onload", "ontimeout", "onloadend", "onreadystatechange" ];
        Cocoon.Proxify.setupOriginProxyType("XMLHttpRequest", ATTRIBUTE_NAMES, FUNCTION_NAMES, EVENT_HANDLER_NAMES);
    };
    extension.audio = function() {
        var ATTRIBUTE_NAMES = [ "src", "loop", "volume", "preload" ];
        var FUNCTION_NAMES = [ "play", "pause", "load", "canPlayType" ];
        var EVENT_HANDLER_NAMES = [ "onended", "oncanplay", "oncanplaythrough", "onerror" ];
        Cocoon.Proxify.setupOriginProxyType("Audio", ATTRIBUTE_NAMES, FUNCTION_NAMES, EVENT_HANDLER_NAMES);
    };
    extension.console = function() {
        if (!Cocoon.nativeAvailable) return;
        if (typeof Cocoon.originalConsole === "undefined") {
            Cocoon.originalConsole = window.console;
        }
        var functions = [ "log", "error", "info", "debug", "warn" ];
        var newConsole = {};
        for (var i = 0; i < functions.length; i++) {
            newConsole[functions[i]] = function(functionName) {
                return function(message) {
                    try {
                        var jsCode = "Proxified log: " + JSON.stringify(message);
                        Cocoon.originalConsole.log(jsCode);
                        ext.IDTK_APP.makeCallAsync("forward", jsCode);
                    } catch (e) {
                        console.log("Proxified log: " + e);
                    }
                };
            }(functions[i]);
        }
        if (!newConsole.assert) {
            newConsole.assert = function assert() {
                if (arguments.length > 0 && !arguments[0]) {
                    var str = "Assertion failed: " + (arguments.length > 1 ? arguments[1] : "");
                    newConsole.error(str);
                }
            };
        }
        window.console = newConsole;
    };
    extension.deproxifyConsole = function() {
        if (window.navigator.isCocoonJS || !Cocoon.nativeAvailable) return;
        if (typeof Cocoon.originalConsole !== "undefined") {
            window.console = Cocoon.originalConsole;
            Cocoon.originalConsole = undefined;
        }
    };
    return extension;
});

Cocoon.define("Cocoon.Device", function(extension) {
    "use strict";
    extension.DeviceInfo = {
        os: null,
        version: null,
        dpi: null,
        brand: null,
        model: null,
        imei: null,
        platformId: null,
        odin: null,
        openudid: null
    };
    extension.getDeviceId = function() {
        if (Cocoon.nativeAvailable) {
            return window.ext.IDTK_APP.makeCall("getDeviceId");
        }
    };
    extension.getDeviceInfo = function() {
        if (Cocoon.nativeAvailable) {
            return window.ext.IDTK_APP.makeCall("getDeviceInfo");
        }
    };
    extension.getOrientation = function() {
        if (Cocoon.nativeAvailable) {
            return window.ext.IDTK_APP.makeCall("getPreferredOrientation");
        } else {
            return 0;
        }
    };
    extension.setOrientation = function(preferredOrientation) {
        if (Cocoon.nativeAvailable) {
            window.ext.IDTK_APP.makeCall("setPreferredOrientation", preferredOrientation);
        }
    };
    extension.Orientations = {
        PORTRAIT: 1,
        PORTRAIT_UPSIDE_DOWN: 2,
        LANDSCAPE_LEFT: 4,
        LANDSCAPE_RIGHT: 8,
        LANDSCAPE: 4 | 8,
        BOTH: 1 | 2 | 4 | 8
    };
    extension.autoLock = function(enabled) {
        if (Cocoon.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "setAutoLockEnabled", arguments);
        }
    };
    return extension;
});

Cocoon.define("Cocoon.Motion", function(extension) {
    "use strict";
    extension.nativeAvailable = Cocoon.nativeAvailable;
    extension.setAccelerometerInterval = function(updateIntervalInSeconds) {
        if (Cocoon.Motion.nativeAvailable) {
            return window.ext.IDTK_APP.makeCall("setAccelerometerUpdateIntervalInSeconds", updateIntervalInSeconds);
        }
    };
    extension.getAccelerometerInterval = function() {
        if (Cocoon.Motion.nativeAvailable) {
            return window.ext.IDTK_APP.makeCall("getAccelerometerUpdateIntervalInSeconds");
        }
    };
    extension.setGyroscopeInterval = function(updateIntervalInSeconds) {
        if (Cocoon.Motion.nativeAvailable) {
            return window.ext.IDTK_APP.makeCall("setGyroscopeUpdateIntervalInSeconds", updateIntervalInSeconds);
        }
    };
    extension.getGyroscopeInterval = function() {
        if (Cocoon.Motion.nativeAvailable) {
            window.ext.IDTK_APP.makeCall("getGyroscopeUpdateIntervalInSeconds");
        }
    };
    return extension;
});

Cocoon.define("Cocoon.Touch", function(extension) {
    extension.addADivToDisableInput = function() {
        var div = document.createElement("div");
        div.id = "CocoonJSInputBlockingDiv";
        div.style.left = 0;
        div.style.top = 0;
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.position = "absolute";
        div.style.backgroundColor = "transparent";
        div.style.border = "0px solid #000";
        div.style.zIndex = 999999999;
        document.body.appendChild(div);
    };
    extension.removeTheDivToEnableInput = function() {
        var div = document.getElementById("CocoonJSInputBlockingDiv");
        if (div) document.body.removeChild(div);
    };
    extension.disable = function() {
        if (Cocoon.nativeAvailable) {
            window.ext.IDTK_APP.makeCall("disableTouchLayer", "CocoonJSView");
        } else if (!navigator.isCocoonJS) {
            if (!Cocoon.App.EmulatedWebViewIFrame) {
                Cocoon.App.forwardEventsToCocoonJSEnabled = false;
                Cocoon.App.forwardAsync("Cocoon && Cocoon.Touch && Cocoon.Touch.disable();");
            }
        }
    };
    extension.enable = function() {
        if (Cocoon.nativeAvailable) {
            window.ext.IDTK_APP.makeCall("enableTouchLayer", "CocoonJSView");
        } else if (!navigator.isCocoonJS) {
            if (!Cocoon.App.EmulatedWebViewIFrame) {
                Cocoon.App.forwardEventsToCocoonJSEnabled = true;
                Cocoon.App.forwardAsync("Cocoon && Cocoon.Touch && Cocoon.Touch.enable();");
            }
        }
    };
    extension.disableInWebView = function() {
        if (Cocoon.nativeAvailable) {
            window.ext.IDTK_APP.makeCall("disableTouchLayer", "WebView");
        } else if (!navigator.isCocoonJS) {
            if (!Cocoon.App.EmulatedWebViewIFrame) {
                Cocoon.Touch.addADivToDisableInput();
            } else {
                Cocoon.App.forwardAsync("Cocoon && Cocoon.Touch && Cocoon.Touch.disableInWebView();");
            }
        }
    };
    extension.enableInWebView = function() {
        if (Cocoon.nativeAvailable) {
            window.ext.IDTK_APP.makeCall("enableTouchLayer", "WebView");
        } else if (!navigator.isCocoonJS) {
            if (!Cocoon.App.EmulatedWebViewIFrame) {
                Cocoon.Touch.removeTheDivToEnableInput();
            } else {
                Cocoon.Touch.forwardAsync("Cocoon && Cocoon.Touch && Cocoon.Touch.enableInWebView();");
            }
        }
    };
    return extension;
});

Cocoon.define("Cocoon.Widget", function(extension) {
    "use strict";
    extension.WebDialog = function() {
        if (Cocoon.App.nativeAvailable) {
            this.webDialogID = window.ext.IDTK_APP.makeCall("createWebDialog");
        } else {
            var iframe = document.createElement("iframe");
            iframe.id = "CocoonJSWebDialogIFrame";
            iframe.name = "CocoonJSWebDialogIFrame";
            iframe.style.cssText = "position:fixed;left:0;top:0;bottom:0;right:0; width:100%; height:100%;margin:0;padding:0;";
            var me = this;
            iframe.onload = function() {
                me.iframeloaded = true;
                var js = "Cocoon = {}; Cocoon.Widget = {}; Cocoon.Widget.WebDialog = {} Cocoon.Widget.WebDialog.close = function()" + "{" + "   window.parent.CocoonJSCloseWebDialog();" + "};";
                me.evalIframe(js);
                for (var i = 0; i < me.pendingEvals.length; ++i) {
                    me.evalIframe(me.pendingEvals[i]);
                }
                me.pendingEvals = [];
            };
            iframe.onerror = function() {
                me.close();
            };
            this.iframe = iframe;
            this.pendingEvals = [];
            window.CocoonJSCloseWebDialog = function() {
                me.close();
            };
        }
    };
    extension.WebDialog.prototype = {
        show: function(url, callback) {
            this.closeCallback = function() {
                Cocoon.Touch.enable();
                if (callback) callback();
            };
            if (Cocoon.App.nativeAvailable) {
                Cocoon.Touch.disable();
                return window.ext.IDTK_APP.makeCallAsync("showWebDialog", this.webDialogID, url, this.closeCallback);
            } else {
                this.iframe.src = url;
                document.body.appendChild(this.iframe);
            }
        },
        close: function() {
            if (Cocoon.App.nativeAvailable) {
                return window.ext.IDTK_APP.makeCallAsync("closeWebDialog", this.webDialogID);
            } else {
                if (this.iframe.parentNode) {
                    this.iframe.parentNode.removeChild(this.iframe);
                }
            }
            if (this.closeCallback) this.closeCallback();
        },
        evalIframe: function(js) {
            window.frames["CocoonJSWebDialogIFrame"].eval(js);
        },
        eval: function(js) {
            if (Cocoon.App.nativeAvailable) {
                return window.ext.IDTK_APP.makeCallAsync("evalWebDialog", this.webDialogID, js);
            } else {
                if (this.iframeloaded) this.evalIframe(js); else this.pendingEvals.push(js);
            }
        }
    };
    return extension;
});

Cocoon.define("Cocoon.Camera", function(extension) {
    navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    extension.CameraType = {
        FRONT: "FRONT",
        BACK: "BACK"
    };
    extension.CaptureFormatType = {
        JPEG: "JPEG",
        RGB_565: "RGB_565",
        NV21: "NV21",
        NV16: "NV16",
        YUY2: "YUY2",
        YV12: "YV12",
        BGRA32: "32BGRA"
    };
    extension.CameraInfo = {
        cameraIndex: 0,
        cameraType: extension.CameraType.BACK,
        supportedVideoSizes: [],
        supportedVideoFrameRates: [],
        supportedVideoCaptureImageFormats: []
    };
    extension.getNumberOfCameras = function() {
        if (Cocoon.nativeAvailable && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_SRV_CAMERA", "getNumberOfCameras", arguments);
        } else {
            return navigator.getUserMedia_ ? 1 : 0;
        }
    };
    extension.getAllCamerasInfo = function() {
        if (Cocoon.nativeAvailable && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_SRV_CAMERA", "getAllCamerasInfo", arguments);
        }
    };
    extension.getCameraInfoByIndex = function(cameraIndex) {
        if (Cocoon.nativeAvailable && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_SRV_CAMERA", "getCameraInfoByIndex", arguments);
        }
    };
    extension.getCameraInfoByType = function(cameraType) {
        if (Cocoon.nativeAvailable && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_SRV_CAMERA", "getCameraInfoByType", arguments);
        }
    };
    extension.start = function(params) {
        if (!(Boolean(params.success) && Boolean(params.error))) throw new Error("Missing callbacks for Cocoon.Camera.start();");
        if (Cocoon.nativeAvailable) {
            var properties = {
                cameraIndex: 0,
                width: 50,
                height: 50,
                frameRate: 25
            };
            var args = Cocoon.clone(properties, params);
            var img = Cocoon.callNative("IDTK_SRV_CAMERA", "startCapturing", args);
            if (Boolean(img)) {
                params.success(img);
            } else {
                params.error(false);
            }
        } else {
            navigator.getUserMedia_({
                video: true,
                audio: false
            }, function(stream) {
                params.success(stream);
            }, function(error) {
                params.error(error);
            });
        }
    };
    extension.stop = function(cameraIndex) {
        if (Cocoon.nativeAvailable && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_SRV_CAMERA", "stopCapturing", arguments);
        }
    };
    extension.isCapturing = function(cameraIndex) {
        if (Cocoon.nativeAvailable && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_SRV_CAMERA", "isCapturing", arguments);
        }
    };
    return extension;
});

Cocoon.define("Cocoon.Ad", function(extension) {
    "use strict";
    extension.nativeAvailable = !!Cocoon.nativeAvailable && !!window.ext.IDTK_SRV_AD;
    extension.BannerLayout = {
        TOP_CENTER: "TOP_CENTER",
        BOTTOM_CENTER: "BOTTOM_CENTER"
    };
    extension.Rectangle = function(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    };
    extension.Banner = function(id) {
        if (typeof id !== "number") throw "The given ad ID is not a number.";
        this.id = id;
        var me = this;
        this.onBannerShown = new Cocoon.EventHandler("IDTK_SRV_AD", "Ad", "onbannershow", function(sourceListener, args) {
            if (me.id === args[0]) {
                sourceListener();
            }
        });
        this.onBannerHidden = new Cocoon.EventHandler("IDTK_SRV_AD", "Ad", "onbannerhide", function(sourceListener, args) {
            if (me.id === args[0]) {
                sourceListener();
            }
        });
        this.onBannerReady = new Cocoon.EventHandler("IDTK_SRV_AD", "Ad", "onbannerready", function(sourceListener, args) {
            if (me.id === args[0]) {
                sourceListener(args[1], args[2]);
            }
        });
        var signal = new Cocoon.Signal.createSignal();
        signal.register("ready", this.onBannerReady);
        signal.register("shown", this.onBannerShown);
        signal.register("hidden", this.onBannerHidden);
        this.on = signal.expose();
    };
    extension.Banner.prototype = {
        showBanner: function() {
            if (Cocoon.Ad.nativeAvailable) {
                Cocoon.callNative("IDTK_SRV_AD", "showBanner", [ this.id ], true);
            }
        },
        hideBanner: function() {
            if (Cocoon.Ad.nativeAvailable) {
                Cocoon.callNative("IDTK_SRV_AD", "hideBanner", [ this.id ], true);
            }
        },
        load: function() {
            if (Cocoon.Ad.nativeAvailable) {
                Cocoon.callNative("IDTK_SRV_AD", "refreshBanner", [ this.id ], true);
            }
        },
        getRectangle: function() {
            if (Cocoon.Ad.nativeAvailable) {
                return Cocoon.callNative("IDTK_SRV_AD", "getRectangle", [ this.id ]);
            }
        },
        setRectangle: function(rect) {
            if (Cocoon.Ad.nativeAvailable) {
                return Cocoon.callNative("IDTK_SRV_AD", "setRectangle", [ this.id, rect ]);
            }
        },
        setBannerLayout: function(bannerLayout) {
            if (Cocoon.Ad.nativeAvailable) {
                return Cocoon.callNative("IDTK_SRV_AD", "setBannerLayout", [ this.id, bannerLayout ]);
            }
        }
    };
    extension.Interstitial = function(id) {
        if (typeof id !== "number") throw "The given ad ID is not a number.";
        this.id = id;
        var me = this;
        this.onFullScreenShown = new Cocoon.EventHandler("IDTK_SRV_AD", "Ad", "onfullscreenshow", function(sourceListener, args) {
            if (me.id === args[0]) {
                sourceListener();
            }
        });
        this.onFullScreenHidden = new Cocoon.EventHandler("IDTK_SRV_AD", "Ad", "onfullscreenhide", function(sourceListener, args) {
            if (me.id === args[0]) {
                sourceListener();
            }
        });
        this.onFullScreenReady = new Cocoon.EventHandler("IDTK_SRV_AD", "Ad", "onfullscreenready", function(sourceListener, args) {
            if (me.id === args[0]) {
                sourceListener();
            }
        });
        var signal = new Cocoon.Signal.createSignal();
        signal.register("ready", this.onFullScreenReady);
        signal.register("shown", this.onFullScreenShown);
        signal.register("hidden", this.onFullScreenHidden);
        this.on = signal.expose();
    };
    extension.Interstitial.prototype = {
        showInterstitial: function() {
            if (Cocoon.Ad.nativeAvailable) {
                return Cocoon.callNative("IDTK_SRV_AD", "showFullScreen", [ this.id ], true);
            }
        },
        refreshInterstitial: function() {
            if (Cocoon.Ad.nativeAvailable) {
                return Cocoon.callNative("IDTK_SRV_AD", "refreshFullScreen", [ this.id ], true);
            }
        }
    };
    extension.configure = function(parameters) {
        if (typeof parameters === "undefined") {
            parameters = {};
        }
        if (Cocoon.Ad.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_AD", "requestInitialization", arguments, true);
        }
    };
    extension.createBanner = function(parameters) {
        if (typeof parameters === "undefined") {
            parameters = {};
        }
        if (Cocoon.Ad.nativeAvailable) {
            var adId = Cocoon.callNative("IDTK_SRV_AD", "createBanner", [ parameters ]);
            var banner = new extension.Banner(adId);
            return banner;
        }
    };
    extension.releaseBanner = function(banner) {
        if (typeof banner === "undefined") {
            throw "The banner ad object to be released is undefined";
        }
        if (Cocoon.Ad.nativeAvailable) {
            Cocoon.callNative("IDTK_SRV_AD", "releaseBanner", [ banner.id ]);
        }
    };
    extension.createInterstitial = function(parameters) {
        if (typeof parameters === "undefined") {
            parameters = {};
        }
        if (Cocoon.Ad.nativeAvailable) {
            var adId = Cocoon.callNative("IDTK_SRV_AD", "createFullscreen", [ parameters ]);
            var fullscreen = new Cocoon.Ad.Interstitial(adId);
            return fullscreen;
        }
    };
    extension.releaseInterstitial = function(fullscreen) {
        if (!fullscreen) {
            throw "The fullscreen ad object to be released is undefined";
        }
        if (Cocoon.Ad.nativeAvailable) {
            Cocoon.callNative("IDTK_SRV_AD", "releaseFullscreen", [ fullscreen.id ]);
        }
    };
    extension.showBanner = function() {
        if (Cocoon.Ad.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_AD", "showBanner", arguments, true);
        }
    };
    extension.hideBanner = function() {
        if (Cocoon.Ad.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_AD", "hideBanner", arguments, true);
        }
    };
    extension.refreshBanner = function() {
        if (Cocoon.Ad.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_AD", "refreshBanner", arguments, true);
        }
    };
    extension.showInterstitial = function() {
        if (Cocoon.Ad.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_AD", "showFullScreen", arguments, true);
        }
    };
    extension.refreshInterstitial = function() {
        if (Cocoon.Ad.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_AD", "refreshFullScreen", arguments, true);
        }
    };
    extension.preloadedBanner = false;
    extension.loadBanner = function() {
        if (Cocoon.Ad.nativeAvailable) {
            if (Cocoon.Ad.preloadedBanner) {
                return Cocoon.Ad.refreshBanner();
            } else {
                Cocoon.Ad.preloadedBanner = true;
                return Cocoon.callNative("IDTK_SRV_AD", "preloadBanner", arguments, true);
            }
        }
    };
    extension.preloadedInterstitial = false;
    extension.loadInterstitial = function() {
        if (Cocoon.Ad.nativeAvailable) {
            if (Cocoon.Ad.preloadedInterstitial) {
                return Cocoon.Ad.refreshInterstitial();
            } else {
                Cocoon.Ad.preloadedInterstitial = true;
                return Cocoon.callNative("IDTK_SRV_AD", "preloadFullScreen", arguments, true);
            }
        }
    };
    extension.setRectangle = function() {
        if (Cocoon.Ad.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_AD", "setRectangle", arguments);
        }
    };
    extension.getRectangle = function() {
        if (Cocoon.Ad.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_AD", "getRectangle", arguments);
        }
    };
    extension.setBannerLayout = function(bannerLayout) {
        if (Cocoon.Ad.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_AD", "setBannerLayout", arguments);
        }
    };
    extension.onBannerShown = new Cocoon.EventHandler("IDTK_SRV_AD", "Ad", "onbannershow");
    extension.onBannerHidden = new Cocoon.EventHandler("IDTK_SRV_AD", "Ad", "onbannerhide");
    extension.onBannerReady = new Cocoon.EventHandler("IDTK_SRV_AD", "Ad", "onbannerready");
    extension.onFullScreenShown = new Cocoon.EventHandler("IDTK_SRV_AD", "Ad", "onfullscreenshow");
    extension.onFullScreenHidden = new Cocoon.EventHandler("IDTK_SRV_AD", "Ad", "onfullscreenhide");
    extension.onFullScreenReady = new Cocoon.EventHandler("IDTK_SRV_AD", "Ad", "onfullscreenready");
    var signal = new Cocoon.Signal.createSignal();
    signal.register("ready", extension.onBannerReady);
    signal.register("shown", extension.onBannerShown);
    signal.register("hidden", extension.onBannerHidden);
    extension.banner = {};
    extension.banner.on = signal.expose();
    var signal = new Cocoon.Signal.createSignal();
    signal.register("ready", extension.onFullScreenReady);
    signal.register("shown", extension.onFullScreenShown);
    signal.register("hidden", extension.onFullScreenHidden);
    extension.interstitial = {};
    extension.interstitial.on = signal.expose();
    return extension;
});

Cocoon.define("Cocoon.Store", function(extension) {
    "use strict";
    extension.nativeAvailable = !!Cocoon.nativeAvailable && !!window.ext.IDTK_SRV_STORE;
    extension.ProductInfo = {
        productId: "productId",
        productAlias: "productAlias",
        productType: "productType",
        title: "title",
        description: "description",
        price: "price",
        localizedPrice: "localizedPrice",
        downloadURL: "downloadURL"
    };
    extension.ProductType = {
        CONSUMABLE: 0,
        NON_CONSUMABLE: 1,
        AUTO_RENEWABLE_SUBSCRIPTION: 2,
        FREE_SUBSCRIPTION: 3,
        NON_RENEWABLE_SUBSCRIPTION: 4
    };
    extension.StoreType = {
        APP_STORE: 0,
        PLAY_STORE: 1,
        MOCK_STORE: 2,
        CHROME_STORE: 3,
        AMAZON_STORE: 4,
        NOOK_STORE: 5
    };
    extension.PurchaseInfo = function(transactionId, purchaseTime, purchaseState, productId, quantity) {
        this.transactionId = transactionId;
        this.purchaseTime = purchaseTime;
        this.purchaseState = purchaseState;
        this.productId = productId;
        this.quantity = quantity;
        return this;
    };
    extension.PurchaseState = {
        PURCHASED: 0,
        CANCELED: 1,
        REFUNDED: 2,
        EXPIRED: 3
    };
    extension.getStoreType = function() {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "getStoreType", arguments);
        } else {
            return false;
        }
    };
    extension.initialize = function(params) {
        params = params || {};
        var properties = {
            sandbox: false,
            managed: true
        };
        var args = Cocoon.clone(properties, params);
        Cocoon.Store.requestInitialization({
            sandbox: args[0],
            managed: args[1]
        });
        Cocoon.Store.start();
    };
    extension.requestInitialization = function(parameters) {
        if (typeof parameters === "undefined") {
            parameters = {};
        } else {
            if (parameters["managed"] !== undefined) parameters["remote"] = parameters["managed"];
            if (parameters["sandbox"] !== undefined) parameters["debug"] = parameters["sandbox"];
        }
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "requestInitialization", arguments, true);
        }
    };
    extension.start = function() {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "start", arguments);
        }
    };
    extension.canPurchase = function() {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "canPurchase", arguments);
        } else {
            return false;
        }
    };
    extension.fetchProductsFromServer = function() {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "fetchProductsFromServer", arguments, true);
        }
    };
    extension.loadProducts = function(productIds) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "fetchProductsFromStore", arguments, true);
        }
    };
    extension.finish = function(transactionId) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "finishPurchase", arguments, true);
        }
    };
    extension.consume = function(transactionId, productId) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "consumePurchase", arguments, true);
        }
    };
    extension.purchase = function(productId) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "purchaseFeature", arguments, true);
        }
    };
    extension.puchaseProductModal = function(productId) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "purchaseFeatureModal", arguments, true);
        }
    };
    extension.purchaseProductModalWithPreview = function(productId) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "purchaseFeatureModalWithPreview", arguments, true);
        }
    };
    extension.isProductPurchased = function(productId) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "isFeaturePurchased", arguments);
        }
    };
    extension.restore = function() {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "restorePurchases", arguments, true);
        }
    };
    extension.restorePurchasesModal = function() {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "restorePurchasesModal", arguments, true);
        }
    };
    extension.getProducts = function() {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "getProducts", arguments);
        }
    };
    extension.addProduct = function(product) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "addProduct", arguments);
        }
    };
    extension.removeProduct = function(productId) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "removeProduct", arguments);
        }
    };
    extension.getPurchases = function() {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "getPurchases", arguments);
        }
    };
    extension.addPurchase = function(purchase) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "addPurchase", arguments);
        }
    };
    extension.removePurchase = function(transactionId) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "removePurchase", arguments);
        }
    };
    extension.cancelPurchase = function(transactionId) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "cancelPurchase", arguments);
        }
    };
    extension.refundPurchase = function(transactionId) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "refundPurchase", arguments);
        }
    };
    extension.expirePurchase = function(transactionId) {
        if (Cocoon.Store.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_STORE", "expirePurchase", arguments);
        }
    };
    extension.onProductsFetchStarted = new Cocoon.EventHandler("IDTK_SRV_STORE", "Store", "onProductsFetchStarted");
    extension.onProductsFetchCompleted = new Cocoon.EventHandler("IDTK_SRV_STORE", "Store", "onProductsFetchCompleted");
    extension.onProductsFetchFailed = new Cocoon.EventHandler("IDTK_SRV_STORE", "Store", "onProductsFetchFailed");
    extension.onProductPurchaseStarted = new Cocoon.EventHandler("IDTK_SRV_STORE", "Store", "onProductPurchaseStarted");
    extension.onProductPurchaseVerificationRequestReceived = new Cocoon.EventHandler("IDTK_SRV_STORE", "Store", "onProductPurchaseVerificationRequestReceived");
    extension.onProductPurchaseCompleted = new Cocoon.EventHandler("IDTK_SRV_STORE", "Store", "onProductPurchaseCompleted");
    extension.onProductPurchaseFailed = new Cocoon.EventHandler("IDTK_SRV_STORE", "Store", "onProductPurchaseFailed");
    extension.onRestorePurchasesStarted = new Cocoon.EventHandler("IDTK_SRV_STORE", "Store", "onRestorePurchasesStarted");
    extension.onRestorePurchasesCompleted = new Cocoon.EventHandler("IDTK_SRV_STORE", "Store", "onRestorePurchasesCompleted");
    extension.onRestorePurchasesFailed = new Cocoon.EventHandler("IDTK_SRV_STORE", "Store", "onRestorePurchasesFailed");
    extension.onConsumePurchaseStarted = new Cocoon.EventHandler("IDTK_SRV_STORE", "Store", "onConsumePurchaseStarted");
    extension.onConsumePurchaseCompleted = new Cocoon.EventHandler("IDTK_SRV_STORE", "Store", "onConsumePurchaseCompleted");
    extension.onConsumePurchaseFailed = new Cocoon.EventHandler("IDTK_SRV_STORE", "Store", "onConsumePurchaseFailed");
    var signal = new Cocoon.Signal.createSignal();
    signal.register("load", {
        started: extension.onProductsFetchStarted,
        success: extension.onProductsFetchCompleted,
        error: extension.onProductsFetchFailed
    });
    signal.register("purchase", {
        started: extension.onProductPurchaseStarted,
        success: extension.onProductPurchaseCompleted,
        verification: extension.onProductPurchaseVerificationRequestReceived,
        error: extension.onProductPurchaseFailed
    });
    signal.register("consume", {
        started: extension.onConsumePurchaseStarted,
        success: extension.onConsumePurchaseCompleted,
        error: extension.onConsumePurchaseFailed
    });
    signal.register("restore", {
        started: extension.onRestorePurchasesStarted,
        success: extension.onRestorePurchasesCompleted,
        error: extension.onRestorePurchasesFailed
    });
    extension.on = signal.expose();
    return extension;
});

Cocoon.define("Cocoon.Notification", function(extension) {
    extension.nativeAvailable = !!window.ext && !!window.ext.IDTK_SRV_NOTIFICATION;
    extension.Local = {};
    extension.Push = {};
    extension.Local.create = function(params) {
        var properties = {
            message: "",
            soundEnabled: true,
            badgeNumber: 0,
            userData: {},
            contentBody: "",
            contentTitle: "",
            date: new Date().valueOf() + 1e3
        };
        var args = Cocoon.clone(properties, params);
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "createLocalNotification", args);
        }
    };
    extension.Push.create = function(params) {
        var properties = {
            message: "",
            soundEnabled: true,
            badgeNumber: 0,
            userData: {},
            channels: [],
            expirationTime: 0,
            expirationTimeInterval: 0
        };
        for (var prop in properties) {
            if (!params[prop]) {
                params[prop] = properties[prop];
            }
        }
        return params;
    };
    extension.start = function() {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "start", arguments);
        }
    };
    extension.Push.register = function() {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "registerForPushNotifications", arguments, true);
        }
    };
    extension.Push.unregister = function() {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "unregisterForPushNotifications", arguments, true);
        }
    };
    extension.Local.cancel = function() {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "cancelLocalNotification", arguments);
        }
    };
    extension.Local.cancelLast = function() {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "cancelLocalNotification", arguments, true);
        }
    };
    extension.Local.cancelAllNotifications = function() {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "cancelAllLocalNotifications", arguments);
        }
    };
    extension.Local.send = function(localNotification) {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "sendLocalNotification", arguments, true);
        }
    };
    extension.subscribe = function(channel) {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "subscribe", arguments, true);
        }
    };
    extension.unsubscribe = function(channel) {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "unsubscribe", arguments, true);
        }
    };
    extension.Push.send = function(pushNotification) {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "sendPushNotification", arguments, true);
        }
    };
    extension.setBadgeNumber = function(badgeNumber) {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "setBadgeNumber", arguments);
        }
    };
    extension.getBadgeNumber = function() {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "getBadgeNumber", arguments);
        }
    };
    extension.Local.getLastNotificationData = function() {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "getLastReceivedLocalNotificationData", arguments);
        }
    };
    extension.Push.getLastNotificationData = function() {
        if (Cocoon.Notification.nativeAvailable) {
            return Cocoon.callNative("IDTK_SRV_NOTIFICATION", "getLastReceivedPushNotificationData", arguments);
        }
    };
    extension.onRegisterForPushNotificationsSucceed = new Cocoon.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "pushNotificationServiceRegistered");
    extension.onUnregisterForPushNotificationsSucceed = new Cocoon.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "pushNotificationServiceUnregistered");
    extension.onRegisterForPushNotificationsFailed = new Cocoon.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "pushNotificationServiceFailedToRegister");
    extension.onPushNotificationReceived = new Cocoon.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "pushNotificationReceived");
    extension.onLocalNotificationReceived = new Cocoon.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "localNotificationReceived");
    extension.onPushNotificationDeliverySucceed = new Cocoon.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "pushNotificationSuccessfullyDelivered");
    extension.onPushNotificationDeliveryFailed = new Cocoon.EventHandler("IDTK_SRV_NOTIFICATION", "Notification", "pushNotificationDeliveryError");
    var signal = new Cocoon.Signal.createSignal();
    signal.register("notification", {
        received: extension.onLocalNotificationReceived
    });
    extension.Local.on = signal.expose();
    var signal = new Cocoon.Signal.createSignal();
    signal.register("register", {
        success: extension.onRegisterForPushNotificationsSucceed,
        unregister: extension.onUnregisterForPushNotificationsSucceed,
        error: extension.onRegisterForPushNotificationsFailed
    });
    signal.register("notification", {
        received: extension.onPushNotificationReceived
    });
    signal.register("deliver", {
        success: extension.onPushNotificationDeliverySucceed,
        error: extension.onPushNotificationDeliveryFailed
    });
    extension.Push.on = signal.expose();
    return extension;
});

Cocoon.define("Cocoon.Social", function(extension) {
    extension.Interface = function() {
        this.onLoginStatusChanged = new Cocoon.EventHandler("", "dummy", "onLoginStatusChanged");
        var signal = new Cocoon.Signal.createSignal();
        signal.register("loginStatusChanged", this.onLoginStatusChanged);
        this.on = signal.expose();
        return this;
    };
    extension.Interface.prototype = {
        isLoggedIn: function() {
            return false;
        },
        login: function(callback) {
            if (callback) callback(false, {
                message: "Not implemented!"
            });
        },
        logout: function(callback) {
            if (callback) callback({
                message: "Not implemented!"
            });
        },
        getLoggedInUser: function() {
            return null;
        },
        hasPublishPermissions: function(callback) {
            callback(true);
        },
        requestPublishPermissions: function(callback) {
            if (callback) callback(true, null);
        },
        requestUser: function(callback, userID) {
            callback(null, {
                message: "Not implemented!"
            });
        },
        requestUserImage: function(callback, userID, imageSize) {
            callback("", {
                message: "Not implemented!"
            });
        },
        requestFriends: function(callback, userID) {
            callback([], {
                message: "Not implemented!"
            });
        },
        publishMessage: function(message, callback) {
            callback({
                message: "Not implemented!"
            });
        },
        publishMessageWithDialog: function(message, callback) {
            callback({
                message: "Not implemented!"
            });
        }
    };
    extension.SocialGamingService = function() {
        Cocoon.Social.SocialGamingService.superclass.constructor.call(this);
        return this;
    };
    extension.SocialGamingService.prototype = {
        _cachedAchievements: null,
        _achievementsMap: null,
        _leaderboardsTemplate: null,
        _achievementsTemplate: null,
        requestScore: function(callback, params) {
            callback(null, {
                message: "Not implemented!"
            });
        },
        submitScore: function(score, callback, params) {
            if (callback) callback({
                message: "Not implemented!"
            });
        },
        showLeaderboard: function(callback, params) {
            if (callback) callback({
                message: "Not implemented!"
            });
        },
        requestAllAchievements: function(callback) {
            callback([], {
                message: "Not implemented!"
            });
        },
        requestAchievements: function(callback, userID) {
            callback([], {
                message: "Not implemented!"
            });
        },
        submitAchievement: function(achievementID, callback) {
            if (callback) callback({
                message: "Not implemented!"
            });
        },
        resetAchievements: function(callback) {
            if (callback) callback([], {
                message: "Not implemented!"
            });
        },
        showAchievements: function(callback) {
            if (!this._achievementsTemplate) throw "Please, provide a html template for achievements with the setTemplates method";
            var dialog = new Cocoon.Widget.WebDialog();
            var callbackSent = false;
            dialog.show(this._achievementsTemplate, function(error) {
                dialog.closed = true;
                if (!callbackSent && callback) callback(error);
            });
            var me = this;
            this.requestAchievements(function(achievements, error) {
                if (dialog.closed) return;
                if (error) {
                    callbackSent = true;
                    if (callback) callback(error);
                    return;
                }
                var achs = [];
                if (me._cachedAchievements) {
                    for (var i = 0; i < me._cachedAchievements.length; ++i) {
                        var ach = me._cachedAchievements[i];
                        achs.push(ach);
                        if (achievements && achievements.length) {
                            for (var j = 0; j < achievements.length; ++j) {
                                if (achievements[j].achievementID === ach.achievementID) {
                                    ach.achieved = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                var js = "addAchievements(" + JSON.stringify(achs) + ");";
                dialog.eval(js);
            });
        },
        setAchievementsMap: function(map) {
            this._achievementsMap = map;
            if (this._cachedAchievements) {
                this.syncAchievementsMap(this._cachedAchievements);
            }
        },
        setTemplates: function(leaderboardsTemplate, achievementsTemplate) {
            this._leaderboardsTemplate = leaderboardsTemplate;
            this._achievementsTemplate = achievementsTemplate;
        },
        setCachedAchievements: function(achievements) {
            this._cachedAchievements = achievements;
            if (achievements && this._achievementsMap) {
                this.syncAchievementsMap(this._cachedAchievements);
            }
        },
        findAchievement: function(id) {
            if (!this._cachedAchievements) return null;
            for (var i = 0; i < this._cachedAchievements.length; ++i) {
                if (id === this._cachedAchievements[i].achievementID) {
                    return this._cachedAchievements[i];
                }
            }
            return null;
        },
        translateAchievementID: function(id) {
            if (this._achievementsMap) {
                for (var customID in this._achievementsMap) {
                    if (customID == id) {
                        return this._achievementsMap[customID];
                    }
                }
            }
            return id;
        },
        syncAchievementsMap: function(achievements) {
            if (!this._achievementsMap) return;
            for (var i = 0; i < achievements.length; ++i) {
                for (var customID in this._achievementsMap) {
                    if (this._achievementsMap[customID] === achievements[i].achievementID) {
                        achievements[i].customID = customID;
                    }
                }
            }
        }
    };
    Cocoon.extend(extension.SocialGamingService, extension.Interface);
    extension.ImageSize = {
        THUMB: "thumb",
        SMALL: "small",
        MEDIUM: "medium",
        LARGE: "large"
    };
    extension.User = function(userID, userName, userImage) {
        this.userID = userID;
        this.userName = userName;
        this.userImage = userImage;
        return this;
    };
    extension.Message = function(message, mediaURL, linkURL, linkText, linkCaption) {
        this.message = message;
        this.mediaURL = mediaURL;
        this.linkURL = linkURL;
        this.linkText = linkText;
        this.linkCaption = linkCaption;
        return this;
    };
    extension.Score = function(userID, score, userName, imageURL, leaderboardID) {
        this.userID = userID;
        this.score = score || 0;
        this.userName = userName;
        this.imageURL = imageURL;
        this.leaderboardID = leaderboardID;
        return this;
    };
    extension.ScoreParams = function(userID, leaderboardID, friends, timeScope) {
        this.userID = userID;
        this.leaderboardID = leaderboardID;
        this.friends = !!friends;
        this.timeScope = timeScope || 2;
    };
    extension.TimeScope = {
        ALL_TIME: 0,
        WEEK: 1,
        TODAY: 2
    };
    extension.Achievement = function(achievementID, title, description, imageURL, points) {
        this.achievementID = achievementID;
        this.customID = achievementID;
        this.title = title;
        this.description = description;
        this.imageURL = imageURL;
        this.points = points || 0;
        return this;
    };
    extension.share = function(textToShare) {
        if (Cocoon.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "share", arguments, true);
        } else {}
    };
    return extension;
});

Cocoon.define("Cocoon.Social", function(extension) {
    extension.ManagerService = function() {
        this.services = [];
    };
    extension.ManagerService.prototype = {
        services: null,
        registerSocialService: function(service) {
            this.services.push(service);
        },
        submitAchievement: function(achievementID) {
            for (var i = 0; i < this.services.length; ++i) {
                var service = this.services[i];
                if (!service.readOnlyHint && service.isLoggedIn()) {
                    service.submitAchievement(achievementID, function(error) {
                        if (error) console.error("Error submitting achievement: " + error.message);
                    });
                }
            }
        },
        submitScore: function(score, params) {
            for (var i = 0; i < this.services.length; ++i) {
                var service = this.services[i];
                if (!service.readOnlyHint && service.isLoggedIn()) {
                    service.submitScore(score, function(error) {
                        if (error) console.error("Error submitting score: " + error.message);
                    }, params);
                }
            }
        },
        getLoggedInServices: function() {
            var result = [];
            for (var i = 0; i < this.services.length; ++i) {
                var service = this.services[i];
                if (!service.fakeSocialService && service.isLoggedIn()) {
                    result.push(service);
                }
            }
            return result;
        },
        isLoggedInAnySocialService: function() {
            return this.getLoggedInServices().length > 0;
        }
    };
    extension.Manager = new extension.ManagerService();
    return extension;
});

Cocoon.define("Cocoon.Social", function(extension) {
    extension.LocalStorageService = function() {
        Cocoon.Social.LocalStorageService.superclass.constructor.call(this);
        this.fakeSocialService = true;
    };
    extension.LocalStorageService.prototype = {
        loggedIn: false,
        keys: {
            score: "Cocoon.Social.LocalStorageService.score",
            earnedAchievements: "Cocoon.Social.LocalStorageService.earned"
        },
        isLoggedIn: function() {
            return this.loggedIn;
        },
        login: function(callback) {
            if (!this.loggedIn) this.onLoginStatusChanged.notifyEventListeners(true);
            this.loggedIn = true;
            if (callback) setTimeout(function() {
                callback(true);
            }, 0);
        },
        logout: function(callback) {
            if (this.loggedIn) this.onLoginStatusChanged.notifyEventListeners(true);
            this.loggedIn = false;
            if (callback) setTimeout(function() {
                callback();
            }, 0);
        },
        getLoggedInUser: function() {
            return new Cocoon.Social.User("me", "LocalStorage");
        },
        requestUser: function(callback, userID) {
            var user = new Cocoon.Social.User(userID || "me", "LocalStorage");
            if (callback) setTimeout(function() {
                callback(user);
            }, 0);
        },
        requestScore: function(callback, params) {
            var scoreItem = localStorage.getItem(this.keys.score);
            var score = parseInt(scoreItem) || 0;
            setTimeout(function() {
                callback(new Cocoon.Social.Score("me", score));
            }, 0);
        },
        submitScore: function(score, callback, params) {
            var scoreItem = localStorage.getItem(this.keys.score);
            var topScore = parseInt(scoreItem) || 0;
            if (score > topScore) localStorage.setItem(this.keys.score, score);
            if (callback) setTimeout(function() {
                callback();
            }, 0);
        },
        getLocalStorageEarnedAchievements: function() {
            var achievementsItem = localStorage.getItem(this.keys.earnedAchievements);
            var earned = [];
            if (achievementsItem) {
                var array = JSON.stringify(achievementsItem);
                if (array && array.length) {
                    earned = array;
                }
            }
            return earned;
        },
        requestAchievements: function(callback, userID) {
            var earned = this.getLocalStorageEarnedAchievements();
            setTimeout(function() {
                callback(earned);
            }, 0);
        },
        submitAchievement: function(achievementID, callback) {
            if (achievementID === null || typeof achievementID === "undefined") throw "No achievementID specified";
            var earned = this.getLocalStorageEarnedAchievements();
            var exists = false;
            for (var i = 0; i < earned.length; ++i) {
                if (earned[i] === achievementID) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                earned.push(achievementID);
                localStorage.setItem(this.keys.earnedAchievements, JSON.stringify(earned));
            }
            if (callback) setTimeout(function() {
                callback();
            }, 0);
        },
        resetAchievements: function(callback) {
            localStorage.removeItem(this.keys.earnedAchievements);
            if (callback) setTimeout(function() {
                callback();
            }, 0);
        }
    };
    Cocoon.extend(extension.LocalStorageService, extension.SocialGamingService);
    extension.LocalStorage = new extension.LocalStorageService();
    return extension;
});

Cocoon.define("Cocoon.Social", function(extension) {
    extension.GooglePlayGamesExtension = function() {
        this.nativeExtensionName = "IDTK_SRV_GOOGLE_PLAY_GAMES";
        this.extensionName = "Social.GooglePlayGames";
        this.nativeAvailable = Cocoon.nativeAvailable && typeof window.ext[this.nativeExtensionName] !== "undefined";
        this.auth = new Cocoon.Social.GooglePlayGamesAuthExtension(this);
        this.client = new Cocoon.Social.GooglePlayGamesClientExtension(this);
        this.defaultScopes = [ "https://www.googleapis.com/auth/games", "https://www.googleapis.com/auth/plus.login" ];
        this.gamesAPI = "/games/v1";
        this.plusAPI = "/plus/v1";
        this.onSessionChanged = new Cocoon.EventHandler(this.nativeExtensionName, this.extensionName, "onSessionChanged");
        Cocoon.Social.GooglePlayGames = this;
        var me = this;
        this.onSessionChanged.addEventListener(function(session, error) {
            me.token = fromSessionToAuthTokenObject(session, error);
            if (session && session.access_token) {
                me.client.request({
                    path: me.gamesAPI + "/players/me",
                    callback: function(response) {
                        me.currentPlayer = response;
                    }
                });
            }
        });
        return this;
    };
    extension.GooglePlayGamesExtension.prototype = {
        token: null,
        settings: {},
        socialService: null,
        currentPlayer: null,
        initialized: false,
        auth: null,
        client: null,
        init: function(params) {
            if (!params || typeof params !== "object") throw "Invalid params argument";
            this.settings = params;
            this.initialized = true;
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "init", [ this.settings.clientId ], true);
            } else {
                var me = this;
                var initWebAPi = function() {
                    gapi.auth.authorize({
                        immediate: true,
                        scope: me.defaultScopes,
                        client_id: me.settings.clientId
                    }, function(response) {
                        me.token = response;
                        if (response && response.access_token) {
                            me.onSessionChanged.notifyEventListeners(response);
                        }
                    });
                };
                if (!window.gapi) {
                    window.onGapiLoadCallback = function() {
                        window.setTimeout(initWebAPi, 1);
                    };
                    var script = document.createElement("script");
                    script.src = "https://apis.google.com/js/client.js?onload=onGapiLoadCallback";
                    document.getElementsByTagName("head")[0].appendChild(script);
                } else {
                    initWebAPi();
                }
            }
        },
        getSocialInterface: function() {
            if (!this.initialized) {
                throw "You must call init() before getting the Social Interface";
            }
            if (!this.socialService) {
                this.socialService = new Cocoon.Social.SocialGamingServiceGooglePlayGames(this);
            }
            return this.socialService;
        },
        getMultiplayerInterface: function() {
            return Cocoon.Multiplayer.GooglePlayGames;
        },
        share: function() {
            window.open(this.href, "", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600");
            return false;
        }
    };
    extension.GooglePlayGamesAuthExtension = function(extension) {
        this.extension = extension;
        return this;
    };
    extension.GooglePlayGamesAuthExtension.prototype = {
        authorize: function(params, callback) {
            var me = this;
            if (this.extension.nativeAvailable) {
                Cocoon.callNative(this.extension.nativeExtensionName, "authorize", [ params, function(response, error) {
                    me.extension.token = fromSessionToAuthTokenObject(response, error);
                    if (callback) {
                        callback(me.extension.token);
                    }
                } ], true);
            } else {
                gapi.auth.authorize(params, function(response) {
                    me.extension.token = response;
                    me.extension.onSessionChanged.notifyEventListeners(response, response ? response.error : null);
                    if (callback) callback(response);
                });
            }
        },
        disconnect: function(callback) {
            if (this.extension.nativeAvailable) {
                Cocoon.callNative(this.extension.nativeExtensionName, "disconnect", [ callback ], true);
            } else {
                if (callback) callback({
                    error: "Not implemented yet"
                });
            }
        },
        init: function(callback) {
            if (this.extension.nativeAvailable) {
                callback();
            } else {
                gapi.auth.init(callback);
            }
        },
        getToken: function() {
            if (this.extension.nativeAvailable) {
                return this.extension.token;
            } else {
                return gapi.auth.getToken();
            }
        },
        setToken: function(token) {
            if (this.extension.nativeAvailable) {
                this.extension.token = token;
            } else {
                gapi.auth.setToken(token);
            }
        }
    };
    extension.GooglePlayGamesClientExtension = function(extension) {
        this.extension = extension;
        return this;
    };
    extension.GooglePlayGamesClientExtension.prototype = {
        setApiKey: function(apiKey) {
            if (this.extension.nativeAvailable) {
                Cocoon.callNative(this.extension.nativeExtensionName, "setApiKey", [ apiKey ], true);
            } else {
                gapi.client.setApiKey(apiKey);
            }
        },
        request: function(args) {
            if (this.extension.nativeAvailable) {
                if (args.callback) {
                    Cocoon.callNative(this.extension.nativeExtensionName, "request", [ args, function(response, error) {
                        var result = response;
                        if (error) {
                            result = response || {};
                            result.error = error;
                        }
                        args.callback(result);
                    } ], true);
                    return null;
                } else {
                    var me = this;
                    var httpRequest = {
                        execute: function(callback) {
                            Cocoon.callNative(me.extension.nativeExtensionName, "request", [ args, function(response, error) {
                                var result = response;
                                if (error) {
                                    result = response || {};
                                    result.error = error;
                                }
                                callback(result);
                            } ], true);
                        }
                    };
                    return httpRequest;
                }
            } else {
                return gapi.client.request(args);
            }
        }
    };
    extension.GooglePlayGames = new Cocoon.Social.GooglePlayGamesExtension();
    function fromSessionToAuthTokenObject(response, error) {
        var obj = response || {};
        return {
            access_token: response.access_token,
            state: response.state,
            error: error,
            expires_in: response.expirationDate ? response.expirationDate - Date.now() : 0,
            player_id: response.playerId
        };
    }
    extension.SocialGamingServiceGooglePlayGames = function(apiObject) {
        Cocoon.Social.SocialGamingServiceGooglePlayGames.superclass.constructor.call(this);
        this.gapi = apiObject;
        var me = this;
        this.gapi.onSessionChanged.addEventListener(function(session) {
            var obj = session || {};
            me.onLoginStatusChanged.notifyEventListeners(!!obj.access_token, obj.error);
        });
        return this;
    };
    extension.SocialGamingServiceGooglePlayGames.prototype = {
        isLoggedIn: function() {
            return this.gapi.token && this.gapi.token.access_token ? true : false;
        },
        login: function(callback) {
            var me = this;
            this.gapi.auth.authorize({
                client_id: this.gapi.settings.clientId,
                scope: this.gapi.defaultScopes
            }, function(response) {
                if (callback) {
                    callback(me.isLoggedIn(), response.error);
                }
            });
        },
        logout: function(callback) {
            this.gapi.auth.disconnect(callback);
        },
        getLoggedInUser: function() {
            return this.gapi.currentPlayer ? fromGPUserToCocoonUser(this.gapi.currentPlayer) : null;
        },
        requestUser: function(callback, userId) {
            var playerId = userId || "me";
            this.gapi.client.request({
                path: this.gapi.gamesAPI + "/players/" + playerId,
                callback: function(response) {
                    var user = response && !response.error ? fromGPPlayerToCocoonUser(response) : null;
                    callback(user, response.error);
                }
            });
        },
        requestUserImage: function(callback, userID, imageSize) {
            this.requestUser(function(user, error) {
                if (user && user.userImage) {
                    var pixelSize = fromImageSizeToGPSize(imageSize || Cocoon.Social.ImageSize.MEDIUM);
                    if (user.userImage.indexOf("sz=") === -1) {
                        user.userImage += "?sz=" + pixelSize;
                    } else {
                        user.userImage = user.userImage.replace(/sz=\d+/g, "sz=" + pixelSize);
                    }
                }
                callback(user ? user.userImage : null, error);
            }, userID);
        },
        requestFriends: function(callback, userId) {
            var params = {
                orderBy: "best"
            };
            var playerId = userId || "me";
            this.gapi.client.request({
                path: this.gapi.plusAPI + "/people/" + playerId + "/people/visible",
                params: params,
                callback: function(response) {
                    if (response && !response.error) {
                        var friends = [];
                        for (var i = 0; i < response.items.length; ++i) {
                            friends.push(fromGPPersonToCocoonUser(response.items[i]));
                        }
                        callback(friends);
                    } else {
                        callback([], response ? response.error : null);
                    }
                }
            });
        },
        publishMessage: function(message, callback) {
            if (callback) callback("Not supported... use publishMessageWithDialog method instead");
        },
        publishMessageWithDialog: function(message, callback) {
            if (this.gapi.nativeAvailable) {
                var params = {
                    prefilledText: message.message,
                    mediaUrl: message.mediaURL,
                    mediaTitle: message.linkCaption,
                    mediaDescription: message.linkText,
                    url: message.linkURL
                };
                Cocoon.callNative(this.gapi.nativeExtensionName, "shareMessage", [ params, callback ], true);
            } else {
                var me = this;
                var share = function() {
                    var options = {
                        contenturl: "https://plus.google.com/pages/",
                        contentdeeplinkid: "/pages",
                        clientid: me.gapi.settings.clientId,
                        cookiepolicy: "single_host_origin",
                        prefilltext: message.message,
                        calltoactionlabel: "CREATE",
                        calltoactionurl: "http://plus.google.com/pages/create",
                        calltoactiondeeplinkid: "/pages/create"
                    };
                    gapi.interactivepost.render("sharePost", options);
                };
                if (!gapi.interactivepost) {
                    var script = document.createElement("script");
                    script.type = "text/javascript";
                    script.async = true;
                    script.src = "https://apis.google.com/js/plusone.js";
                    script.onload = function() {
                        share();
                    };
                    document.getElementsByTagName("head")[0].appendChild(script);
                } else {
                    share();
                }
            }
        },
        requestScore: function(callback, params) {
            params = params || {};
            var playerId = params.userID || "me";
            var leaderboardID = params.leaderboardID || this.gapi.settings.defaultLeaderboard;
            if (!leaderboardID) throw "leaderboardID not provided in the params. You can also set the default leaderboard in the init method";
            this.gapi.client.request({
                path: this.gapi.gamesAPI + "/players/" + playerId + "/leaderboards/" + leaderboardID + "/scores/ALL_TIME",
                callback: function(response) {
                    if (response && response.error) {
                        callback(null, response.error);
                    } else if (response && response.items && response.items.length > 0) {
                        var item = response.items[0];
                        var data = new Cocoon.Social.Score(playerId, item.scoreValue, "", "", item.leaderboard_id);
                        callback(data, null);
                    } else {
                        callback(null, null);
                    }
                }
            });
        },
        submitScore: function(score, callback, params) {
            params = params || {};
            var leaderboardID = params.leaderboardID || this.gapi.settings.defaultLeaderboard;
            if (!leaderboardID) throw "leaderboardID not provided in the params. You can also set the default leaderboard in the init method";
            this.gapi.client.request({
                path: this.gapi.gamesAPI + "/leaderboards/" + leaderboardID + "/scores",
                method: "POST",
                params: {
                    score: score
                },
                callback: function(response) {
                    if (callback) {
                        callback(response ? response.error : null);
                    }
                }
            });
        },
        showLeaderboard: function(callback, params) {
            params = params || {};
            var leaderboardID = params.leaderboardID || this.gapi.settings.defaultLeaderboard;
            if (!leaderboardID) throw "leaderboardID not provided in the params. You can also set the default leaderboard in the init method";
            var ios = /(iPad|iPhone|iPod)/gi.test(navigator.userAgent);
            if (!ios && this.gapi.nativeAvailable) {
                var timeScope = params.timeScope || 0;
                Cocoon.callNative(this.gapi.nativeExtensionName, "showLeaderboard", [ leaderboardID, timeScope, callback ], true);
            } else {
                if (!this._leaderboardsTemplate) throw "Please, provide a html template for leaderboards with the setTemplates method";
                var dialog = new Cocoon.Widget.WebDialog();
                var callbackSent = false;
                dialog.show(this._leaderboardsTemplate, function(error) {
                    dialog.closed = true;
                    if (!callbackSent && callback) callback(error);
                });
                var me = this;
                var collection = params.friends ? "SOCIAL" : "PUBLIC";
                var timeSpan = "ALL_TIME";
                if (params.timeScope === Cocoon.Social.TimeScope.WEEK) {
                    timeSpan = "WEEKLY";
                } else if (params.timeScope === Cocoon.Social.TimeScope.TODAY) {
                    timeSpan = "DAILY";
                }
                this.gapi.client.request({
                    path: this.gapi.gamesAPI + "/leaderboards/" + leaderboardID + "/window/" + collection,
                    method: "GET",
                    params: {
                        timeSpan: timeSpan
                    },
                    callback: function(response) {
                        if (dialog.closed) return;
                        if (response.error) {
                            if (callback) {
                                callbackSent = true;
                                callback(response.error);
                                dialog.close();
                            }
                            return;
                        }
                        var scores = [];
                        var items = [];
                        if (response && response.items) {
                            items = response.items.slice(0);
                        }
                        if (response && response.playerScore) {
                            items.push(response.playerScore);
                        }
                        for (var i = 0; i < items.length; ++i) {
                            var item = items[i];
                            var score = fromGPScoreToCocoonScore(item, leaderboardID);
                            score.imageURL += "?sz=50";
                            score.position = item.scoreRank || i + 1;
                            score.me = false;
                            scores.push(score);
                        }
                        var js = "addScores(" + JSON.stringify(scores) + ")";
                        dialog.eval(js);
                    }
                });
            }
        },
        prepareAchievements: function(reload, callback) {
            if (!this._cachedAchievements || reload) {
                var me = this;
                this.gapi.client.request({
                    path: this.gapi.gamesAPI + "/achievements",
                    callback: function(response) {
                        if (response && !response.error) {
                            var achievements = [];
                            if (response && response.items) {
                                for (var i = 0; i < response.items.length; i++) {
                                    achievements.push(fromGPAchievementToCocoonAchievement(response.items[i]));
                                }
                            }
                            me.setCachedAchievements(achievements);
                            callback(achievements, null);
                        } else {
                            callback([], response ? response.error : null);
                        }
                    }
                });
            } else {
                callback(this._cachedAchievements, null);
            }
        },
        requestAllAchievements: function(callback) {
            this.prepareAchievements(true, callback);
        },
        requestAchievements: function(callback, userID) {
            var me = this;
            this.prepareAchievements(false, function(allAchievements, error) {
                if (error) {
                    callback([], error);
                    return;
                }
                var playerID = userID || "me";
                me.gapi.client.request({
                    path: me.gapi.gamesAPI + "/players/" + playerID + "/achievements",
                    params: {
                        state: "UNLOCKED"
                    },
                    callback: function(response) {
                        if (response && !response.error) {
                            var achievements = [];
                            if (response.items) {
                                for (var i = 0; i < response.items.length; i++) {
                                    var ach = me.findAchievement(response.items[i].id);
                                    if (ach) achievements.push(ach);
                                }
                            }
                            callback(achievements, null);
                        } else {
                            callback([], response ? response.error : null);
                        }
                    }
                });
            });
        },
        submitAchievement: function(achievementID, callback) {
            if (achievementID === null || typeof achievementID === "undefined") throw "No achievementID specified";
            var achID = this.translateAchievementID(achievementID);
            if (this.gapi.nativeAvailable) {
                var showNotification = !!this.gapi.settings.showAchievementNotifications;
                Cocoon.callNative(this.gapi.nativeExtensionName, "unlockAchievement", [ achID, showNotification, callback ], true);
            } else {
                this.gapi.client.request({
                    path: this.gapi.gamesAPI + "/achievements/" + achID + "/unlock",
                    method: "POST",
                    callback: function(response) {
                        if (callback) {
                            callback(response ? response.error : null);
                        }
                    }
                });
            }
        },
        resetAchievements: function(callback) {
            this.gapi.client.request({
                path: "/games/v1management/achievements/reset",
                method: "POST",
                callback: function(response) {
                    if (callback) {
                        callback(response ? response.error : null);
                    }
                }
            });
        },
        showAchievements: function(callback) {
            var ios = /(iPad|iPhone|iPod)/gi.test(navigator.userAgent);
            if (!ios && this.gapi.nativeAvailable) {
                Cocoon.callNative(this.gapi.nativeExtensionName, "showAchievements", [ callback ], true);
            } else {
                Cocoon.Social.SocialGamingServiceGooglePlayGames.superclass.showAchievements.call(this);
            }
        }
    };
    Cocoon.extend(Cocoon.Social.SocialGamingServiceGooglePlayGames, Cocoon.Social.SocialGamingService);
    function fromGPPlayerToCocoonUser(gpPlayer) {
        return new Cocoon.Social.User(gpPlayer.playerId, gpPlayer.displayName, gpPlayer.avatarImageUrl);
    }
    function fromGPPersonToCocoonUser(gpUser) {
        var avatar = gpUser.image ? gpUser.image.url : "";
        avatar = avatar.replace(/sz=\d+/g, "sz=100");
        return new Cocoon.Social.User(gpUser.id, gpUser.displayName, avatar);
    }
    function fromImageSizeToGPSize(imageSize) {
        if (imageSize === Cocoon.Social.ImageSize.THUMB) {
            return 100;
        } else if (imageSize === Cocoon.Social.ImageSize.MEDIUM) {
            return 200;
        } else if (imageSize === Cocoon.Social.ImageSize.LARGE) {
            return 512;
        }
    }
    function fromGPAchievementToCocoonAchievement(gpItem) {
        var result = new Cocoon.Social.Achievement(gpItem.id, gpItem.name, gpItem.description, gpItem.revealedIconUrl, 0);
        result.gpAchievementData = gpItem;
        return result;
    }
    function fromGPScoreToCocoonScore(gpItem, leaderboardID) {
        return new Cocoon.Social.Score(gpItem.player.playerId, gpItem.scoreValue, gpItem.player.displayName, gpItem.player.avatarImageUrl, leaderboardID);
    }
    return extension;
});

Cocoon.define("Cocoon.Social", function(extension) {
    extension.GameCenterExtension = function() {
        this.nativeExtensionName = "IDTK_SRV_GAMECENTER";
        this.extensionName = "Social.GameCenter";
        this.nativeAvailable = !!window.ext && !!window.ext[this.nativeExtensionName];
        var me = this;
        if (this.nativeAvailable) {
            this.onGameCenterLoginStateChanged = new Cocoon.EventHandler(this.nativeExtensionName, this.extensionName, "onGameCenterLoginStateChanged");
            this.onGameCenterLoginStateChanged.addEventListener(function(localPlayer, error) {
                me._currentPlayer = localPlayer;
            });
        }
        return this;
    };
    extension.GameCenterExtension.prototype = {
        _currentPlayer: null,
        getSocialInterface: function() {
            if (!this._socialService) {
                this._socialService = new Cocoon.Social.SocialGamingServiceGameCenter(this);
            }
            return this._socialService;
        },
        getMultiplayerInterface: function() {
            return Cocoon.Multiplayer.GameCenter;
        },
        isLoggedIn: function() {
            return this._currentPlayer && this._currentPlayer.isAuthenticated;
        },
        login: function(callback) {
            var me = this;
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "login", [ function(response, error) {
                    me._currentPlayer = response;
                    if (callback) {
                        callback(response, error);
                    }
                } ], true);
            } else {
                throw "Game Center not available";
            }
        },
        getLocalPlayer: function() {
            if (this._currentPlayer) return this._currentPlayer;
            if (this.nativeAvailable) {
                this._currentPlayer = Cocoon.callNative(this.nativeExtensionName, "getLocalPlayer", []);
                return this._currentPlayer;
            } else {
                throw "Game Center not available";
            }
        },
        loadPlayers: function(playerIDs, callback) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "loadPlayers", [ playerIDs, callback ], true);
            } else {
                throw "Game Center not available";
            }
        },
        loadFriends: function(callback) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "loadFriends", [ callback ], true);
            } else {
                throw "Game Center not available";
            }
        },
        loadAchievements: function(callback) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "loadAchievements", [ callback ], true);
            } else {
                throw "Game Center not available";
            }
        },
        loadAchievementDescriptions: function(callback) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "loadAchievementDescriptions", [ callback ], true);
            } else {
                throw "Game Center not available";
            }
        },
        loadScores: function(callback, query) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "loadScores", [ query, callback ], true);
            } else {
                throw "Game Center not available";
            }
        },
        submitScore: function(score, callback) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "submitScore", [ score, callback ], true);
            } else {
                throw "Game Center not available";
            }
        },
        submitAchievements: function(achievements, callback) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "submitAchievements", [ achievements, callback ], true);
            } else {
                throw "Game Center not available";
            }
        },
        resetAchievements: function(callback) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "resetAchievements", [ callback ], true);
            } else {
                throw "Game Center not available";
            }
        },
        showAchievements: function(callback) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "showAchievements", [ callback ], true);
            } else {
                throw "Game Center not available";
            }
        },
        showLeaderboards: function(callback, query) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "showLeaderboards", [ query, callback ], true);
            } else {
                throw "Game Center not available";
            }
        }
    };
    extension.GameCenter = new extension.GameCenterExtension();
    extension.GameCenter.Player = function() {
        this.playerID = "";
        this.alias = "";
        this.isFriend = false;
    };
    extension.GameCenter.LocalPlayer = function() {
        this.playerID = "";
        this.alias = "";
        this.isAuthenticated = false;
    };
    extension.GameCenter.Achievement = function(identifier, percentComplete) {
        this.identifier = identifier;
        this.percentComplete = percentComplete;
        this.lastReportedDate = 0;
    };
    extension.GameCenter.AchievementDescription = function() {
        this.identifier = "";
        this.title = "";
        this.achievedDescription = "";
        this.unachievedDescription = "";
        this.maximumPoints = 0;
    };
    extension.GameCenter.Score = function(userID, score, userName, imageURL, leaderboardID, originalScoreObject) {
        this.userID = userID;
        this.score = score || 0;
        this.userName = userName;
        this.imageURL = imageURL;
        this.leaderboardID = leaderboardID;
        this.rank = originalScoreObject.rank;
        this.originalScoreObject = originalScoreObject;
        return this;
    };
    extension.GameCenter.Leaderboard = function(category, playerIDs, timeScope, playerScope, rangeStart, rangeLength) {
        this.category = category;
        this.playerIDs = playerIDs;
        this.timeScope = timeScope;
        this.playerScope = playerScope;
        this.rangeStart = rangeStart;
        this.rangeLength = rangeLength;
        this.scores = [];
        this.localPlayerScore = [];
        this.localizedTitle = localizedTitle;
    };
    extension.GameCenter.TimeScope = {
        TODAY: 0,
        WEEK: 1,
        ALL_TIME: 2
    };
    extension.GameCenter.PlayerScope = {
        GLOBAL: 0,
        FRIENDS: 1
    };
    extension.SocialGamingServiceGameCenter = function(gcExtension) {
        Cocoon.Social.SocialGamingServiceGameCenter.superclass.constructor.call(this);
        this.gc = gcExtension;
        var me = this;
        this.gc.onGameCenterLoginStateChanged.addEventListener(function(localPlayer, error) {
            me.onLoginStatusChanged.notifyEventListeners(localPlayer.isAuthenticated, error);
        });
        return this;
    };
    extension.SocialGamingServiceGameCenter.prototype = {
        _cachedAchievements: null,
        isLoggedIn: function() {
            return this.gc.isLoggedIn();
        },
        login: function(callback) {
            this.gc.login(function(localPlayer, error) {
                if (callback) callback(localPlayer.isAuthenticated, error);
            });
        },
        logout: function(callback) {
            if (callback) callback({
                message: "User has to logout from the Game Center APP"
            });
        },
        getLoggedInUser: function() {
            return fromGCPLayerToCocoonUser(this.gc._currentPlayer ? this.gc._currentPlayer : this.gc.getLocalPlayer());
        },
        requestUser: function(callback, userId) {
            if (userId) {
                this.gc.loadPlayers([ userId ], function(response, error) {
                    var user = response && response.length ? fromGCPLayerToCocoonUser(response[0]) : null;
                    callback(user, error);
                });
            } else {
                var me = this;
                setTimeout(function() {
                    callback(me.getLoggedInUser());
                });
            }
        },
        requestFriends: function(callback, userId) {
            this.gc.loadFriends(function(friends, error) {
                var users = [];
                if (friends && friends.length) {
                    for (var i = 0; i < friends.length; ++i) {
                        users.push(fromGCPLayerToCocoonUser(friends[i]));
                    }
                }
                callback(users, error);
            });
        },
        requestScore: function(callback, params) {
            var query = {};
            var options = params || {};
            if (options.leaderboardID) query.category = options.leaderboardID;
            query.playerIDs = [ options.userID || this.getLoggedInUser().userID ];
            this.gc.loadScores(function(response, error) {
                var gcScore = null;
                if (options.userID && response && response.scores && response.scores.length) gcScore = response.scores[0]; else if (response && response.localPlayerScore) gcScore = response.localPlayerScore;
                var loadedScore = gcScore ? new Cocoon.Social.GameCenter.Score(gcScore.playerID, gcScore.value, "", "", gcScore.category, gcScore) : null;
                callback(loadedScore, error);
            }, query);
        },
        submitScore: function(score, callback, params) {
            var options = params || {};
            this.gc.submitScore({
                value: score,
                category: options.leaderboardID || ""
            }, function(error) {
                if (callback) callback(error);
            });
        },
        showLeaderboard: function(callback, params) {
            var options = params || {};
            this.gc.showLeaderboards(function(error) {
                if (callback) callback(error);
            }, {
                category: options.leaderboardID || ""
            });
        },
        prepareAchievements: function(reload, callback) {
            if (!this._cachedAchievements || reload) {
                var me = this;
                this.gc.loadAchievementDescriptions(function(response, error) {
                    if (error) {
                        callback([], error);
                    } else {
                        var achievements = [];
                        if (response && response.length) {
                            for (var i = 0; i < response.length; i++) {
                                achievements.push(fromGCAchievementDescriptionToCocoonAchievement(response[i]));
                            }
                        }
                        me.setCachedAchievements(achievements);
                        callback(achievements, null);
                    }
                });
            } else {
                callback(this._cachedAchievements, null);
            }
        },
        requestAllAchievements: function(callback) {
            this.prepareAchievements(true, callback);
        },
        requestAchievements: function(callback, userID) {
            var me = this;
            this.prepareAchievements(false, function(allAchievements, error) {
                if (error) {
                    callback([], error);
                    return;
                }
                me.gc.loadAchievements(function(response, error) {
                    if (!error) {
                        var achievements = [];
                        if (response && response.length) {
                            for (var i = 0; i < response.length; i++) {
                                var ach = me.findAchievement(response[i].identifier);
                                if (ach) achievements.push(ach);
                            }
                        }
                        callback(achievements, null);
                    } else {
                        callback([], response.error);
                    }
                });
            });
        },
        submitAchievement: function(achievementID, callback) {
            if (achievementID === null || typeof achievementID === "undefined") throw "No achievementID specified";
            var achID = this.translateAchievementID(achievementID);
            this.gc.submitAchievements([ {
                identifier: achID,
                percentComplete: 100
            } ], callback);
        },
        resetAchievements: function(callback) {
            this.gc.resetAchievements(callback);
        },
        showAchievements: function(callback) {
            this.gc.showAchievements(function(error) {
                if (callback) callback(error);
            });
        }
    };
    Cocoon.extend(extension.SocialGamingServiceGameCenter, extension.SocialGamingService);
    function fromGCPLayerToCocoonUser(player) {
        return new Cocoon.Social.User(player.playerID, player.alias);
    }
    function fromGCAchievementDescriptionToCocoonAchievement(ach) {
        return new Cocoon.Social.GameCenter.Achievement(ach.identifier, ach.title, ach.achievedDescription, "", ach.maximumPoints);
    }
    return extension;
});

Cocoon.define("Cocoon.Social", function(extension) {
    extension.FacebookExtension = function() {
        this.nativeExtensionName = "IDTK_SRV_FACEBOOK";
        this.extensionName = "Social.Facebook";
        this.nativeAvailable = !!window.ext && !!window.ext[this.nativeExtensionName];
        this.Event = new Cocoon.Social.FacebookEvent(this.nativeAvailable);
        var me = this;
        if (this.nativeAvailable) {
            this.onFacebookSessionStateChanged = new Cocoon.EventHandler(this.nativeExtensionName, this.extensionName, "onFacebookSessionStateChanged");
            Cocoon.Social.Facebook = this;
            this.onFacebookSessionStateChanged.addEventListener(function(session, error) {
                var data = fromCocoonFBSessionToFBAPISession(session, error);
                if (session.state == 0) {
                    me.Event.notify("auth.login", data);
                }
                me.Event.notify("auth.authResponseChange", data);
                me.Event.notify("auth.statusChange", data);
            });
        }
        return this;
    };
    extension.FacebookExtension.prototype = {
        _currentSession: null,
        _appId: null,
        _socialService: null,
        init: function(options) {
            if (!options || !options.appId) {
                throw "appId must be specified!";
            }
            this._appId = options.appId;
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "init", [ options ], true);
            } else {
                FB.init(options);
            }
            var me = this;
            this.Event.subscribe("auth.authResponseChange", function(session) {
                me._currentSession = session;
                if (session.authResponse && !session.authResponse.user) {
                    me.api("me?fields=username", function(response) {
                        me._currentSession.authResponse.user = response;
                    });
                }
            });
        },
        getSocialInterface: function() {
            if (!this._appId) {
                throw "You must call init() before getting the Social Interface";
            }
            if (!this._socialService) {
                this._socialService = new Cocoon.Social.SocialGamingServiceFacebook(this);
            }
            return this._socialService;
        },
        login: function(callback, options) {
            var me = this;
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "login", [ options, function(response, error) {
                    me._currentSession = fromCocoonFBSessionToFBAPISession(response, error);
                    if (callback) {
                        callback(me._currentSession);
                    }
                } ], true);
            } else {
                FB.login(function(response) {
                    me._currentSession = response;
                    if (callback) callback(response);
                }, options);
            }
        },
        logout: function(callback) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "logout", [ function(response, error) {
                    if (callback) {
                        callback(fromCocoonFBSessionToFBAPISession(response, error));
                    }
                } ], true);
            } else {
                FB.logout(function(response) {
                    if (callback) {
                        callback(response);
                    }
                });
            }
        },
        getAuthResponse: function() {
            if (this.nativeAvailable) {
                var response = Cocoon.callNative(this.nativeExtensionName, "getFacebookSession", []);
                return fromCocoonFBSessionToFBAPISession(response);
            } else {
                return FB.getAuthResponse();
            }
        },
        getLoginStatus: function(callback, force) {
            if (this.nativeAvailable) {
                var me = this;
                setTimeout(function() {
                    var response = Cocoon.callNative(me.nativeExtensionName, "getFacebookSession", []);
                    if (callback) {
                        callback(fromCocoonFBSessionToFBAPISession(response));
                    }
                }, 50);
            } else {
                FB.getLoginStatus(callback, force);
            }
        },
        api: function(path, method, params, cb) {
            if (this.nativeAvailable) {
                var openGraph = arguments[0];
                var httpMethod = arguments.length > 3 ? arguments[1] : "GET";
                var options = null;
                if (arguments.length == 3) options = arguments[1];
                if (arguments.length == 4) options = arguments[2];
                var callback = arguments.length > 1 ? arguments[arguments.length - 1] : function() {};
                return Cocoon.callNative(this.nativeExtensionName, "api", [ openGraph, httpMethod, options, callback ], true);
            } else {
                FB.api(path, method, params, cb);
            }
        },
        ui: function(params, cb) {
            if (this.nativeAvailable) {
                var params = arguments[0];
                var callback = arguments.length > 1 ? arguments[1] : function() {};
                return Cocoon.callNative(this.nativeExtensionName, "ui", [ params, callback ], true);
            } else if (!navigator.isCocoonJS) {
                FB.ui(params, cb);
            }
        },
        requestAdditionalPermissions: function(permissionsType, permissions, callback) {
            if (this.nativeAvailable) {
                var permsArray = permissions.split(",");
                Cocoon.callNative(this.nativeExtensionName, "requestAdditionalPermissions", [ permissionsType, permsArray, function(session, error) {
                    if (callback) {
                        callback(fromCocoonFBSessionToFBAPISession(session, error));
                    }
                } ], true);
            } else {
                FB.login(callback, {
                    scope: permissions
                });
            }
        },
        getPermissions: function(callback) {
            this.api("me/permissions", function(response) {
                callback(response.data && response.data[0] ? response.data[0] : {});
            });
        },
        showShareDialog: function(params, callback) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "showShareDialog", [ params, callback ], true);
            } else {
                params.method = "feed";
                FB.ui(params, callback);
            }
        },
        uploadPhoto: function(file, callback) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "uploadPhoto", [ file, callback ], true);
            } else {
                callback({
                    error: {
                        message: "Not implemented"
                    }
                });
            }
        },
        showFriendPicker: function(callback) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "showFriendPicker", [ callback ], true);
            } else {
                callback({
                    error: {
                        message: "Not implemented"
                    }
                });
            }
        }
    };
    extension.FacebookEvent = function(nativeAvailable) {
        this.nativeAvailable = nativeAvailable;
        return this;
    };
    extension.FacebookEvent.prototype = {
        subscribe: function(name, callback) {
            if (this.nativeAvailable) {
                var eventKey = name + "listeners";
                this[eventKey] = this[eventKey] || [];
                this[eventKey].push(callback);
            } else if (!navigator.isCocoonJS) {
                FB.Event.subscribe(name, callback);
            }
        },
        unsubscribe: function(name, callback) {
            if (this.nativeAvailable) {
                var eventKey = name + "listeners";
                var array = this[eventKey];
                if (array) {
                    var index = array.indexOf(callback);
                    if (index !== -1) {
                        array.splice(index, 1);
                    }
                }
            } else if (!navigator.isCocoonJS) {
                FB.Event.unsubscribe(name, callback);
            }
        },
        notify: function(name, param) {
            var eventKey = name + "listeners";
            var array = this[eventKey];
            if (array) {
                for (var i = 0; i < array.length; ++i) {
                    array[i](param);
                }
            }
        }
    };
    extension.Facebook = new extension.FacebookExtension();
    function fromCocoonFBStatusToFBAPIState(state) {
        if (state === 0) {
            return "connected";
        } else if (state === 1) {
            return "not_authorized";
        } else {
            return "unknown";
        }
    }
    function fromCocoonFBSessionToFBAPISession(response, error) {
        var authResponse = null;
        if (response.state === 0) {
            authResponse = {
                accessToken: response.accessToken,
                expirationDate: response.expirationDate,
                userID: response.user ? response.userID : null,
                permissions: response.permissions,
                user: response.user
            };
        }
        return {
            status: fromCocoonFBStatusToFBAPIState(response.state),
            authResponse: authResponse,
            error: error
        };
    }
    extension.SocialGamingServiceFacebook = function(fbExtension) {
        Cocoon.Social.SocialGamingServiceFacebook.superclass.constructor.call(this);
        this.fb = fbExtension;
        var me = this;
        this.fb.Event.subscribe("auth.authResponseChange", function(session) {
            me.onLoginStatusChanged.notifyEventListeners(session.status == "connected", session.error);
        });
        return this;
    };
    extension.SocialGamingServiceFacebook.prototype = {
        currentPermissions: null,
        isLoggedIn: function() {
            return this.fb._currentSession && this.fb._currentSession.status === "connected";
        },
        login: function(callback) {
            var me = this;
            this.fb.login(function(response) {
                if (callback) callback(me.isLoggedIn(), response.error);
            });
        },
        logout: function(callback) {
            this.fb.logout(function(response) {
                if (callback) callback(response.error);
            });
        },
        getLoggedInUser: function() {
            var authResponse = this.fb._currentSession ? this.fb._currentSession.authResponse : null;
            if (authResponse && authResponse.user) {
                return fromFBUserToCocoonUser(authResponse.user);
            } else if (authResponse && authResponse.userID) {
                return new Cocoon.Social.Facebook.User(authResponse.userID, "Loading...");
            }
            return null;
        },
        hasPublishPermissions: function(callback) {
            this.fb.getPermissions(function(perms, error) {
                callback(perms.publish_actions, error);
            });
        },
        requestPublishPermissions: function(callback) {
            var me = this;
            this.fb.requestAdditionalPermissions("publish", "publish_actions", function(response) {
                if (response.error) callback(false, error); else {
                    me.hasPublishPermissions(function(granted, error) {
                        callback(granted, error);
                    });
                }
            });
        },
        requestUser: function(calback, userId) {
            var apiCall = userId || "me";
            this.fb.api(apiCall, function(response) {
                var user = response.error ? null : fromFBUserToCocoonUser(response);
                calback(user, response.error);
            });
        },
        requestUserImage: function(callback, userID, imageSize) {
            if (!userID && this.isLoggedIn()) {
                userID = this.fb._currentSession.authResponse.userID;
            }
            var fbPictureSize = "small";
            if (imageSize === Cocoon.Social.ImageSize.THUMB) {
                fbPictureSize = "square";
            } else if (imageSize === Cocoon.Social.ImageSize.MEDIUM) {
                fbPictureSize = "normal";
            } else if (imageSize === Cocoon.Social.ImageSize.LARGE) {
                fbPictureSize = "large";
            }
            var url = "https://graph.facebook.com/" + userID + "/picture?type=" + fbPictureSize;
            callback(url);
        },
        requestFriends: function(callback, userId) {
            var apiCall = (userId || "me") + "/friends";
            this.fb.api(apiCall, function(response) {
                var friends = [];
                if (!response.error) {
                    for (var i = 0; i < response.data.length; i++) {
                        friends.push(fromFBUserToCocoonUser(response.data[i]));
                    }
                }
                callback(friends, response.error);
            });
        },
        preparePublishAction: function(callback) {
            if (!this.currentPermissions) {
                var me = this;
                this.fb.getPermissions(function(perms) {
                    me.currentPermissions = perms;
                    if (perms) me.preparePublishAction(callback);
                });
            } else if (this.currentPermissions.publish_actions) {
                callback(true);
            } else {
                this.currentPermissions = null;
                this.fb.requestAdditionalPermissions("publish", "publish_actions", function(response) {
                    callback(response.error ? false : true);
                });
            }
        },
        publishMessage: function(message, callback) {
            this.preparePublishAction(function(granted) {
                if (granted) {
                    var params = fromCocoonMessageToFBMessage(message);
                    var apiCall = "me/feed";
                    this.fb.api(apiCall, params, function(response) {
                        if (callback) callback(response.error);
                    });
                } else {
                    if (callback) callback({
                        message: "No publish_actions permission granted"
                    });
                }
            });
        },
        publishMessageWithDialog: function(message, callback) {
            this.fb.showShareDialog(fromCocoonMessageToFBMessage(message), function(response) {
                if (callback) {
                    callback(response.error);
                }
            });
        },
        requestScore: function(callback, params) {
            var apiCall = (params && params.userID ? params.userID : "me") + "/scores";
            this.fb.api(apiCall, function(response) {
                if (response.error) {
                    callback(null, response.error);
                } else if (response.data && response.data.length > 0) {
                    var data = fromFBScoreToCocoonScore(response.data[0]);
                    callback(data, null);
                } else {
                    callback(null, null);
                }
            });
        },
        submitScore: function(score, callback, params) {
            var me = this;
            this.preparePublishAction(function(granted) {
                if (granted) {
                    me.requestScore(function(currentScore, error) {
                        if (error) {
                            if (callback) callback(error);
                            return;
                        }
                        var topScore = currentScore ? currentScore.score : 0;
                        if (score <= topScore) {
                            if (callback) callback(null);
                            return;
                        }
                        var apiCall = "/" + (params && params.userID ? params.userID : "me") + "/scores";
                        me.fb.api(apiCall, "POST", {
                            score: score
                        }, function(response) {
                            if (callback) callback(response.error);
                        });
                    }, params);
                } else {
                    if (callback) callback({
                        message: "No publish_actions permission granted"
                    });
                }
            });
        },
        showLeaderboard: function(callback, params) {
            if (!this._leaderboardsTemplate) throw "Please, provide a html template for leaderboards with the setTemplates method";
            var dialog = new Cocoon.Widget.WebDialog();
            var callbackSent = false;
            dialog.show(this._leaderboardsTemplate, function(error) {
                dialog.closed = true;
                if (!callbackSent && callback) callback(error);
            });
            var me = this;
            this.fb.api(me.fb._appId + "/scores", function(response) {
                if (dialog.closed) return;
                if (response.error) {
                    if (callback) {
                        callbackSent = true;
                        callback(response.error);
                        dialog.close();
                    }
                    return;
                }
                var scores = [];
                if (response.data && response.data.length) {
                    for (var i = 0; i < response.data.length; ++i) {
                        var score = fromFBScoreToCocoonScore(response.data[i]);
                        score.position = i;
                        score.imageURL = "https://graph.facebook.com/" + score.userID + "/picture";
                        score.me = score.userID === me.fb._currentSession.authResponse.userID;
                        scores.push(score);
                    }
                }
                var js = "addScores(" + JSON.stringify(scores) + ")";
                dialog.eval(js);
            });
        },
        prepareAchievements: function(reload, callback) {
            if (!this._cachedAchievements || reload) {
                var me = this;
                this.fb.api(this.fb._appId + "/achievements", function(response) {
                    if (!response.error) {
                        var achievements = [];
                        if (response.data) {
                            for (var i = 0; i < response.data.length; i++) {
                                achievements.push(fromFBAchievementToCocoonAchievement(response.data[i]));
                            }
                        }
                        me.setCachedAchievements(achievements);
                        callback(achievements, null);
                    } else {
                        callback([], response.error);
                    }
                });
            } else {
                callback(this._cachedAchievements, null);
            }
        },
        requestAllAchievements: function(callback) {
            this.prepareAchievements(true, callback);
        },
        requestAchievements: function(callback, userID) {
            var me = this;
            this.prepareAchievements(false, function(allAchievements, error) {
                if (error) {
                    callback([], error);
                    return;
                }
                var apiCall = (userID || "me") + "/achievements";
                me.fb.api(apiCall, function(response) {
                    if (!response.error) {
                        var achievements = [];
                        if (response.data) {
                            for (var i = 0; i < response.data.length; i++) {
                                var ach = me.findAchievement((response.data[i].achievement || response.data[i].data.achievement).id);
                                if (ach) achievements.push(ach);
                            }
                        }
                        callback(achievements, null);
                    } else {
                        callback([], response.error);
                    }
                });
            });
        },
        submitAchievement: function(achievementID, callback) {
            if (achievementID === null || typeof achievementID === "undefined") throw "No achievementID specified";
            var achID = this.translateAchievementID(achievementID);
            var me = this;
            this.preparePublishAction(function(granted) {
                if (granted) {
                    me.fb.api("me/achievements", "POST", {
                        achievement: achID
                    }, function(response) {
                        if (callback) {
                            callback(response.error);
                        }
                    });
                } else {
                    if (callback) callback({
                        message: "No publish_actions permission granted"
                    });
                }
            });
        },
        resetAchievements: function(callback) {
            var me = this;
            this.preparePublishAction(function(granted) {
                if (granted) {
                    me.requestAchievements(function(achievements, error) {
                        if (error) {
                            if (callback) callback(error);
                            return;
                        }
                        var someError = null;
                        var remaining = achievements.length;
                        for (var i = 0; i < achievements.length; ++i) {
                            me.fb.api("me/achievements", "DELETE", {
                                achievement: achievements[i].fbAchievementData.url
                            }, function(response) {
                                if (response.error) {
                                    someError = response.error;
                                }
                                remaining--;
                                if (remaining == 0 && callback) {
                                    callback(someError);
                                }
                            });
                        }
                    });
                } else {
                    if (callback) callback({
                        message: "No publish_actions permission granted"
                    });
                }
            });
        },
        showAchievements: function(callback) {
            if (!this._achievementsTemplate) throw "Please, provide a html template for achievements with the setTemplates method";
            var dialog = new Cocoon.Widget.WebDialog();
            var callbackSent = false;
            dialog.show(this._achievementsTemplate, function(error) {
                dialog.closed = true;
                if (!callbackSent && callback) callback(error);
            });
            var me = this;
            this.requestAchievements(function(achievements, error) {
                if (dialog.closed) return;
                if (error) {
                    callbackSent = true;
                    if (callback) callback(error);
                    return;
                }
                var achs = [];
                if (me._cachedAchievements) {
                    for (var i = 0; i < me._cachedAchievements.length; ++i) {
                        var ach = me._cachedAchievements[i];
                        achs.push(ach);
                        if (achievements && achievements.length) {
                            for (var j = 0; j < achievements.length; ++j) {
                                if (achievements[j].achievementID === ach.achievementID) {
                                    ach.achieved = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                var js = "addAchievements(" + JSON.stringify(achs) + ");";
                dialog.eval(js);
            });
        }
    };
    Cocoon.extend(extension.SocialGamingServiceFacebook, extension.SocialGamingService);
    function fromFBUserToCocoonUser(facebookUser) {
        return new Cocoon.Social.User(facebookUser.id, facebookUser.username ? facebookUser.username : facebookUser.first_name + " " + facebookUser.last_name);
    }
    function fromCocoonMessageToFBMessage(message) {
        return {
            link: message.linkURL,
            description: message.message,
            name: message.linkText,
            caption: message.linkCaption,
            picture: message.mediaURL
        };
    }
    function fromFBScoreToCocoonScore(fbResponse, requestScoreParams) {
        var result = new Cocoon.Social.Score(fbResponse.user.id, fbResponse.score, fbResponse.user.name);
        if (requestScoreParams) {
            result.leaderboardID = requestScoreParams.leaderboardID;
        }
        result.imageURL = "https://graph.facebook.com/" + fbResponse.user.id + "/picture";
        return result;
    }
    function fromFBAchievementToCocoonAchievement(fbResponse) {
        var result = new Cocoon.Social.Achievement(fbResponse.id, fbResponse.title, fbResponse.description, fbResponse.image[0].url, fbResponse.data.points);
        result.fbAchievementData = fbResponse;
        return result;
    }
    if (!navigator.isCocoonJS && !(typeof module !== "undefined" && module.exports)) {
        var parent = document.getElementsByTagName("script")[0];
        var script = document.createElement("script");
        var prot = location.protocol ? location.protocol : "http:";
        script.src = prot + "//connect.facebook.net/en_US/all.js";
        parent.parentNode.insertBefore(script, parent);
    }
    return extension;
});

Cocoon.define("Cocoon.Multiplayer", function(extension) {
    extension.MultiplayerService = function(nativeExtensionName, extensionName) {
        this.nativeExtensionName = nativeExtensionName;
        this.extensionName = extensionName;
        this.nativeAvailable = !!window.ext && !!window.ext[this.nativeExtensionName];
        var me = this;
        this.onInvitationReceived = new Cocoon.EventHandler(this.nativeExtensionName, this.extensionName, "onInvitationReceived");
        this.onInvitationLoaded = new Cocoon.EventHandler(this.nativeExtensionName, this.extensionName, "onInvitationLoaded", function(sourceListener, args) {
            var matchID = args[0];
            var error = args[1];
            if (matchID && !error) {
                me.currentMatch = new Cocoon.Multiplayer.Match(me.nativeExtensionName, me.extensionName, matchID);
                sourceListener(me.currentMatch, null);
            } else {
                sourceListener(null, error);
            }
        });
        var signal = new Cocoon.Signal.createSignal();
        signal.register("invitation", {
            received: this.onInvitationReceived,
            loaded: this.onInvitationLoaded
        });
        this.on = signal.expose();
        return this;
    };
    extension.MultiplayerService.prototype = {
        currentMatch: null,
        findMatch: function(matchRequest, callback) {
            var me = this;
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "findMatch", [ matchRequest, function(matchID, error) {
                    if (matchID && !error) {
                        me.currentMatch = new Cocoon.Multiplayer.Match(me.nativeExtensionName, me.extensionName, matchID);
                        callback(me.currentMatch, null);
                    } else {
                        callback(null, error);
                    }
                } ], true);
            }
        },
        findAutoMatch: function(matchRequest, callback) {
            var me = this;
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "findAutoMatch", [ matchRequest, function(matchID, error) {
                    if (matchID && !error) {
                        me.currentMatch = new Cocoon.Multiplayer.Match(me.nativeExtensionName, me.extensionName, matchID);
                        callback(me.currentMatch, null);
                    } else {
                        callback(null, error);
                    }
                } ], true);
            }
        },
        cancelAutoMatch: function() {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "cancelAutoMatch", [], true);
            }
        },
        addPlayersToMatch: function(matchRequest, match, callback) {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "addPlayersToMatch", [ matchRequest, match.matchID, callback ], true);
            }
        },
        getMatch: function() {
            return this.currentMatch;
        }
    };
    extension.Match = function(nativeExtensionName, extensionName, matchID) {
        if (typeof nativeExtensionName !== "string") throw "The given native extension name '" + nativeExtensionName + "' is not a string.";
        if (typeof extensionName !== "string") throw "The given extension name '" + nativeExtensionName + "' is not a string.";
        this.nativeExtensionName = nativeExtensionName;
        this.extensionName = extensionName;
        this.nativeAvailable = Cocoon.nativeAvailable && typeof window.ext[nativeExtensionName] !== "undefined";
        this.matchID = matchID;
        var me = this;
        this.onMatchDataReceived = new Cocoon.EventHandler(this.nativeExtensionName, this.extensionName, "onMatchDataReceived", function(sourceListener, args) {
            if (me.matchID === args[0]) {
                sourceListener(me, args[1], args[2]);
            }
        });
        this.onMatchStateChanged = new Cocoon.EventHandler(this.nativeExtensionName, this.extensionName, "onMatchStateChanged", function(sourceListener, args) {
            if (me.matchID === args[0]) {
                sourceListener(me, args[1], args[2]);
            }
        });
        this.onMatchConnectionWithPlayerFailed = new Cocoon.EventHandler(this.nativeExtensionName, this.extensionName, "onMatchConnectionWithPlayerFailed", function(sourceListener, args) {
            if (me.matchID === args[0]) {
                sourceListener(me, args[1], args[2]);
            }
        });
        this.onMatchFailed = new Cocoon.EventHandler(this.nativeExtensionName, this.extensionName, "onMatchFailed", function(sourceListener, args) {
            if (me.matchID === args[0]) {
                sourceListener(me, args[1]);
            }
        });
        var signal = new Cocoon.Signal.createSignal();
        signal.register("match", {
            dataReceived: this.onMatchDataReceived,
            stateChanged: this.onMatchStateChanged,
            connectionWithPlayerFailed: this.onMatchConnectionWithPlayerFailed,
            failed: this.onMatchFailed
        });
        this.on = signal.expose();
    };
    extension.Match.prototype = {
        start: function() {
            if (this.nativeAvailable) {
                Cocoon.callNative(this.nativeExtensionName, "startMatch", [ this.matchID ], true);
            }
        },
        sendDataToAllPlayers: function(data, sendMode) {
            if (this.nativeAvailable) {
                return Cocoon.callNative(this.nativeExtensionName, "sendDataToAllPlayers", [ this.matchID, data, sendMode ]);
            }
        },
        sendData: function(data, playerIDs, sendMode) {
            if (this.nativeAvailable) {
                return Cocoon.callNative(this.nativeExtensionName, "sendData", [ this.matchID, data, playerIDs, sendMode ]);
            }
        },
        disconnect: function() {
            if (this.nativeAvailable) {
                return Cocoon.callNative(this.nativeExtensionName, "disconnect", [ this.matchID ], true);
            }
        },
        requestPlayersInfo: function(callback) {
            if (this.nativeAvailable) {
                return Cocoon.callNative(this.nativeExtensionName, "requestPlayersInfo", [ this.matchID, callback ], true);
            }
        },
        getExpectedPlayerCount: function() {
            if (this.nativeAvailable) {
                return Cocoon.callNative(this.nativeExtensionName, "getExpectedPlayerCount", [ this.matchID ]);
            }
        },
        getPlayerIDs: function() {
            if (this.nativeAvailable) {
                return Cocoon.callNative(this.nativeExtensionName, "getPlayerIDs", [ this.matchID ]);
            }
        },
        getLocalPlayerID: function() {
            if (this.nativeAvailable) {
                return Cocoon.callNative(this.nativeExtensionName, "getLocalPlayerID", [ this.matchID ]);
            }
            return "";
        }
    };
    extension.SendDataMode = {
        RELIABLE: 0,
        UNRELIABLE: 1
    };
    extension.ConnectionState = {
        UNKNOWN: 0,
        CONNECTED: 1,
        DISCONNECTED: 2
    };
    extension.PlayerInfo = function(userID, userName) {
        this.userID = userID;
        this.userName = userName;
    };
    extension.MatchRequest = function(minPlayers, maxPlayers, playersToInvite, playerGroup, playerAttributes) {
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.playersToInvite = playersToInvite;
        this.playerGroup = playerGroup;
        this.playerAttributes = playerAttributes;
        return this;
    };
    return extension;
});

Cocoon.define("Cocoon.Multiplayer", function(extension) {
    var loopbackServices = [];
    var indexCounter = 0;
    var matchServices = [];
    var matchCounter = 0;
    extension.LoopbackService = function() {
        Cocoon.Multiplayer.LoopbackService.superclass.constructor.call(this, "dummy", "dummy");
        loopbackServices.push(this);
        this.playerID = "" + indexCounter;
        indexCounter++;
    };
    extension.LoopbackService.prototype = {
        findMatch: function(request, callback) {
            this.findMatchCallback = callback;
            var exists = false;
            for (var i = 0; i < matchServices.length; ++i) {
                if (matchServices[i] === this) {
                    exists = true;
                    break;
                }
            }
            if (!exists) matchServices.push(this);
            if (matchServices.length >= request.minPlayers) {
                var playerIDs = [];
                for (var i = 0; i < matchServices.length; ++i) {
                    playerIDs.push(matchServices[i].getPlayerID());
                }
                for (var i = 0; i < matchServices.length; ++i) {
                    var match = new LoopbackMatch(matchServices[i]);
                    match.playerIDs = playerIDs.slice();
                    matchServices[i].currentMatch = match;
                    matchServices[i].findMatchCallback(match, null);
                }
                matchServices = [];
            }
        },
        findAutoMatch: function(matchRequest, callback) {
            this.findMatch(matchRequest, callback);
        },
        cancelAutoMatch: function() {},
        addPlayersToMatch: function(matchRequest, match, callback) {
            callback({
                message: "Not implemmented"
            });
        },
        getPlayerID: function() {
            return this.playerID;
        },
        getMatch: function() {
            return this.currentMatch;
        }
    };
    Cocoon.extend(extension.LoopbackService, extension.MultiplayerService);
    var LoopbackMatch = function(service) {
        matchCounter++;
        LoopbackMatch.superclass.constructor.call(this, "", "", matchCounter);
        this.started = false;
        this.disconnected = false;
        this.pendingData = [];
        this.service = service;
    };
    LoopbackMatch.prototype = {
        start: function() {
            var me = this;
            setTimeout(function() {
                me.started = true;
                for (var i = 0; i < me.pendingData.length; ++i) {
                    me.onMatchDataReceived.notifyEventListeners(me.matchID, me.pendingData[i].data, me.pendingData[i].player);
                }
            }, 0);
        },
        sendDataToAllPlayers: function(data, sendMode) {
            this.sendData(data, this.playerIDs, sendMode);
        },
        sendData: function(data, playerIDs, sendMode) {
            var me = this;
            setTimeout(function() {
                for (var i = 0; i < loopbackServices.length; ++i) {
                    var destService = null;
                    for (var j = 0; j < playerIDs.length; ++j) {
                        if (playerIDs[j] === loopbackServices[i].getPlayerID()) {
                            destService = loopbackServices[i];
                        }
                    }
                    if (destService) {
                        destService.getMatch().notifyDataReceived(data, me.service.getPlayerID());
                    }
                }
            }, 0);
        },
        disconnect: function() {
            this.disconnected = true;
            for (var i = 0; i < this.playerIDs.length; ++i) {
                var p = this.playerIDs[i];
                for (var j = 0; j < loopbackServices.length; ++j) {
                    if (loopbackServices[j].getPlayerID() === p) {
                        var match = loopbackServices[i].getMatch();
                        if (!match.disconnected) {
                            match.onMatchStateChanged.notifyEventListeners(match, this.service.getPlayerID(), Cocoon.Multiplayer.ConnectionState.DISCONNECTED);
                        }
                    }
                }
            }
        },
        requestPlayersInfo: function(callback) {
            var me = this;
            setTimeout(function() {
                var playersInfo = [];
                for (var i = 0; i < me.playerIDs.length; ++i) {
                    playersInfo[i] = {
                        userID: me.playerIDs[i],
                        userName: "Player" + me.playerIDs[i]
                    };
                }
                callback(playersInfo);
            }, 1);
        },
        getExpectedPlayerCount: function() {
            return 0;
        },
        getPlayerIDs: function() {
            return this.playerIDs;
        },
        getLocalPlayerID: function() {
            return this.service.playerID;
        },
        notifyDataReceived: function(data, fromPlayer) {
            if (!this.started) {
                this.pendingData.push({
                    data: data,
                    player: fromPlayer
                });
            } else {
                this.onMatchDataReceived.notifyEventListeners(this.matchID, data, fromPlayer);
            }
        }
    };
    Cocoon.extend(LoopbackMatch, Cocoon.Multiplayer.Match);
    return extension;
});

Cocoon.define("Cocoon.Multiplayer", function(extension) {
    extension.GooglePlayGames = new Cocoon.Multiplayer.MultiplayerService("IDTK_SRV_MULTIPLAYER_GPG", "Multiplayer.GooglePlayGames");
    return extension;
});

Cocoon.define("Cocoon.Multiplayer", function(extension) {
    extension.GameCenter = new Cocoon.Multiplayer.MultiplayerService("IDTK_SRV_MULTIPLAYER_GAMECENTER", "Multiplayer.GameCenter");
    return extension;
});

(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f;
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
})({
    1: [ function(require, module, exports) {
        module.exports = {
            img: [ "buttons/care.down.png", "buttons/care.png", "buttons/down.png", "buttons/gear.down.png", "buttons/gear.png", "buttons/minus.png", "buttons/plus.null.png", "buttons/plus.png", "buttons/start-race.down.png", "buttons/start-race.png", "buttons/train.down.png", "buttons/train.png", "buttons/up.png", "explosion.png", "haybale.png", "horse.png", "icons/train-pips.png", "jockey.png", "lane.png", "lost.png", "mudpit.png", "slider-knob.png", "slider-lane.png", "slider.png", "win.png" ],
            sound: [],
            font: [ "8-bit-wonder.ttf" ]
        };
    }, {} ],
    2: [ function(require, module, exports) {
        module.exports = function() {
            throw Error("[BaseClass] Abstract method was called without definition.");
        };
    }, {} ],
    3: [ function(require, module, exports) {
        var rebind = require("./rebind.js"), Stub = require("./stub.js");
        function contructor(root) {
            root = root || {};
            root.extend = function(child) {
                var key, base = {
                    base: root.base
                };
                child = child || {};
                for (key in root) {
                    if (typeof root[key] === "function") {
                        base[key] = root[key].bind(root);
                    }
                }
                for (key in child) {
                    if (typeof child[key] === "function") {
                        root[key] = rebind(key, root, base, child);
                    } else {
                        root[key] = child[key];
                    }
                }
                root.base = base;
                if ("_create" in child) {
                    root._create();
                } else {
                    root._create = Stub;
                }
                return root;
            };
            root.implement = function() {
                var i, len = arguments.length;
                for (i = 0; i < len; i += 1) {
                    arguments[i](root);
                }
                return root;
            };
            if ("_create" in root) {
                root._create.call(root);
            } else {
                root._create = Stub;
            }
            return root;
        }
        contructor.Abstract = require("./abstract.js");
        contructor.Stub = Stub;
        contructor.Interface = require("./interface.js");
        module.exports = contructor;
    }, {
        "./abstract.js": 2,
        "./interface.js": 4,
        "./rebind.js": 5,
        "./stub.js": 6
    } ],
    4: [ function(require, module, exports) {
        module.exports = function(child) {
            return function(root) {
                var key;
                for (key in child) {
                    root[key] = child[key];
                }
                return root;
            };
        };
    }, {} ],
    5: [ function(require, module, exports) {
        module.exports = function(key, root, base, self) {
            return function() {
                var out, oldbase = root.base;
                root.base = base;
                root.self = self;
                out = self[key].apply(root, arguments);
                root.base = oldbase;
                return out;
            };
        };
    }, {} ],
    6: [ function(require, module, exports) {
        module.exports = function() {};
    }, {} ],
    7: [ function(require, module, exports) {
        module.exports = function() {
            var i, str = arguments[0], len = arguments.length;
            for (i = 1; i < len; i += 1) {
                str = str.replace(/%s/, arguments[i]);
            }
            return str;
        };
    }, {} ],
    8: [ function(require, module, exports) {
        (function(global) {
            var Item = require("./item.js"), Dimension = require("./geom/dimension.js"), Point = require("./geom/point.js"), pipeline = require("./assets/pipeline.js"), Obj = require("./util/object.js");
            module.exports = function(src, opts) {
                var img = pipeline.get.image(src), timeLastFrame, timeSinceLastFrame = 0, updating = false, firstFrame, direction = 1;
                opts = Obj.mergeDefaults(opts, {
                    kind: "$:animation-strip",
                    sinusoid: false,
                    start: Point(),
                    frames: 1
                });
                opts.size = opts.size || Dimension(img.width / opts.frames, img.height);
                firstFrame = Point(opts.size.width * opts.start.x, opts.size.height * opts.start.y);
                return Item(opts).extend({
                    size: opts.size,
                    frame: 0,
                    speed: opts.speed || 0,
                    start: function() {
                        timeLastFrame = global.Date.now();
                        updating = this.speed > 0;
                    },
                    pause: function() {
                        updating = false;
                    },
                    stop: function() {
                        timeSinceLastFrame = 0;
                        this.frame = 0;
                        direction = 1;
                        updating = false;
                    },
                    update: function() {
                        var now, elapsed, timeBetweenFrames;
                        timeBetweenFrames = 1 / this.speed * 1e3;
                        now = global.Date.now();
                        elapsed = now - timeLastFrame;
                        timeSinceLastFrame += elapsed;
                        if (timeSinceLastFrame >= timeBetweenFrames) {
                            timeSinceLastFrame = 0;
                            this.nextFrame();
                        }
                        timeLastFrame = now;
                    },
                    nextFrame: function() {
                        this.frame += direction;
                        if (opts.sinusoid) {
                            if (this.frame % (opts.frames - 1) === 0) {
                                direction *= -1;
                            }
                        } else {
                            this.frame %= opts.frames;
                        }
                        return this.frame;
                    },
                    draw: function(ctx, size) {
                        var offset = this.frame * this.size.width;
                        ctx.drawImage(img, firstFrame.x + offset, firstFrame.y, this.size.width, this.size.height, 0, 0, size.width || this.size.width, size.height || this.size.height);
                    }
                });
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./assets/pipeline.js": 12,
        "./geom/dimension.js": 22,
        "./geom/point.js": 23,
        "./item.js": 35,
        "./util/object.js": 52
    } ],
    9: [ function(require, module, exports) {
        module.exports = function(url, onload) {
            var audio = document.createElement("audio"), oldplay = audio.play;
            audio.onloadeddata = onload;
            audio.loop = false;
            audio.volume = 1;
            audio.play = function(force) {
                if (force) {
                    this.currentTime = 0;
                }
                oldplay.call(this);
            };
            audio.stop = function() {
                this.pause();
                this.currentTime = 0;
            };
            audio.onplay = function() {};
            audio.onplaying = function() {};
            audio.onended = function() {};
            audio.src = "assets/sound/" + url;
            return audio;
        };
    }, {} ],
    10: [ function(require, module, exports) {
        (function(global) {
            var Str = require("curb");
            function prefetch(family) {
                var span = global.document.createElement("span");
                span.style.fontFamily = family;
                global.document.body.appendChild(span);
            }
            module.exports = function(family, opts) {
                var style = global.document.createElement("style");
                style.innerHTML = Str("@font-face{%s}", [ "font-family:" + family, "font-style:" + (opts.style || "normal"), "font-weight:" + (opts.weight || 400), "src:url(assets/font/" + opts.src + ")" ].join(";"));
                global.document.body.appendChild(style);
                return true;
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        curb: 7
    } ],
    11: [ function(require, module, exports) {
        module.exports = function(src, onload) {
            var img = new Image();
            img.onload = onload;
            img.src = "assets/img/" + src;
            return img;
        };
    }, {} ],
    12: [ function(require, module, exports) {
        var Util = require("../util/object.js"), Img = require("./image.js"), Audio = require("./audio.js"), Font = require("./font.js"), Game = require("../game.js"), heartbeat = require("../heartbeat.js"), dir = require("../../../../assets/directory.json"), loaded = false, count = 0, oncomplete = function() {}, onload = function() {
            count -= 1;
            if (count === 0) {
                oncomplete();
            }
        }, cache = {
            image: {},
            sound: {},
            font: {}
        };
        module.exports = {
            load: function(done) {
                done = done || function() {};
                if (!loaded) {
                    loaded = true;
                    oncomplete = function() {
                        done();
                        heartbeat.run();
                    };
                    count += dir.img.length;
                    count += dir.sound.length;
                    if (count) {
                        dir.img.forEach(this.add.image);
                        dir.sound.forEach(this.add.sound);
                    } else {
                        oncomplete();
                    }
                }
            },
            get ready() {
                return count === 0;
            },
            get: {
                image: function(url) {
                    return cache.image[url];
                },
                sound: function(url) {
                    return cache.sound[url];
                }
            },
            add: {
                image: function(url) {
                    if (!(url in cache.image)) {
                        cache.image[url] = Img(url, onload);
                    }
                    return cache.image[url];
                },
                sound: function(url) {
                    if (!(url in cache.sound)) {
                        cache.sound[url] = Audio(url, onload);
                    }
                    return cache.sound[url];
                },
                font: function(family, conf) {
                    if (!(family in cache.font)) {
                        cache.font[family] = Font(family, conf);
                    }
                    return true;
                }
            }
        };
    }, {
        "../../../../assets/directory.json": 1,
        "../game.js": 20,
        "../heartbeat.js": 29,
        "../util/object.js": 52,
        "./audio.js": 9,
        "./font.js": 10,
        "./image.js": 11
    } ],
    13: [ function(require, module, exports) {
        var CollisionItem = require("./collision-item.js"), Point = require("./geom/point.js"), Vector = require("./geom/vector.js"), Dimension = require("./geom/dimension.js"), Rectangle = require("./geom/rectangle.js"), Obj = require("./util/object.js"), Num = require("./util/number.js");
        module.exports = function(opts) {
            var pos = opts.pos || Point(), size = opts.size || Dimension(), scale = opts.scale || 1, adjsize = size.multiply(Dimension(scale, scale));
            opts = Obj.mergeDefaults(opts, {
                name: "$:clear-sprite",
                kind: "$:clear-sprite",
                mask: Rectangle()
            });
            if (!opts.freemask) {
                opts.offset = opts.mask.pos();
                opts.mask.move(pos.add(opts.offset));
                if (!opts.mask.width && !opts.mask.height) {
                    opts.mask.resize(size);
                }
            }
            return CollisionItem(opts).extend({
                gravity: opts.gravity || 0,
                friction: opts.friction || 0,
                pos: pos,
                alpha: opts.alpha || 1,
                scale: function(newval) {
                    if (newval) {
                        scale = newval;
                        adjsize = size.multiply(Dimension(scale, scale));
                        adjsize.floor(true);
                        if (!opts.freemask) {
                            this.mask.resize(adjsize);
                        }
                    } else {
                        return scale;
                    }
                },
                size: function(newval) {
                    if (newval) {
                        size = newval;
                        adjsize = size.multiply(Dimension(scale, scale));
                        adjsize.floor(true);
                        if (!opts.freemask) {
                            this.mask.resize(adjsize);
                        }
                    } else {
                        return adjsize;
                    }
                },
                rotation: opts.rotation || 0,
                rotationSpeed: opts.rotationSpeed || 0,
                speed: opts.speed || Vector(),
                update: function() {
                    this.rotationSpeed *= 1 - this.friction;
                    this.rotation += this.rotationSpeed;
                    this.rotation %= Num.PI2;
                    this.speed.y += this.gravity;
                    if (!this.speed.is.zero) {
                        this.speed.x *= 1 - this.friction;
                        this.speed.y *= 1 - this.friction;
                        this.shift();
                    }
                    this.base.update();
                },
                draw: function(ctx) {
                    var sin = Num.sin(this.rotation), cos = Num.cos(this.rotation);
                    ctx.globalAlpha = this.alpha;
                    ctx.setTransform(cos, sin, -sin, cos, this.pos.x, this.pos.y);
                    ctx.moveTo(adjsize.width, 0);
                },
                move: function(pos) {
                    this.pos.move(pos, true);
                    if (!opts.freemask) {
                        this.base.move(this.pos);
                    }
                },
                shift: function(offset) {
                    this.move(this.pos.add(offset || this.speed));
                }
            });
        };
    }, {
        "./collision-item.js": 16,
        "./geom/dimension.js": 22,
        "./geom/point.js": 23,
        "./geom/rectangle.js": 25,
        "./geom/vector.js": 27,
        "./util/number.js": 51,
        "./util/object.js": 52
    } ],
    14: [ function(require, module, exports) {
        var Item = require("./item.js"), Obj = require("./util/object.js");
        module.exports = function(opts) {
            var removed = false;
            opts = Obj.mergeDefaults(opts, {
                name: "$:collection",
                kind: "$:collection"
            });
            return Item(opts).extend({
                sorted: "sorted" in opts ? opts.sorted : true,
                set: [],
                map: {},
                add: function(set) {
                    if (set) {
                        set = [].concat(set);
                        set.forEach(function(item) {
                            item.removed = false;
                            this.set.push(item);
                            this.map[item.name] = item;
                            item.trigger("$added");
                        }, this);
                        if (this.sorted) {
                            this.set.sort(function(a, b) {
                                return a.depth - b.depth;
                            });
                        }
                    }
                    return this;
                },
                remove: function(item) {
                    item.removed = true;
                    removed = true;
                },
                clear: function() {
                    this.set = [];
                    this.map = {};
                },
                get: function(name) {
                    return this.map[name];
                },
                update: function() {
                    this.set.forEach(function(item) {
                        if (this.updating && item.updating && !item.removed) {
                            item.update();
                        }
                    }, this);
                },
                draw: function(ctx) {
                    this.set.forEach(function(item) {
                        if (this.drawing && item.drawing && !item.removed) {
                            ctx.globalAlpha = 1;
                            item.draw(ctx);
                        }
                    }, this);
                },
                teardown: function() {
                    this.set.forEach(function(item) {
                        if (this.updating && item.updating && !item.removed) {
                            item.teardown();
                        }
                    }, this);
                    if (removed) {
                        this.set = this.set.filter(function(item) {
                            return !item.removed;
                        });
                        removed = false;
                    }
                }
            });
        };
    }, {
        "./item.js": 35,
        "./util/object.js": 52
    } ],
    15: [ function(require, module, exports) {
        var Util = require("./util/object.js"), Item = require("./item.js");
        module.exports = function(opts) {
            var activeCollisions = [];
            opts = Util.mergeDefaults(opts, {
                name: "$:collision-handler",
                kind: "$:collision-handler"
            });
            return Item(opts).extend({
                draw: function(ctx) {
                    activeCollisions.forEach(function(collidable) {
                        collidable.mask.draw(ctx);
                    });
                },
                clearCollisions: function() {
                    activeCollisions = [];
                },
                update: function(collidable) {
                    activeCollisions.push(collidable);
                },
                handleCollisions: function() {
                    activeCollisions.forEach(function(pivot) {
                        activeCollisions.forEach(function(other) {
                            var intersects, colliding, valid = pivot.canCollideWith(other.id);
                            if (valid) {
                                intersects = pivot.intersects(other.mask);
                                colliding = pivot.isCollidingWith(other.id);
                                if (intersects) {
                                    pivot.addCollision(other.id);
                                    if (!colliding) {
                                        pivot.trigger("$collide#" + other.name, other);
                                        pivot.trigger("$collide." + other.kind, other);
                                    }
                                    pivot.trigger("$colliding#" + other.name, other);
                                    pivot.trigger("$colliding." + other.kind, other);
                                } else {
                                    pivot.removeCollision(other.id);
                                    if (colliding) {
                                        pivot.trigger("$separate#" + other.name, other);
                                        pivot.trigger("$separate." + other.kind, other);
                                    }
                                    pivot.trigger("$miss#" + other.name, other);
                                    pivot.trigger("$miss." + other.kind, other);
                                }
                            }
                        });
                    });
                },
                teardown: function() {
                    this.clearCollisions();
                }
            });
        };
    }, {
        "./item.js": 35,
        "./util/object.js": 52
    } ],
    16: [ function(require, module, exports) {
        (function(global) {
            var Counter = require("./util/id-counter.js"), Rectangle = require("./geom/rectangle.js"), Vector = require("./geom/vector.js"), Item = require("./item.js"), Mouse = require("./io/mouse.js"), canvas = require("./io/canvas.js"), Util = require("./util/object.js");
            module.exports = function(opts) {
                var activeCollisions = {}, collisionsThisFrame = {}, updated = false, collisionSets = [].concat(opts.collisions || []);
                opts = Util.mergeDefaults(opts, {
                    name: "$:collidable",
                    kind: "$:collidable",
                    on: {}
                });
                opts.on["$collide#screendrag"] = [].concat(opts.on["$collide#screendrag"] || [], function() {
                    if (!this.dragging) {
                        this.dragging = true;
                        Mouse.on.up(function() {
                            this.dragging = false;
                        }, this);
                    }
                });
                return Item(opts).extend({
                    id: Counter.nextId,
                    dragging: false,
                    mask: opts.mask || Rectangle(),
                    offset: opts.offset || Vector(),
                    onscreen: function() {
                        return this.intersects(canvas.mask);
                    },
                    move: function(pos) {
                        this.mask.move(pos.add(this.offset));
                    },
                    flush: function(other) {
                        var top = this.mask.bottom - other.mask.top, right = other.mask.right - this.mask.left, bottom = other.mask.bottom - this.mask.top, left = this.mask.right - other.mask.left, min = global.Math.min(top, right, bottom, left), target = this.pos.clone();
                        switch (min) {
                          case top:
                            target.y = other.mask.y - this.mask.height;
                            break;

                          case right:
                            target.x = other.mask.right;
                            break;

                          case bottom:
                            target.y = other.mask.bottom;
                            break;

                          default:
                            target.x = other.mask.x - this.mask.width;
                            break;
                        }
                        this.move(target);
                    },
                    intersects: function(mask) {
                        return this.mask.intersects(mask);
                    },
                    update: function() {
                        if (!updated) {
                            updated = true;
                            collisionSets.forEach(function(handler) {
                                handler.update(this);
                            }, this);
                        }
                    },
                    teardown: function() {
                        updated = false;
                        collisionsThisFrame = {};
                    },
                    addCollision: function(id) {
                        activeCollisions[id] = true;
                        collisionsThisFrame[id] = true;
                    },
                    removeCollision: function(id) {
                        activeCollisions[id] = false;
                    },
                    clearCollisions: function() {
                        activeCollisions = {};
                    },
                    isCollidingWith: function(id) {
                        return activeCollisions[id] || false;
                    },
                    canCollideWith: function(id) {
                        var self = this.id === id, already = collisionsThisFrame[id];
                        return !self && !already;
                    }
                });
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./geom/rectangle.js": 25,
        "./geom/vector.js": 27,
        "./io/canvas.js": 32,
        "./io/mouse.js": 34,
        "./item.js": 35,
        "./util/id-counter.js": 50,
        "./util/object.js": 52
    } ],
    17: [ function(require, module, exports) {
        var Game = require("./game.js"), SetUtil = require("./util/set.js"), ObjUtil = require("./util/object.js"), heartbeat = require("./heartbeat.js"), pipeline = require("./assets/pipeline.js");
        module.exports = {
            Shape: require("./geom/shape.js"),
            Circle: require("./geom/circle.js"),
            Rectangle: require("./geom/rectangle.js"),
            Dimension: require("./geom/dimension.js"),
            Point: require("./geom/point.js"),
            Vector: require("./geom/vector.js"),
            Polar: require("./geom/polar.js"),
            FrameCounter: require("./util/frame-counter.js"),
            IdCounter: require("./util/id-counter.js"),
            timer: require("./util/timer.js"),
            random: require("./util/random.js"),
            range: SetUtil.range,
            shuffle: SetUtil.shuffle,
            mergeLeft: ObjUtil.mergeLeft,
            mergeDefaults: ObjUtil.mergeDefaults,
            Mouse: require("./io/mouse.js"),
            Key: require("./io/keyboard.js"),
            canvas: require("./io/canvas.js"),
            loadAssets: pipeline.load.bind(pipeline),
            addFont: pipeline.add.font,
            image: pipeline.get.image,
            sound: pipeline.get.audio,
            AnimationStrip: require("./animation-strip.js"),
            CollisionHandler: require("./collision-handler.js"),
            collisions: require("./dragon-collisions.js"),
            debug: Game.useDebug,
            screen: Game.screen,
            sprite: Game.sprite,
            addScreens: Game.addScreens,
            removeScreen: Game.removeScreen,
            Screen: require("./screen.js"),
            CollisionItem: require("./collision-item.js"),
            Sprite: require("./sprite.js"),
            ClearSprite: require("./clear-sprite.js"),
            ui: {
                Button: require("./ui/button.js"),
                Label: require("./ui/label.js")
            },
            fadeable: require("./interface/fadeable.js"),
            Eventable: require("./interface/eventable.js"),
            particle: {
                Emitter: require("./particle/emitter.js"),
                Square: require("./particle/square.js"),
                Circle: require("./particle/circle.js"),
                Image: require("./particle/image.js")
            }
        };
    }, {
        "./animation-strip.js": 8,
        "./assets/pipeline.js": 12,
        "./clear-sprite.js": 13,
        "./collision-handler.js": 15,
        "./collision-item.js": 16,
        "./dragon-collisions.js": 18,
        "./game.js": 20,
        "./geom/circle.js": 21,
        "./geom/dimension.js": 22,
        "./geom/point.js": 23,
        "./geom/polar.js": 24,
        "./geom/rectangle.js": 25,
        "./geom/shape.js": 26,
        "./geom/vector.js": 27,
        "./heartbeat.js": 29,
        "./interface/eventable.js": 30,
        "./interface/fadeable.js": 31,
        "./io/canvas.js": 32,
        "./io/keyboard.js": 33,
        "./io/mouse.js": 34,
        "./particle/circle.js": 40,
        "./particle/emitter.js": 41,
        "./particle/image.js": 42,
        "./particle/square.js": 43,
        "./screen.js": 44,
        "./sprite.js": 45,
        "./ui/button.js": 46,
        "./ui/label.js": 47,
        "./util/frame-counter.js": 49,
        "./util/id-counter.js": 50,
        "./util/object.js": 52,
        "./util/random.js": 53,
        "./util/set.js": 54,
        "./util/timer.js": 55
    } ],
    18: [ function(require, module, exports) {
        var CollisionHandler = require("./collision-handler.js");
        module.exports = CollisionHandler({
            name: "dragon"
        });
    }, {
        "./collision-handler.js": 15
    } ],
    19: [ function(require, module, exports) {
        var Collection = require("./collection.js"), CollisionItem = require("./collision-item.js"), Rectangle = require("./geom/rectangle.js"), Point = require("./geom/point.js"), Dimension = require("./geom/dimension.js"), canvas = require("./io/canvas.js"), dragonCollisions = require("./dragon-collisions.js");
        module.exports = Collection({
            name: "$:masks"
        }).add([ require("./mask/screentap.js"), require("./mask/screendrag.js"), require("./mask/screenhold.js"), CollisionItem({
            name: "screenedge/top",
            mask: Rectangle(Point(0, -20), Dimension(canvas.width, 20)),
            collisionSets: dragonCollisions
        }), CollisionItem({
            name: "screenedge/right",
            mask: Rectangle(Point(canvas.width, 0), Dimension(20, canvas.height)),
            collisionSets: dragonCollisions
        }), CollisionItem({
            name: "screenedge/bottom",
            mask: Rectangle(Point(0, canvas.height), Dimension(canvas.width, 20)),
            collisionSets: dragonCollisions
        }), CollisionItem({
            name: "screenedge/left",
            mask: Rectangle(Point(-20, 0), Dimension(20, canvas.height)),
            collisionSets: dragonCollisions
        }) ]);
    }, {
        "./collection.js": 14,
        "./collision-item.js": 16,
        "./dragon-collisions.js": 18,
        "./geom/dimension.js": 22,
        "./geom/point.js": 23,
        "./geom/rectangle.js": 25,
        "./io/canvas.js": 32,
        "./mask/screendrag.js": 36,
        "./mask/screenhold.js": 37,
        "./mask/screentap.js": 38
    } ],
    20: [ function(require, module, exports) {
        var frameCounter = require("./util/frame-counter.js"), Collection = require("./collection.js"), timer = require("./util/timer.js"), ctx = require("./io/canvas.js").ctx, collisions = require("./dragon-collisions.js"), masks = require("./dragon-masks.js");
        module.exports = Collection({
            name: "$:game"
        }).extend({
            debug: false,
            useDebug: function() {
                this.debug = true;
                frameCounter.start();
            },
            update: function() {
                masks.update();
                this.base.update();
                timer.update();
                collisions.handleCollisions();
            },
            draw: function() {
                this.base.draw(ctx);
                if (this.debug) {
                    frameCounter.draw(ctx);
                    collisions.draw(ctx);
                }
            },
            teardown: function() {
                collisions.teardown();
                masks.teardown();
                this.base.teardown();
            },
            screen: function(name) {
                return this.base.get(name);
            },
            addScreens: function(set) {
                this.base.add(set);
            },
            removeScreen: function(screen) {
                this.base.remove(screen);
            }
        });
    }, {
        "./collection.js": 14,
        "./dragon-collisions.js": 18,
        "./dragon-masks.js": 19,
        "./io/canvas.js": 32,
        "./util/frame-counter.js": 49,
        "./util/timer.js": 55
    } ],
    21: [ function(require, module, exports) {
        (function(global) {
            var Shape = require("./shape.js"), Vector = require("./vector.js"), Point = require("./point.js"), Dimension = require("./dimension.js"), Num = require("../util/number.js");
            module.exports = function(pos, rad) {
                pos = pos || Point();
                rad = rad || 0;
                return Shape({
                    pos: pos,
                    name: "circle",
                    intersects: {
                        rectangle: function(rect) {
                            var vect, pt = Point(this.x, this.y);
                            if (this.x >= rect.right) pt.x = rect.right; else if (this.x <= rect.x) pt.x = rect.x;
                            if (this.y >= rect.bottom) pt.y = rect.bottom; else if (this.y <= rect.y) pt.y = rect.y;
                            vect = Vector(this.x - pt.x, this.y - pt.y);
                            return vect.magnitude < this.radius;
                        },
                        circle: function(circ) {
                            var vect = Vector(circ.x - this.x, circ.y - this.y);
                            return vect.magnitude < this.radius + circ.radius;
                        }
                    }
                }).extend({
                    radius: rad,
                    width: rad * 2,
                    height: rad * 2,
                    top: pos.y - rad,
                    right: pos.x + rad,
                    bottom: pos.y + rad,
                    left: pos.x - rad,
                    center: function() {
                        return Point(this.x, this.y);
                    },
                    draw: function(ctx) {
                        ctx.beginPath();
                        ctx.lineWidth = 1;
                        ctx.globalAlpha = .5;
                        ctx.strokeStyle = "#f55";
                        ctx.arc(this.x, this.y, this.radius, 0, 2 * Num.PI);
                        ctx.stroke();
                    },
                    move: function(pos) {
                        this.x = pos.x;
                        this.y = pos.y;
                        this.top = pos.y - this.radius;
                        this.right = pos.x + this.radius;
                        this.bottom = pos.y + this.radius;
                        this.left = pos.x - this.radius;
                    },
                    resize: function(size) {
                        var rad = global.Math.max(size.width, size.height);
                        this.radius = rad;
                        this.width = rad * 2;
                        this.height = rad * 2;
                        this.top = this.y - rad;
                        this.right = this.x + rad;
                        this.bottom = this.y + rad;
                        this.left = this.x - rad;
                    }
                });
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "../util/number.js": 51,
        "./dimension.js": 22,
        "./point.js": 23,
        "./shape.js": 26,
        "./vector.js": 27
    } ],
    22: [ function(require, module, exports) {
        (function(global) {
            var ZERO = require("./zero.js");
            module.exports = function(w, h) {
                var self = {
                    width: w || 0,
                    height: h || 0,
                    clone: function() {
                        return module.exports(this.width, this.height);
                    },
                    equals: function(other) {
                        return this.width === other.width && this.height === other.height;
                    },
                    floor: function(mutate) {
                        var target = mutate ? this : this.clone();
                        target.width = global.Math.floor(target.width);
                        target.height = global.Math.floor(target.height);
                        return target;
                    },
                    is: {
                        get zero() {
                            return self.equals(ZERO);
                        }
                    },
                    multiply: function(scale, shallow) {
                        var target = shallow ? this : this.clone();
                        target.width *= scale.width;
                        target.height *= scale.height;
                        return target;
                    },
                    divide: function(scale, shallow) {
                        var target = shallow ? this : this.clone();
                        target.width /= scale.width;
                        target.height /= scale.height;
                        return target;
                    },
                    add: function(scale, shallow) {
                        var target = shallow ? this : this.clone();
                        target.width += scale.width;
                        target.height += scale.height;
                        return target;
                    },
                    subtract: function(scale, shallow) {
                        var target = shallow ? this : this.clone();
                        target.width -= scale.width;
                        target.height -= scale.height;
                        return target;
                    }
                };
                return self;
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./zero.js": 28
    } ],
    23: [ function(require, module, exports) {
        (function(global) {
            var ZERO = require("./zero.js");
            module.exports = function(x, y) {
                var self = {
                    x: x || 0,
                    y: y || 0,
                    clone: function() {
                        return module.exports(this.x, this.y);
                    },
                    equals: function(other) {
                        return this.x === other.x && this.y === other.y;
                    },
                    floor: function(mutate) {
                        var target = mutate ? this : this.clone();
                        target.x = global.Math.floor(target.x);
                        target.y = global.Math.floor(target.y);
                        return target;
                    },
                    is: {
                        get zero() {
                            return self.equals(ZERO);
                        }
                    },
                    move: function(pos, shallow) {
                        var target = shallow ? this : this.clone();
                        target.x = pos.x;
                        target.y = pos.y;
                        return target;
                    },
                    multiply: function(factor, shallow) {
                        var target = shallow ? this : this.clone();
                        target.x *= factor.x;
                        target.y *= factor.y;
                        return target;
                    },
                    divide: function(factor, shallow) {
                        var target = shallow ? this : this.clone();
                        target.x /= factor.x;
                        target.y /= factor.y;
                        return target;
                    },
                    add: function(offset, shallow) {
                        var target = shallow ? this : this.clone();
                        target.x += offset.x;
                        target.y += offset.y;
                        return target;
                    },
                    subtract: function(offset, shallow) {
                        var target = shallow ? this : this.clone();
                        target.x -= offset.x;
                        target.y -= offset.y;
                        return target;
                    }
                };
                return self;
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./zero.js": 28
    } ],
    24: [ function(require, module, exports) {
        var Num = require("../util/number.js");
        function isEqual(my, other, tfactor, mfactor) {
            var mag = my.magnitude === mfactor * other.magnitude, mytheta = (my.theta % Num.PI).toFixed(5), otheta = ((other.theta + tfactor) % Num.PI).toFixed(5);
            return mag && mytheta === otheta;
        }
        module.exports = function(theta, mag) {
            return {
                theta: theta || 0,
                magnitude: mag || 0,
                invert: function() {
                    return module.exports(this.theta + Num.PI, this.magnitude * -1);
                },
                clone: function() {
                    return module.exports(this.theta, this.magnitude);
                },
                toVector: function() {
                    var Vector = require("./vector.js");
                    return Vector(this.magnitude * Num.cos(this.theta), this.magnitude * Num.sin(this.theta));
                },
                equals: function(other) {
                    return isEqual(this, other, 0, 1) || isEqual(this, other, Num.PI, -1);
                }
            };
        };
    }, {
        "../util/number.js": 51,
        "./vector.js": 27
    } ],
    25: [ function(require, module, exports) {
        var Shape = require("./shape.js"), Point = require("./point.js"), Dimension = require("./dimension.js"), Vector = require("./vector.js");
        module.exports = function(pos, size) {
            pos = pos || Point();
            size = size || Dimension();
            return Shape({
                pos: pos,
                name: "rectangle",
                intersects: {
                    rectangle: function(rect) {
                        return this.x < rect.right && this.right > rect.x && this.y < rect.bottom && this.bottom > rect.y;
                    },
                    circle: function(circ) {
                        var vect, pt = Point(circ.x, circ.y);
                        if (circ.x > this.right) pt.x = this.right; else if (circ.x < this.x) pt.x = this.x;
                        if (circ.y > this.bottom) pt.y = this.bottom; else if (circ.y < this.y) pt.y = this.y;
                        vect = Vector(circ.x - pt.x, circ.y - pt.y);
                        return vect.magnitude < circ.radius;
                    }
                }
            }).extend({
                width: size.width || 0,
                height: size.height || 0,
                top: pos.y || 0,
                right: pos.x + size.width || 0,
                bottom: pos.y + size.height || 0,
                left: pos.x || 0,
                center: function() {
                    return Point(this.x + this.width / 2, this.y + this.height / 2);
                },
                move: function(pos) {
                    this.x = pos.x;
                    this.y = pos.y;
                    this.top = pos.y;
                    this.right = pos.x + this.width;
                    this.bottom = pos.y + this.height;
                    this.left = pos.x;
                },
                shift: function(offset) {
                    this.move(this.pos().add(offset));
                },
                resize: function(size) {
                    this.width = size.width;
                    this.height = size.height;
                    this.right = this.x + size.width;
                    this.bottom = this.y + size.height;
                },
                draw: function(ctx) {
                    ctx.beginPath();
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = .5;
                    ctx.strokeStyle = "#f55";
                    ctx.rect(this.x, this.y, this.width, this.height);
                    ctx.stroke();
                }
            });
        };
    }, {
        "./dimension.js": 22,
        "./point.js": 23,
        "./shape.js": 26,
        "./vector.js": 27
    } ],
    26: [ function(require, module, exports) {
        var BaseClass = require("baseclassjs"), Point = require("./point.js");
        module.exports = function(opts) {
            var pos, intersectMap;
            opts = opts || {};
            intersectMap = opts.intersects || {};
            pos = opts.pos || Point();
            return BaseClass({
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0,
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                pos: function() {
                    return Point(this.x, this.y);
                },
                name: opts.name,
                move: BaseClass.Abstract,
                resize: BaseClass.Abstract,
                intersects: function(other) {
                    return intersectMap[other.name].call(this, other);
                },
                draw: BaseClass.Stub
            });
        };
    }, {
        "./point.js": 23,
        baseclassjs: 3
    } ],
    27: [ function(require, module, exports) {
        (function(global) {
            var ZERO = require("./zero.js"), Num = require("../util/number.js");
            module.exports = function(x, y) {
                var self = {
                    x: x || 0,
                    y: y || 0,
                    get magnitude() {
                        return Num.abs(global.Math.sqrt(this.y * this.y + this.x * this.x));
                    },
                    clone: function() {
                        return module.exports(this.x, this.y);
                    },
                    equals: function(other) {
                        return this.x === other.x && this.y === other.y;
                    },
                    is: {
                        get zero() {
                            return self.equals(ZERO);
                        }
                    },
                    toPolar: function() {
                        var Polar = require("./polar.js");
                        return Polar(global.Math.atan(this.y / this.x), this.magnitude);
                    },
                    multiply: function(scale) {
                        this.x *= scale.x;
                        this.y *= scale.y;
                        return this;
                    },
                    divide: function(scale) {
                        this.x /= scale.x;
                        this.y /= scale.y;
                        return this;
                    },
                    add: function(scale) {
                        this.x += scale.x;
                        this.y += scale.y;
                        return this;
                    },
                    subtract: function(scale) {
                        this.x -= scale.x;
                        this.y -= scale.y;
                        return this;
                    }
                };
                return self;
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "../util/number.js": 51,
        "./polar.js": 24,
        "./zero.js": 28
    } ],
    28: [ function(require, module, exports) {
        module.exports = {
            x: 0,
            y: 0,
            right: 0,
            left: 0,
            top: 0,
            bottom: 0,
            width: 0,
            height: 0
        };
    }, {} ],
    29: [ function(require, module, exports) {
        (function(global) {
            var Game = require("./game.js"), frameCounter = require("./util/frame-counter.js"), running = false;
            module.exports = {
                run: function() {
                    if (!running) {
                        running = true;
                        function step() {
                            Game.update();
                            Game.draw();
                            Game.teardown();
                            frameCounter.countFrame();
                            global.requestAnimationFrame(step);
                        }
                        global.requestAnimationFrame(step);
                    }
                }
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./game.js": 20,
        "./util/frame-counter.js": 49
    } ],
    30: [ function(require, module, exports) {
        var BaseClass = require("baseclassjs");
        module.exports = function(opts) {
            var events = {}, singles = {}, name;
            opts = opts || {};
            for (name in opts.events) {
                events[name] = [].concat(opts.events[name]);
            }
            for (name in opts.singles) {
                singles[name] = [].concat(opts.singles[name]);
            }
            return BaseClass.Interface({
                on: function(name, cb) {
                    events[name] = events[name] || [];
                    events[name].push(cb);
                },
                one: function(name, cb) {
                    singles[name] = singles[name] || [];
                    singles[name].push(cb);
                },
                off: function(name) {
                    events[name] = [];
                    singles[name] = [];
                },
                trigger: function(name, data) {
                    if (name in events) {
                        events[name].forEach(function(cb) {
                            cb.call(this, data);
                        }, this);
                    }
                    if (name in singles) {
                        singles[name].forEach(function(cb) {
                            cb.call(this, data);
                        }, this);
                        singles[name] = [];
                    }
                }
            });
        };
    }, {
        baseclassjs: 3
    } ],
    31: [ function(require, module, exports) {
        var BaseClass = require("baseclassjs");
        module.exports = BaseClass.Interface({
            fadeIn: function() {},
            fadeOut: function() {}
        });
    }, {
        baseclassjs: 3
    } ],
    32: [ function(require, module, exports) {
        (function(global) {
            var Rectangle = require("../geom/rectangle.js"), Point = require("../geom/point.js"), Dimension = require("../geom/dimension.js"), mobile = require("../util/detect-mobile.js"), canvas = global.document.createElement("canvas");
            if (mobile) {
                canvas.width = global.innerWidth;
                canvas.height = global.innerHeight;
            } else {
                if (global.localStorage.drago === "landscape") {
                    canvas.width = 480;
                    canvas.height = 320;
                } else {
                    canvas.width = 320;
                    canvas.height = 480;
                }
                canvas.style.border = "1px solid #000";
            }
            global.document.body.appendChild(canvas);
            canvas.mobile = mobile;
            canvas.ctx = canvas.getContext("2d");
            if (!canvas.ctx.resetTransform) {
                canvas.ctx.resetTransform = function() {
                    canvas.ctx.setTransform(1, 0, 0, 1, 0, 0);
                };
            }
            canvas.clear = function() {
                canvas.ctx.resetTransform();
                canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
            };
            canvas.mask = Rectangle(Point(0, 0), Dimension(canvas.width, canvas.height));
            canvas.center = Point(canvas.width / 2, canvas.height / 2);
            global.Cocoon.Utils.setAntialias(false);
            canvas.ctx.imageSmoothingEnabled = false;
            module.exports = canvas;
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "../geom/dimension.js": 22,
        "../geom/point.js": 23,
        "../geom/rectangle.js": 25,
        "../util/detect-mobile.js": 48
    } ],
    33: [ function(require, module, exports) {
        var nameMap = {
            alt: false,
            ctrl: false,
            shift: false
        }, codeMap = {};
        function getCode(event) {
            return event.charCode || event.keyCode || event.which;
        }
        document.onkeydown = function(event) {
            var code = getCode(event), name = String.fromCharCode(code);
            codeMap[code] = true;
            nameMap[name] = true;
            nameMap.alt = event.altKey;
            nameMap.ctrl = event.ctrlKey;
            nameMap.shift = event.shiftKey;
        };
        document.onkeyup = function(event) {
            var code = getCode(event), name = String.fromCharCode(code);
            codeMap[code] = false;
            nameMap[name] = false;
            nameMap.alt = event.altKey;
            nameMap.ctrl = event.ctrlKey;
            nameMap.shift = event.shiftKey;
        };
        module.exports = {
            get alt() {
                return nameMap.alt;
            },
            get ctrl() {
                return nameMap.ctrl;
            },
            get shift() {
                return nameMap.shift;
            },
            arrow: {
                get left() {
                    return codeMap[37] || false;
                },
                get up() {
                    return codeMap[38] || false;
                },
                get right() {
                    return codeMap[39] || false;
                },
                get down() {
                    return codeMap[40] || false;
                }
            },
            name: function(name) {
                return nameMap[name] || false;
            },
            code: function(code) {
                return codeMap[code] || false;
            }
        };
    }, {} ],
    34: [ function(require, module, exports) {
        var Point = require("../geom/point.js"), Vector = require("../geom/vector.js"), canvas = require("./canvas.js"), timer = require("../util/timer.js"), dragStart = null, isDown = false, isDragging = false, isHolding = false, current = Point(), last = Point(), shift = Vector(), startEventName, moveEventName, endEventName;
        if (canvas.mobile) {
            startEventName = "touchstart";
            moveEventName = "touchmove";
            endEventName = "touchend";
        } else {
            startEventName = "mousedown";
            moveEventName = "mousemove";
            endEventName = "mouseup";
        }
        function getOffset(event) {
            if (canvas.mobile) {
                return Point(event.touches[0].clientX, event.touches[0].clientY);
            }
            return Point(event.offsetX, event.offsetY);
        }
        canvas.addEventListener(startEventName, function(event) {
            isDown = true;
            current = getOffset(event);
            timer.setTimeout(function() {
                if (isDown) {
                    isHolding = true;
                }
            }, 200);
        });
        document.addEventListener(endEventName, function(event) {
            isDown = isDragging = isHolding = false;
            dragStart = null;
        });
        canvas.addEventListener(moveEventName, function(event) {
            last = current;
            current = getOffset(event);
            if (isDown && !isDragging) {
                shift.x = current.x - last.x;
                shift.y = current.y - last.y;
                if (shift.magnitude > 1) {
                    isDragging = true;
                    dragStart = current;
                }
            }
        });
        module.exports = {
            is: {
                get down() {
                    return isDown;
                },
                get dragging() {
                    return isDragging;
                },
                get holding() {
                    return isHolding;
                }
            },
            get offset() {
                return current;
            },
            get dragStart() {
                return dragStart;
            },
            on: {
                down: function(cb, thisArg) {
                    canvas.addEventListener(startEventName, cb.bind(thisArg));
                },
                click: function(cb, thisArg) {},
                dclick: function(cb, thisArg) {},
                up: function(cb, thisArg) {
                    document.addEventListener(endEventName, cb.bind(thisArg));
                },
                move: function(cb, thisArg) {
                    canvas.addEventListener(moveEventName, cb.bind(thisArg));
                },
                drag: function(cb, thisArg) {
                    canvas.addEventListener(moveEventName, function() {
                        if (isDragging) {
                            cb.call(thisArg);
                        }
                    });
                },
                swipe: function(dir, cb, thisArg) {}
            },
            eventName: {
                start: startEventName,
                move: moveEventName,
                end: endEventName
            }
        };
    }, {
        "../geom/point.js": 23,
        "../geom/vector.js": 27,
        "../util/timer.js": 55,
        "./canvas.js": 32
    } ],
    35: [ function(require, module, exports) {
        var BaseClass = require("baseclassjs"), Eventable = require("./interface/eventable.js");
        module.exports = function(opts) {
            opts = opts || {};
            return BaseClass({
                name: opts.name || "$:item",
                kind: opts.kind || "$:item",
                depth: 0,
                removed: false,
                updating: "updating" in opts ? opts.updating : true,
                drawing: "drawing" in opts ? opts.drawing : true,
                update: BaseClass.Stub,
                draw: BaseClass.Stub,
                teardown: BaseClass.Stub,
                start: function() {
                    this.updating = true;
                    this.drawing = true;
                    this.trigger("$start");
                },
                pause: function() {
                    this.updating = false;
                    this.drawing = true;
                    this.trigger("$pause");
                },
                stop: function() {
                    this.updating = false;
                    this.drawing = false;
                    this.trigger("$stop");
                }
            }).implement(Eventable({
                events: opts.on,
                singles: opts.one
            }));
        };
    }, {
        "./interface/eventable.js": 30,
        baseclassjs: 3
    } ],
    36: [ function(require, module, exports) {
        var CollisionItem = require("../collision-item.js"), Circle = require("../geom/circle.js"), Point = require("../geom/point.js"), Mouse = require("../io/mouse.js"), dragonCollisions = require("../dragon-collisions.js");
        module.exports = CollisionItem({
            name: "screendrag",
            mask: Circle(Point(), 8),
            collisions: dragonCollisions
        }).extend({
            update: function() {
                if (Mouse.is.dragging) {
                    this.move(Mouse.offset);
                } else {
                    this.move(Point(-999, -999));
                }
                this.base.update();
            }
        });
    }, {
        "../collision-item.js": 16,
        "../dragon-collisions.js": 18,
        "../geom/circle.js": 21,
        "../geom/point.js": 23,
        "../io/mouse.js": 34
    } ],
    37: [ function(require, module, exports) {
        var CollisionItem = require("../collision-item.js"), Circle = require("../geom/circle.js"), Point = require("../geom/point.js"), Mouse = require("../io/mouse.js"), dragonCollisions = require("../dragon-collisions.js");
        module.exports = CollisionItem({
            name: "screenhold",
            mask: Circle(Point(), 8),
            collisions: dragonCollisions
        }).extend({
            update: function() {
                if (Mouse.is.down && !Mouse.is.dragging) {
                    this.move(Mouse.offset);
                } else {
                    this.move(Point(-999, -999));
                }
                this.base.update();
            }
        });
    }, {
        "../collision-item.js": 16,
        "../dragon-collisions.js": 18,
        "../geom/circle.js": 21,
        "../geom/point.js": 23,
        "../io/mouse.js": 34
    } ],
    38: [ function(require, module, exports) {
        var CollisionItem = require("../collision-item.js"), Circle = require("../geom/circle.js"), Point = require("../geom/point.js"), Mouse = require("../io/mouse.js"), dragonCollisions = require("../dragon-collisions.js"), tapping = false;
        Mouse.on.down(function() {
            tapping = true;
        });
        module.exports = CollisionItem({
            name: "screentap",
            mask: Circle(Point(), 8),
            collisions: dragonCollisions
        }).extend({
            update: function() {
                if (tapping) {
                    tapping = false;
                    this.move(Mouse.offset);
                } else {
                    this.move(Point(-999, -999));
                }
                this.base.update();
            }
        });
    }, {
        "../collision-item.js": 16,
        "../dragon-collisions.js": 18,
        "../geom/circle.js": 21,
        "../geom/point.js": 23,
        "../io/mouse.js": 34
    } ],
    39: [ function(require, module, exports) {
        var ClearSprite = require("../clear-sprite.js"), Vector = require("../geom/vector.js"), Dimension = require("../geom/dimension.js"), Point = require("../geom/point.js"), random = require("../util/random.js"), Obj = require("../util/object.js"), timer = require("../util/timer.js");
        module.exports = function(opts) {
            var fadeout = false, hash, startPos = opts.pos.clone(), startSpeed;
            opts = Obj.mergeDefaults(opts, {
                name: "$:particle",
                kind: "$:particle",
                size: Dimension(4, 4),
                rotationSpeed: random() * .4 - .2,
                speed: Vector(random() - .5, random() - .5),
                lifespan: 1e3,
                style: function() {},
                fade: .05
            });
            startSpeed = opts.speed.clone();
            opts.lifespan += random() * 250;
            return ClearSprite(opts).extend({
                _create: function() {
                    this.stop();
                },
                reset: function() {
                    this.stop();
                    timer.clear(hash);
                    fadeout = false;
                    this.alpha = 1;
                    this.rotation = 0;
                    this.rotationSpeed = opts.rotationSpeed;
                    this.move(startPos);
                    this.speed = startSpeed.clone();
                },
                start: function() {
                    this.base.start();
                    hash = timer.setTimeout(function() {
                        fadeout = true;
                    }, opts.lifespan);
                },
                update: function() {
                    if (fadeout) {
                        this.alpha -= opts.fade;
                    }
                    if (this.alpha < 0) {
                        opts.owner.reclaim(this);
                    }
                    this.base.update();
                },
                draw: function(ctx) {
                    this.base.draw(ctx);
                    opts.style(ctx);
                }
            });
        };
    }, {
        "../clear-sprite.js": 13,
        "../geom/dimension.js": 22,
        "../geom/point.js": 23,
        "../geom/vector.js": 27,
        "../util/object.js": 52,
        "../util/random.js": 53,
        "../util/timer.js": 55
    } ],
    40: [ function(require, module, exports) {
        var Particle = require("./base.js"), Obj = require("../util/object.js"), Num = require("../util/number.js");
        module.exports = function(opts) {
            opts = Obj.mergeDefaults(opts, {
                name: "$:particle-circle"
            });
            opts.rotationSpeed = 0;
            return Particle(opts).extend({
                draw: function(ctx) {
                    this.base.draw(ctx);
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size().width / 2, 0, Num.PI2);
                    ctx.fill();
                }
            });
        };
    }, {
        "../util/number.js": 51,
        "../util/object.js": 52,
        "./base.js": 39
    } ],
    41: [ function(require, module, exports) {
        var Collection = require("../collection.js"), Point = require("../geom/point.js"), Obj = require("../util/object.js"), canvas = require("../io/canvas.js"), timer = require("../util/timer.js");
        module.exports = function(opts) {
            var hash, bank = [];
            opts = Obj.mergeDefaults(opts, {
                name: "$:emitter",
                kind: "$:emitter",
                pos: Point(),
                speed: 250,
                volume: 4,
                style: function() {},
                conf: function() {}
            });
            function step() {
                var set = bank.splice(0, this.volume), i, id, len = set.length;
                for (i = 0; i < len; i += 1) {
                    set[i].start();
                }
            }
            return Collection(opts).extend({
                sorted: false,
                speed: opts.speed,
                volume: opts.volume,
                _create: function() {
                    var i, particle, conf;
                    for (i = 0; i < 50; i += 1) {
                        conf = opts.conf() || {};
                        conf.owner = this;
                        conf.pos = conf.pos || opts.pos.clone();
                        particle = opts.type(conf);
                        bank.push(particle);
                        this.set.push(particle);
                    }
                    if (this.speed) {
                        hash = timer.setInterval(step, this.speed, this);
                    }
                    step.call(this);
                },
                draw: function(ctx) {
                    opts.style(ctx);
                    this.base.draw(ctx);
                },
                kill: function() {
                    timer.clear(hash);
                },
                reclaim: function(particle) {
                    particle.reset();
                    bank.push(particle);
                }
            });
        };
    }, {
        "../collection.js": 14,
        "../geom/point.js": 23,
        "../io/canvas.js": 32,
        "../util/object.js": 52,
        "../util/timer.js": 55
    } ],
    42: [ function(require, module, exports) {
        var Particle = require("./base.js"), Obj = require("../util/object.js"), pipeline = require("../assets/pipeline.js");
        module.exports = function(opts) {
            var img = pipeline.get.image(opts.src);
            opts = Obj.mergeDefaults(opts, {
                name: "$:particle-image"
            });
            return Particle(opts).extend({
                draw: function(ctx) {
                    this.base.draw(ctx);
                    ctx.drawImage(img, -this.size().width / 2, -this.size().height / 2, this.size().width, this.size().height);
                }
            });
        };
    }, {
        "../assets/pipeline.js": 12,
        "../util/object.js": 52,
        "./base.js": 39
    } ],
    43: [ function(require, module, exports) {
        var Particle = require("./base.js"), Obj = require("../util/object.js");
        module.exports = function(opts) {
            opts = Obj.mergeDefaults(opts, {
                name: "$:particle-square"
            });
            return Particle(opts).extend({
                draw: function(ctx) {
                    this.base.draw(ctx);
                    ctx.beginPath();
                    ctx.rect(-this.size().width / 2, -this.size().height / 2, this.size().width, this.size().height);
                    ctx.fill();
                }
            });
        };
    }, {
        "../util/object.js": 52,
        "./base.js": 39
    } ],
    44: [ function(require, module, exports) {
        var Collection = require("./collection.js"), Obj = require("./util/object.js"), Game = require("./game.js");
        module.exports = function(opts) {
            var collisions = Collection({
                name: "$:screen-collisions"
            }).add(opts.collisions);
            opts = Obj.mergeDefaults(opts, {
                name: "$:screen",
                kind: "$:screen",
                updating: false,
                drawing: false
            });
            return Collection(opts).extend({
                _create: function() {
                    this.add(opts.sprites);
                },
                start: function() {
                    collisions.start();
                    this.base.start();
                },
                pause: function() {
                    collisions.pause();
                    this.base.pause();
                },
                stop: function() {
                    collisions.stop();
                    this.base.stop();
                },
                addCollisions: collisions.add,
                sprite: function(name) {
                    return this.base.get(name);
                },
                addSprites: function(set) {
                    this.base.add(set);
                },
                removeSprite: function(sprite) {
                    this.base.remove(sprite);
                },
                clearSprites: function() {
                    this.base.clear();
                },
                update: function() {
                    this.base.update();
                    collisions.set.forEach(function(handler) {
                        handler.handleCollisions();
                    });
                },
                draw: function(ctx) {
                    this.base.draw(ctx);
                    if (Game.debug) {
                        collisions.draw(ctx);
                    }
                },
                teardown: function() {
                    this.base.teardown();
                    collisions.teardown();
                }
            });
        };
    }, {
        "./collection.js": 14,
        "./game.js": 20,
        "./util/object.js": 52
    } ],
    45: [ function(require, module, exports) {
        (function(global) {
            var ClearSprite = require("./clear-sprite.js"), Dimension = require("./geom/dimension.js"), AnimationStrip = require("./animation-strip.js"), Util = require("./util/object.js");
            module.exports = function(opts) {
                var name, strip, stripMap = opts.strips || {};
                if (typeof stripMap === "string") {
                    stripMap = {
                        strip: stripMap
                    };
                }
                for (name in stripMap) {
                    strip = stripMap[name];
                    if (typeof strip === "string") {
                        stripMap[name] = AnimationStrip(strip);
                    }
                }
                opts = Util.mergeDefaults(opts, {
                    name: "$:sprite",
                    kind: "$:sprite",
                    startingStrip: opts.startingStrip || global.Object.keys(stripMap)[0]
                });
                opts.size = opts.size || (stripMap[opts.startingStrip] || {}).size;
                return ClearSprite(opts).extend({
                    strip: stripMap[opts.startingStrip],
                    useStrip: function(name) {
                        if (this.strip !== stripMap[name]) {
                            this.strip.stop();
                            this.strip = stripMap[name];
                            this.strip.start();
                        }
                    },
                    getStrip: function(name) {
                        return stripMap[name];
                    },
                    start: function() {
                        this.base.start();
                        this.strip.start();
                    },
                    pause: function() {
                        this.base.pause();
                        this.strip.pause();
                    },
                    stop: function() {
                        this.base.stop();
                        this.strip.stop();
                    },
                    update: function() {
                        if (this.strip.updating) {
                            this.strip.update();
                        }
                        this.base.update();
                    },
                    draw: function(ctx) {
                        this.base.draw(ctx);
                        this.strip.draw(ctx, this.size());
                    }
                });
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./animation-strip.js": 8,
        "./clear-sprite.js": 13,
        "./geom/dimension.js": 22,
        "./util/object.js": 52
    } ],
    46: [ function(require, module, exports) {
        var Sprite = require("../sprite.js"), Rectangle = require("../geom/rectangle.js"), Point = require("../geom/point.js"), Util = require("../util/object.js");
        module.exports = function(opts) {
            opts = Util.mergeDefaults(opts, {
                down: opts.up,
                name: "$:ui-button",
                kind: "$:ui-button",
                on: {},
                strips: {},
                mask: Rectangle(),
                collisions: [],
                startingStrip: "up",
                onpress: function() {},
                auto: true
            });
            opts.collisions = [].concat(opts.collisions, require("../dragon-collisions.js"));
            opts.on["$collide#screentap"] = function() {
                if (this.auto) {
                    this.useStrip("down");
                }
                opts.onpress.call(this);
            };
            opts.on["$miss#screenhold"] = function() {
                if (this.auto) {
                    this.useStrip("up");
                }
            };
            return Sprite(opts).extend({
                auto: opts.auto
            });
        };
    }, {
        "../dragon-collisions.js": 18,
        "../geom/point.js": 23,
        "../geom/rectangle.js": 25,
        "../sprite.js": 45,
        "../util/object.js": 52
    } ],
    47: [ function(require, module, exports) {
        var ClearSprite = require("../clear-sprite.js"), Util = require("../util/object.js");
        module.exports = function(opts) {
            opts = Util.mergeDefaults(opts, {
                name: "$:ui-label",
                kind: "$:ui-label",
                text: "",
                style: function() {}
            });
            return ClearSprite(opts).extend({
                text: opts.text,
                draw: function(ctx) {
                    opts.style(ctx);
                    ctx.fillText(this.text, this.pos.x, this.pos.y);
                }
            });
        };
    }, {
        "../clear-sprite.js": 13,
        "../util/object.js": 52
    } ],
    48: [ function(require, module, exports) {
        module.exports = "ontouchstart" in window;
    }, {} ],
    49: [ function(require, module, exports) {
        (function(global) {
            var timer = require("./timer.js"), hash, started = false, frameRate = frameCount = 0, mean = meantot = 0, meanset = [];
            function step(over) {
                var time = 1e3 + over;
                frameRate = global.Math.floor(frameCount / time * 1e3);
                frameCount = 0;
                meanset.push(frameRate);
                if (meanset.length > 10) {
                    meanset.shift();
                }
                meantot = meanset.reduce(function(a, b) {
                    return a + b;
                });
                mean = (meantot / meanset.length).toFixed(1);
            }
            module.exports = {
                countFrame: function() {
                    frameCount += 1;
                },
                get frameRate() {
                    return frameRate;
                },
                kill: function() {
                    if (started) {
                        timer.clear(hash);
                    }
                },
                draw: function(ctx) {
                    ctx.resetTransform();
                    ctx.globalAlpha = .5;
                    ctx.font = "30px Verdana";
                    ctx.fillStyle = "#f55";
                    ctx.textBaseline = "top";
                    ctx.textAlign = "left";
                    ctx.fillText(frameRate + "/" + mean, 20, 20);
                },
                start: function() {
                    if (!started) {
                        hash = timer.setInterval(step, 1e3);
                    }
                }
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./timer.js": 55
    } ],
    50: [ function(require, module, exports) {
        var counter = 0;
        module.exports = {
            get lastId() {
                return counter;
            },
            get nextId() {
                counter += 1;
                return counter;
            }
        };
    }, {} ],
    51: [ function(require, module, exports) {
        (function(global) {
            var i, key, sine = {}, cosine = {};
            for (i = 6.28; i >= -6.28; i -= .01) {
                key = i.toFixed(2);
                sine[key] = global.Math.sin(i);
                cosine[key] = global.Math.cos(i);
            }
            sine["-0.00"] = sine["0.00"];
            cosine["-0.00"] = cosine["0.00"];
            module.exports = {
                PI: 3.14159,
                PI2: 6.28318,
                sin: function(theta) {
                    var key;
                    theta %= this.PI2;
                    key = theta.toFixed(2);
                    return sine[key];
                },
                cos: function(theta) {
                    var key;
                    theta %= this.PI2;
                    key = theta.toFixed(2);
                    return cosine[key];
                },
                abs: function(num) {
                    return num < 0 ? -num : num;
                }
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {} ],
    52: [ function(require, module, exports) {
        (function(global) {
            module.exports = {
                cloneArray: function(arr) {
                    var clone = [];
                    arr.forEach(function(item) {
                        clone.push(this.clone(item));
                    }, this);
                    return clone;
                },
                cloneObject: function(root) {
                    var key, clone = {};
                    if ("clone" in root && typeof root.clone === "function") {
                        return root.clone();
                    }
                    for (key in root) {
                        clone[key] = this.clone(root[key]);
                    }
                    return clone;
                },
                clone: function(root) {
                    if (root instanceof global.Array) {
                        return this.cloneArray(root);
                    } else if (typeof root === "object") {
                        return this.cloneObject(root);
                    } else {
                        return root;
                    }
                },
                mergeLeft: function(root, other, deep) {
                    var key, target;
                    root = root || {};
                    other = other || {};
                    target = deep ? this.clone(root) : root;
                    for (key in other) {
                        root[key] = other[key];
                    }
                    return root;
                },
                mergeDefaults: function(root, other, deep) {
                    var key, target;
                    root = root || {};
                    other = other || {};
                    target = deep ? this.clone(root) : root;
                    for (key in other) {
                        if (!(key in target) || typeof target[key] === "undefined") {
                            target[key] = other[key];
                        }
                    }
                    return target;
                }
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {} ],
    53: [ function(require, module, exports) {
        (function(global) {
            var i, len = 200, set = [], curr = 0;
            for (i = 0; i < len; i += 1) {
                set.push(global.Math.random());
            }
            module.exports = function() {
                curr += 1;
                curr %= len;
                return set[curr];
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {} ],
    54: [ function(require, module, exports) {
        var random = require("./random.js");
        module.exports = {
            shuffle: function(arr) {
                var i, j, x;
                for (i = 0; i < arr.length; i += 1) {
                    j = parseInt(random() * (i + 1));
                    x = arr[i];
                    arr[i] = arr[j];
                    arr[j] = x;
                }
                return arr;
            },
            range: function(start, end) {
                var i, len, arr = [];
                if (!end) {
                    end = start;
                    start = 0;
                }
                len = end - start;
                for (i = 0; i < len; i += 1) {
                    arr.push(i + start);
                }
                return arr;
            }
        };
    }, {
        "./random.js": 53
    } ],
    55: [ function(require, module, exports) {
        (function(global) {
            var Item = require("../item.js"), Counter = require("./id-counter.js"), timeLastUpdate = global.Date.now(), clearSet = {}, timeouts = [], timeoutsToAdd = [], intervals = [], intervalsToAdd = [];
            module.exports = Item().extend({
                update: function() {
                    var now = global.Date.now(), diff = now - timeLastUpdate, dormantTimeouts = [], dormantIntervals = [];
                    timeouts.forEach(function(entry) {
                        if (!(entry.id in clearSet)) {
                            entry.life -= diff;
                            if (entry.life <= 0) {
                                entry.event(-entry.life);
                            } else {
                                dormantTimeouts.push(entry);
                            }
                        }
                    });
                    timeouts = dormantTimeouts.concat(timeoutsToAdd);
                    timeoutsToAdd = [];
                    intervals.forEach(function(entry) {
                        if (!(entry.id in clearSet)) {
                            entry.life -= diff;
                            if (entry.life <= 0) {
                                entry.event(-entry.life);
                                entry.life = entry.delay;
                            }
                            dormantIntervals.push(entry);
                        }
                    });
                    intervals = dormantIntervals.concat(intervalsToAdd);
                    intervalsToAdd = [];
                    timeLastUpdate = now;
                },
                setTimeout: function(cb, delay, thisArg) {
                    var hash = Counter.nextId;
                    timeoutsToAdd.push({
                        event: cb.bind(thisArg),
                        life: delay,
                        id: hash
                    });
                    return hash;
                },
                setInterval: function(cb, delay, thisArg) {
                    var hash = Counter.nextId;
                    intervalsToAdd.push({
                        event: cb.bind(thisArg),
                        life: delay,
                        delay: delay,
                        id: hash
                    });
                    return hash;
                },
                clear: function(hash) {
                    clearSet[hash] = true;
                }
            });
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "../item.js": 35,
        "./id-counter.js": 50
    } ],
    56: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = $.CollisionHandler({
            name: "racetrack"
        });
    }, {
        dragonjs: 17
    } ],
    57: [ function(require, module, exports) {
        module.exports = [ {
            name: "Clydesdale Clive",
            body: 325
        }, {
            name: "Arabian Andy",
            body: 423
        }, {
            name: "Mustang Mike",
            body: 154
        }, {
            name: "Ronny Roan",
            body: 254
        } ];
    }, {} ],
    58: [ function(require, module, exports) {
        var $ = require("dragonjs");
        $.addFont("Wonder", {
            src: "8-bit-wonder.TTF"
        });
        $.loadAssets(function() {
            $.debug();
            $.addScreens([ require("./screens/gear.js"), require("./screens/train.js"), require("./screens/care.js") ]);
        });
    }, {
        "./screens/care.js": 65,
        "./screens/gear.js": 66,
        "./screens/train.js": 71,
        dragonjs: 17
    } ],
    59: [ function(require, module, exports) {
        var $ = require("dragonjs"), Horse = require("./sprites/horse.js"), Picker = require("./picker.js"), Stats = require("./stats/horse.js");
        function scale(difficulty) {
            var steps = [ 1, 1.2, 1.4, 1.6, 1.8 ], bonus = $.random() * .1;
            return steps[difficulty] + bonus;
        }
        module.exports = function(difficulty) {
            var horse = Picker.next.horse;
            return Horse({
                name: horse.name,
                stats: Stats({
                    body: horse.body * scale(difficulty)
                })
            });
        };
    }, {
        "./picker.js": 63,
        "./sprites/horse.js": 78,
        "./stats/horse.js": 92,
        dragonjs: 17
    } ],
    60: [ function(require, module, exports) {
        module.exports = {
            none: function() {},
            flu: function(set) {
                set.speed *= .8;
                set.jump *= .8;
                set.strength *= .8;
            },
            thrush: function(set) {
                set.speed *= .2;
            },
            tetanus: function() {},
            rainRot: function() {},
            swampFever: function() {}
        };
    }, {} ],
    61: [ function(require, module, exports) {
        var $ = require("dragonjs"), Lane = require("./sprites/track/lane.js"), HayBale = require("./sprites/track/items/haybale.js"), MudPit = require("./sprites/track/items/mudpit.js"), player = require("./player.js"), makeHorse = require("./horse-factory.js"), itemCount = {
            none: 0,
            low: 4,
            medium: 8,
            high: 12
        };
        module.exports = function(difficulty, opts) {
            var i, len = itemCount[opts.density], bonus = $.random() * itemCount[opts.density] / 2, itemSet = [];
            len += bonus;
            len = 1;
            for (i = 0; i < len; i += 1) {
                itemSet.push(HayBale({
                    position: .3
                }));
                itemSet.push(MudPit({
                    position: .5
                }));
            }
            return function(order) {
                return Lane({
                    horse: difficulty ? makeHorse(difficulty - 1) : player.horse,
                    order: order,
                    items: itemSet
                });
            };
        };
    }, {
        "./horse-factory.js": 59,
        "./player.js": 64,
        "./sprites/track/items/haybale.js": 84,
        "./sprites/track/items/mudpit.js": 86,
        "./sprites/track/lane.js": 87,
        dragonjs: 17
    } ],
    62: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = function(length) {
            return $.shuffle($.range(length));
        };
    }, {
        dragonjs: 17
    } ],
    63: [ function(require, module, exports) {
        (function(global) {
            var $ = require("dragonjs"), stable = require("./data/horses.json");
            module.exports = {
                next: {
                    get horse() {
                        var index = global.Math.floor($.random() * stable.length);
                        return stable[index];
                    },
                    get jockey() {
                        return "jimmy";
                    }
                }
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./data/horses.json": 57,
        dragonjs: 17
    } ],
    64: [ function(require, module, exports) {
        var Horse = require("./sprites/horse.js"), Jockey = require("./sprites/jockey.js");
        module.exports = {
            money: 100,
            stats: require("./shop-stats.js"),
            horse: Horse(),
            jockey: Jockey()
        };
    }, {
        "./shop-stats.js": 72,
        "./sprites/horse.js": 78,
        "./sprites/jockey.js": 79
    } ],
    65: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = $.Screen({
            name: "care",
            sprites: [ require("../sprites/buttons/open-gear.js"), require("../sprites/buttons/open-train.js"), require("../sprites/buttons/open-care.js"), require("../sprites/buttons/race.js") ],
            depth: 0
        }).extend({
            draw: function(ctx) {
                ctx.fillStyle = "#fde142";
                ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
                this.base.draw(ctx);
            }
        });
    }, {
        "../sprites/buttons/open-care.js": 74,
        "../sprites/buttons/open-gear.js": 75,
        "../sprites/buttons/open-train.js": 76,
        "../sprites/buttons/race.js": 77,
        dragonjs: 17
    } ],
    66: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = $.Screen({
            name: "gear",
            sprites: [ require("../sprites/buttons/open-gear.js"), require("../sprites/buttons/open-train.js"), require("../sprites/buttons/open-care.js"), require("../sprites/buttons/race.js") ],
            depth: 0
        }).extend({
            draw: function(ctx) {
                ctx.fillStyle = "#fde142";
                ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
                this.base.draw(ctx);
            }
        });
    }, {
        "../sprites/buttons/open-care.js": 74,
        "../sprites/buttons/open-gear.js": 75,
        "../sprites/buttons/open-train.js": 76,
        "../sprites/buttons/race.js": 77,
        dragonjs: 17
    } ],
    67: [ function(require, module, exports) {
        var $ = require("dragonjs"), result = require("../sprites/track/raceresult.js");
        module.exports = $.Screen({
            name: "raceresult",
            sprites: [ result.win, result.lose ],
            depth: 10
        }).extend({
            start: function(win) {
                if (win) {
                    result.win.start();
                } else {
                    result.lose.start();
                }
                this.base.start();
            },
            stop: function() {
                result.win.stop();
                result.lose.stop();
                this.base.stop();
            }
        });
    }, {
        "../sprites/track/raceresult.js": 89,
        dragonjs: 17
    } ],
    68: [ function(require, module, exports) {
        (function(global) {
            var $ = require("dragonjs"), countdown = require("../sprites/track/countdown.js");
            module.exports = $.Screen({
                name: "startrace",
                sprites: countdown,
                depth: 10,
                on: {
                    ready: function() {
                        this.start();
                    }
                }
            }).extend({
                start: function() {
                    var that = this;
                    function count(time) {
                        return function() {
                            if (time > 0) {
                                countdown.text = time;
                                global.setTimeout(count(time - 1), 1e3);
                            } else {
                                countdown.text = "and they're off!";
                                global.setTimeout(function() {
                                    that.stop();
                                }, 1e3);
                                $.screen("track").race();
                            }
                        };
                    }
                    count(4)();
                    this.base.start();
                }
            });
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "../sprites/track/countdown.js": 83,
        dragonjs: 17
    } ],
    69: [ function(require, module, exports) {
        (function(global) {
            var $ = require("dragonjs"), player = require("../player.js"), LaneOrdering = require("../lane-ordering.js");
            module.exports = function(opts) {
                var items = [], lanes = [], laneOrdering = LaneOrdering(opts.laneFactories.length);
                opts.laneFactories.forEach(function(factory, i) {
                    var lane = factory(laneOrdering[i]);
                    lanes.push(lane);
                    items = items.concat(lane.getSprites());
                });
                return $.Screen({
                    name: "track",
                    collisions: require("../collisions/racetrack.js"),
                    sprites: lanes.concat(items),
                    depth: 0,
                    on: {
                        $added: function() {
                            this.start();
                        }
                    }
                }).extend({
                    trackLength: 0,
                    start: function() {
                        $.addScreens([ require("./startrace.js"), require("./raceresult.js") ]);
                        this.base.start();
                    },
                    race: function() {
                        lanes.forEach(function(lane) {
                            lane.race(this.trackLength);
                        }, this);
                    },
                    endRace: function(playerWon, winner) {
                        lanes.forEach(function(lane) {
                            lane.pause();
                        });
                        $.screen("raceresult").start(playerWon);
                        global.setTimeout(function() {
                            player.horse.endRace();
                            $.removeScreen("startrace");
                            $.removeScreen("raceresult");
                            $.removeScreen("track");
                            $.screen("train").start();
                        }, 2e3);
                        this.pause();
                    },
                    draw: function(ctx) {
                        ctx.fillStyle = "#67fb04";
                        ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
                        this.base.draw(ctx);
                    }
                });
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "../collisions/racetrack.js": 56,
        "../lane-ordering.js": 62,
        "../player.js": 64,
        "./raceresult.js": 67,
        "./startrace.js": 68,
        dragonjs: 17
    } ],
    70: [ function(require, module, exports) {
        var Track = require("../track.js"), makeLane = require("../../lane-factory.js");
        module.exports = function() {
            var laneConf = {
                density: "low",
                terrain: "dirt",
                weather: "comfy",
                type: "rural"
            };
            return Track({
                laneFactories: [ makeLane(false, laneConf), makeLane(2, laneConf), makeLane(1, laneConf), makeLane(1, laneConf) ]
            }).extend({
                trackLength: 3e3
            });
        };
    }, {
        "../../lane-factory.js": 61,
        "../track.js": 69
    } ],
    71: [ function(require, module, exports) {
        (function(global) {
            var $ = require("dragonjs"), train = require("../sprites/buttons/open-train.js"), player = require("../player.js"), TrainLabel = require("../sprites/shop/train-label.js"), StatLabel = require("../sprites/shop/stat-label.js"), addRank = require("../sprites/buttons/add-rank.js"), shopStats = require("../shop-stats.js");
            module.exports = $.Screen({
                name: "train",
                sprites: [ require("../sprites/shop/ranks.js"), require("../sprites/buttons/open-gear.js"), train, require("../sprites/buttons/open-care.js"), require("../sprites/buttons/race.js"), addRank("gym", function() {
                    player.jockey.stats.core.body += 1;
                }), addRank("coach"), addRank("facility", function() {
                    var steps = [ 250, 200, 150, 100, 100 ], bonus = global.Math.floor($.random() * 50), gain = steps[shopStats.facility - 1] + bonus;
                    player.horse.stats.core.body += gain;
                }), addRank("groom"), addRank("doctor"), TrainLabel("Gym"), TrainLabel("Coach"), TrainLabel("Facility"), TrainLabel("Groom"), TrainLabel("Doctor"), StatLabel("horse", "body"), StatLabel("horse", "mind"), StatLabel("horse", "health"), StatLabel("jockey", "body"), StatLabel("jockey", "mind"), StatLabel("jockey", "temper") ],
                one: {
                    $added: function() {
                        this.start();
                        train.pause();
                        train.useStrip("down");
                    }
                },
                depth: 0
            }).extend({
                draw: function(ctx) {
                    ctx.fillStyle = "#fde142";
                    ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
                    this.base.draw(ctx);
                }
            });
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "../player.js": 64,
        "../shop-stats.js": 72,
        "../sprites/buttons/add-rank.js": 73,
        "../sprites/buttons/open-care.js": 74,
        "../sprites/buttons/open-gear.js": 75,
        "../sprites/buttons/open-train.js": 76,
        "../sprites/buttons/race.js": 77,
        "../sprites/shop/ranks.js": 80,
        "../sprites/shop/stat-label.js": 81,
        "../sprites/shop/train-label.js": 82,
        dragonjs: 17
    } ],
    72: [ function(require, module, exports) {
        var opts = {};
        module.exports = {
            groom: opts.groom || 0,
            facility: opts.facility || 0,
            doctor: opts.doctor || 0,
            gym: opts.gym || 0,
            coach: opts.coach || 0
        };
    }, {} ],
    73: [ function(require, module, exports) {
        var $ = require("dragonjs"), len = $.canvas.height * .1, player = require("../../player.js"), ranks = require("../shop/ranks.js");
        module.exports = function(name, onpress) {
            onpress = onpress || function() {};
            return $.ui.Button({
                pos: $.Point(ranks.skillpos[name].x + ranks.realWidth - len, ranks.skillpos[name].y - len - 2),
                size: $.Dimension(len, len),
                strips: {
                    up: "buttons/plus.png",
                    down: "buttons/plus.null.png"
                },
                onpress: function() {
                    if (player.stats[name] < 5) {
                        player.stats[name] += 1;
                        onpress();
                    }
                    if (player.stats[name] >= 5) {
                        this.auto = false;
                        this.useStrip("down");
                    }
                }
            });
        };
    }, {
        "../../player.js": 64,
        "../shop/ranks.js": 80,
        dragonjs: 17
    } ],
    74: [ function(require, module, exports) {
        var $ = require("dragonjs"), height = $.canvas.height * .32, width = .1;
        module.exports = $.ui.Button({
            name: "open-care",
            strips: {
                up: "buttons/care.png",
                down: "buttons/care.down.png"
            },
            pos: $.Point(0, $.canvas.height - height),
            size: $.Dimension($.canvas.width * width, height),
            onpress: function() {
                $.screen("train").stop();
                $.screen("gear").stop();
                $.screen("care").start();
                this.pause();
                require("./open-gear.js").start();
                require("./open-train.js").start();
            }
        }).extend({
            width: width,
            realWidth: $.canvas.width * width
        });
    }, {
        "./open-gear.js": 75,
        "./open-train.js": 76,
        dragonjs: 17
    } ],
    75: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = $.ui.Button({
            name: "open-gear",
            pos: $.Point(0, 0),
            size: $.Dimension($.canvas.width * .1, $.canvas.height * .32),
            strips: {
                up: "buttons/gear.png",
                down: "buttons/gear.down.png"
            },
            onpress: function() {
                $.screen("train").stop();
                $.screen("care").stop();
                $.screen("gear").start();
                this.pause();
                require("./open-train.js").start();
                require("./open-care.js").start();
            }
        });
    }, {
        "./open-care.js": 74,
        "./open-train.js": 76,
        dragonjs: 17
    } ],
    76: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = $.ui.Button({
            name: "open-train",
            pos: $.Point(0, $.canvas.height * .32),
            size: $.Dimension($.canvas.width * .1, $.canvas.height * .36),
            strips: {
                up: "buttons/train.png",
                down: "buttons/train.down.png"
            },
            onpress: function() {
                $.screen("gear").stop();
                $.screen("care").stop();
                $.screen("train").start();
                this.pause();
                require("./open-gear.js").start();
                require("./open-care.js").start();
            }
        });
    }, {
        "./open-care.js": 74,
        "./open-gear.js": 75,
        dragonjs: 17
    } ],
    77: [ function(require, module, exports) {
        var $ = require("dragonjs"), Riverton = require("../../screens/tracks/riverton.js"), width = .18;
        module.exports = $.ui.Button({
            pos: $.Point($.canvas.width * (1 - width), 0),
            size: $.Dimension($.canvas.width * width, $.canvas.height),
            strips: {
                up: "buttons/start-race.png",
                down: "buttons/start-race.down.png"
            },
            onpress: function() {
                $.screen("train").stop();
                $.screen("gear").stop();
                $.screen("care").stop();
                $.addScreens(Riverton());
            }
        }).extend({
            width: width,
            realWidth: $.canvas.width * width
        });
    }, {
        "../../screens/tracks/riverton.js": 70,
        dragonjs: 17
    } ],
    78: [ function(require, module, exports) {
        (function(global) {
            var $ = require("dragonjs"), Roster = require("../picker.js"), Illness = require("../illness.js"), Stats = require("../stats/horse.js"), shopStats = require("../shop-stats.js");
            module.exports = function(opts) {
                var height, starty, boost, trot, stride, lean = -1, theta = 3.14;
                opts = opts || {};
                return $.Sprite({
                    name: opts.name || Roster.next.horse.name,
                    kind: "horse",
                    depth: 100,
                    collisions: [ require("../collisions/racetrack.js"), $.collisions ],
                    mask: $.Rectangle(),
                    strips: {
                        horse: "horse.png"
                    },
                    scale: .5,
                    on: {
                        "$collide#screenedge/right": function() {
                            this.speed.x = 0;
                            this.scale(2);
                            this.rotation = 0;
                            this.pos.x = $.canvas.width / 2 - this.size().width / 2;
                            this.pos.y = $.canvas.height / 2 - this.size().height / 2;
                            $.screen("track").endRace(this === require("../player.js").horse, this);
                        }
                    }
                }).extend({
                    stats: Stats(),
                    racing: false,
                    endRace: function() {
                        this.racing = false;
                        this.scale(.5);
                        this.rotation = 0;
                    },
                    race: function(trackLength) {
                        this.racing = true;
                        starty = this.pos.y;
                        trot = .08 * $.random();
                        boost = $.random() * 10 + 2;
                        this.speed.x = stride = this.stats.adj.body / trackLength;
                    },
                    update: function() {
                        if (this.racing) {
                            theta += .15 + trot;
                            if (theta > 3.14) {
                                height = 8 + 10 * $.random();
                                lean *= -1;
                                this.rotation = lean * .1 * (1 + $.random());
                                boost -= 1;
                                if (boost < -8) {
                                    boost = $.random() * 10 + 2;
                                    this.speed.x = stride * 2.5;
                                } else if (boost < 0) {
                                    this.speed.x = stride;
                                }
                            }
                            theta %= 3.14;
                            this.pos.y = starty - height * global.Math.abs(global.Math.sin(theta));
                        }
                        this.base.update();
                    }
                });
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "../collisions/racetrack.js": 56,
        "../illness.js": 60,
        "../picker.js": 63,
        "../player.js": 64,
        "../shop-stats.js": 72,
        "../stats/horse.js": 92,
        dragonjs: 17
    } ],
    79: [ function(require, module, exports) {
        var $ = require("dragonjs"), Roster = require("../picker.js"), Stats = require("../stats/jockey.js");
        module.exports = function(opts) {
            opts = opts || {};
            return $.Sprite({
                name: opts.name || Roster.next.jockey.name,
                kind: "jockey",
                strips: {
                    jockey: "jockey.png"
                },
                size: $.Dimension(64, 64),
                pos: $.Point(100, 100),
                depth: 2
            }).extend({
                stats: Stats()
            });
        };
    }, {
        "../picker.js": 63,
        "../stats/jockey.js": 94,
        dragonjs: 17
    } ],
    80: [ function(require, module, exports) {
        var $ = require("dragonjs"), stats = require("../../shop-stats.js"), race = require("../buttons/race.js"), open = require("../buttons/open-care.js"), width = $.canvas.width, height = $.canvas.height, center = (width - race.realWidth - open.realWidth) / 2 + open.realWidth, realWidth = width * .3, margin = width * .02;
        module.exports = $.Sprite({
            name: "skillrank-master",
            strips: {
                strip: $.AnimationStrip("icons/train-pips.png", {
                    frames: 6
                })
            }
        }).extend({
            skillpos: {
                facility: $.Point(center - margin - realWidth, height * .5),
                groom: $.Point(center - margin - realWidth, height * .7),
                doctor: $.Point(center - margin - realWidth, height * .9),
                gym: $.Point(center + margin, height * .5),
                coach: $.Point(center + margin, height * .7)
            },
            realWidth: realWidth,
            realHeight: 12,
            update: function() {},
            draw: function(ctx) {
                var key;
                for (key in stats) {
                    this.strip.frame = stats[key];
                    this.move(this.skillpos[key]);
                    this.base.base.draw(ctx);
                    this.strip.draw(ctx, $.Dimension(realWidth, 8));
                }
            }
        });
    }, {
        "../../shop-stats.js": 72,
        "../buttons/open-care.js": 74,
        "../buttons/race.js": 77,
        dragonjs: 17
    } ],
    81: [ function(require, module, exports) {
        var $ = require("dragonjs"), player = require("../../player.js"), race = require("../buttons/race.js"), open = require("../buttons/open-care.js"), cwidth = $.canvas.width, cheight = $.canvas.height, center = (cwidth - race.realWidth - open.realWidth) / 2 + open.realWidth, margin = cwidth * .01, grid = {
            horse: {
                body: {
                    name: "Body",
                    pos: $.Point(open.realWidth + margin, cheight * .1),
                    side: "left"
                },
                mind: {
                    name: "Mind",
                    pos: $.Point(open.realWidth + margin, cheight * .2),
                    side: "left"
                },
                health: {
                    name: "Health",
                    pos: $.Point(open.realWidth + margin, cheight * .3),
                    side: "left"
                }
            },
            jockey: {
                body: {
                    name: "Body",
                    pos: $.Point(race.pos.x - margin, cheight * .1),
                    side: "right"
                },
                mind: {
                    name: "Mind",
                    pos: $.Point(race.pos.x - margin, cheight * .2),
                    side: "right"
                },
                temper: {
                    name: "Temper",
                    pos: $.Point(race.pos.x - margin, cheight * .3),
                    side: "right"
                }
            }
        };
        module.exports = function(type, name) {
            return $.ui.Label({
                text: grid[type][name].name + " " + player[type].stats.adj[name],
                pos: grid[type][name].pos,
                style: function(ctx) {
                    ctx.font = "12px Wonder";
                    ctx.textBaseline = "bottom";
                    ctx.textAlign = grid[type][name].side;
                    ctx.fillStyle = "black";
                }
            }).extend({
                update: function() {
                    this.text = grid[type][name].name + " " + player[type].stats.adj[name];
                }
            });
        };
    }, {
        "../../player.js": 64,
        "../buttons/open-care.js": 74,
        "../buttons/race.js": 77,
        dragonjs: 17
    } ],
    82: [ function(require, module, exports) {
        var $ = require("dragonjs"), len = $.canvas.height * .1, ranks = require("./ranks.js");
        module.exports = function(name) {
            var keyname = name.toLowerCase();
            return $.ui.Label({
                text: name,
                pos: $.Point(ranks.skillpos[keyname].x + ranks.realWidth - len, ranks.skillpos[keyname].y - 5),
                style: function(ctx) {
                    ctx.font = "16px Wonder";
                    ctx.textBaseline = "bottom";
                    ctx.textAlign = "right";
                    ctx.fillStyle = "black";
                }
            });
        };
    }, {
        "./ranks.js": 80,
        dragonjs: 17
    } ],
    83: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = $.ui.Label({
            name: "countdown",
            text: "-99",
            pos: $.Point($.canvas.width / 2, $.canvas.height / 2),
            style: function(ctx) {
                ctx.font = "16px Wonder";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillStyle = "black";
            }
        });
    }, {
        dragonjs: 17
    } ],
    84: [ function(require, module, exports) {
        var $ = require("dragonjs"), LaneItem = require("./lane-item.js");
        module.exports = function(opts) {
            return LaneItem({
                strips: {
                    normal: $.AnimationStrip("haybale.png", {
                        frames: 3
                    })
                },
                on: {
                    "$colliding.horse": function(horse) {
                        horse.flush(this);
                        this.mask.resize($.Dimension(this.mask.width, this.mask.height * .98));
                        this.mask.move($.Point(this.mask.x, this.pos.y + this.size().height - this.mask.height));
                        if (this.mask.height < 4) {
                            this.strip.frame = 2;
                        } else if (this.mask.height < 7) {
                            this.strip.frame = 1;
                        }
                    }
                },
                size: $.Dimension(10, 10),
                mask: $.Rectangle()
            }).extend({
                lanePos: opts.position
            });
        };
    }, {
        "./lane-item.js": 85,
        dragonjs: 17
    } ],
    85: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = function(opts) {
            $.mergeDefaults(opts, {
                kind: "lane-item",
                collisions: [],
                depth: 2
            });
            opts.collisions = [].concat(opts.collisions, require("../../../collisions/racetrack.js"));
            return $.Sprite(opts);
        };
    }, {
        "../../../collisions/racetrack.js": 56,
        dragonjs: 17
    } ],
    86: [ function(require, module, exports) {
        var $ = require("dragonjs"), LaneItem = require("./lane-item.js");
        module.exports = function(opts) {
            return LaneItem({
                mask: $.Rectangle(),
                strips: "mudpit.png",
                on: {
                    "$collide.horse": function(horse) {
                        console.debug("slow it down", horse.name);
                    }
                },
                size: $.Dimension(10, 3)
            }).extend({
                lanePos: opts.position
            });
        };
    }, {
        "./lane-item.js": 85,
        dragonjs: 17
    } ],
    87: [ function(require, module, exports) {
        var $ = require("dragonjs"), LaneName = require("./lanename.js");
        module.exports = function(opts) {
            var items = opts.items || [], horse = opts.horse, order = opts.order, ypos = order * 50 + 40, height = $.canvas.height / 20, name = LaneName({
                name: order + 1,
                longname: horse.name,
                pos: $.Point(2, ypos)
            });
            horse.move($.Point(20, ypos));
            items.forEach(function(item) {
                item.move($.Point(item.lanePos * $.canvas.width, ypos + height - item.size().height));
            });
            return $.Sprite({
                name: "lane",
                strips: "lane.png",
                size: $.Dimension($.canvas.width, height),
                pos: $.Point(0, ypos),
                depth: 1
            }).extend({
                getSprites: function() {
                    return items.concat(name, horse);
                },
                update: function() {
                    items.forEach(function(item) {});
                },
                pause: function() {
                    horse.pause();
                    name.pause();
                    this.base.pause();
                },
                race: function(length) {
                    horse.race(length);
                }
            });
        };
    }, {
        "./lanename.js": 88,
        dragonjs: 17
    } ],
    88: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = function(opts) {
            return $.ui.Label({
                text: opts.name,
                depth: 10,
                pos: opts.pos,
                size: $.Dimension(15, 15),
                style: function(ctx) {
                    ctx.font = "12px Wonder";
                    ctx.textBaseline = "top";
                    ctx.textAlign = "left";
                    ctx.fillStyle = "black";
                },
                collisionSets: [ $.collisions ],
                mask: $.Rectangle(),
                on: {
                    "$collide#screenhold": function() {
                        this.text = opts.longname;
                    },
                    "$separate#screenhold": function() {
                        this.text = opts.name;
                    }
                }
            });
        };
    }, {
        dragonjs: 17
    } ],
    89: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = {
            win: $.Sprite({
                name: "raceresult-win",
                strips: "win.png",
                updating: false,
                drawing: false,
                scale: 3,
                pos: $.Point($.canvas.width / 2 - 25 * 3, $.canvas.height / 2 - 4 * 3)
            }),
            lose: $.Sprite({
                name: "raceresult-lose",
                strips: "lost.png",
                updating: false,
                drawing: false,
                scale: 3,
                pos: $.Point($.canvas.width / 2 - 28 * 3, $.canvas.height / 2 - 4 * 3)
            })
        };
    }, {
        dragonjs: 17
    } ],
    90: [ function(require, module, exports) {
        module.exports = function(Core) {
            var modifiers = {};
            var group = {
                core: null,
                adj: null,
                reset: function() {
                    group.adj = group.core.clone();
                    modifiers = {};
                },
                refresh: function() {
                    var name, mod;
                    group.adj = group.core.clone();
                    for (name in modifiers) {
                        mod = modifiers[name];
                        if (mod) {
                            adj = mod(adj);
                        }
                    }
                },
                modifier: {
                    add: function(name, mod) {
                        modifiers[name] = mod;
                        group.refresh();
                    },
                    remove: function(name) {
                        modifiers[name] = false;
                        group.refresh();
                    }
                }
            };
            group.core = Core(group.refresh);
            group.adj = Core(group.refresh);
            return group;
        };
    }, {} ],
    91: [ function(require, module, exports) {
        module.exports = function(opts) {
            var set;
            opts = opts || {};
            set = {
                body: opts.body || 120,
                mind: opts.mind || 1,
                health: opts.health || 1
            };
            return function(refresh) {
                return {
                    get body() {
                        return set.body;
                    },
                    set body(newval) {
                        set.body = newval;
                        refresh();
                    },
                    get mind() {
                        return set.mind;
                    },
                    set mind(newval) {
                        set.mind = newval;
                        refresh();
                    },
                    get health() {
                        return set.health;
                    },
                    set health(newval) {
                        set.health = newval;
                        refresh();
                    },
                    clone: function() {
                        return module.exports(this)(refresh);
                    }
                };
            };
        };
    }, {} ],
    92: [ function(require, module, exports) {
        var Core = require("./horse.core.js"), Group = require("./group.js");
        module.exports = function(opts) {
            return Group(Core(opts));
        };
    }, {
        "./group.js": 90,
        "./horse.core.js": 91
    } ],
    93: [ function(require, module, exports) {
        module.exports = function(opts) {
            var set;
            opts = opts || {};
            set = {
                body: opts.body || 120,
                mind: opts.mind || 1,
                temper: opts.temper || 1
            };
            return function(refresh) {
                return {
                    get body() {
                        return set.body;
                    },
                    set body(newval) {
                        set.body = newval;
                        refresh();
                    },
                    get mind() {
                        return set.mind;
                    },
                    set mind(newval) {
                        set.mind = newval;
                        refresh();
                    },
                    get temper() {
                        return set.health;
                    },
                    set temper(newval) {
                        set.temper = newval;
                        refresh();
                    },
                    clone: function() {
                        return module.exports(this)(refresh);
                    }
                };
            };
        };
    }, {} ],
    94: [ function(require, module, exports) {
        var Core = require("./jockey.core.js"), Group = require("./group.js");
        module.exports = function(opts) {
            return Group(Core(opts));
        };
    }, {
        "./group.js": 90,
        "./jockey.core.js": 93
    } ]
}, {}, [ 58, 59, 60, 61, 62, 63, 64, 72 ]);