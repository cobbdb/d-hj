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
        module.exports = function() {
            throw Error("[BaseClass] Abstract method was called without definition.");
        };
    }, {} ],
    2: [ function(require, module, exports) {
        var rebind = require("./rebind.js");
        function contructor(root) {
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
                return root;
            };
            root.implement = function() {
                var i, len = arguments.length;
                for (i = 0; i < len; i += 1) {
                    arguments[i](root);
                }
                return root;
            };
            return root;
        }
        contructor.Abstract = require("./abstract.js");
        contructor.Stub = require("./stub.js");
        contructor.Interface = require("./interface.js");
        module.exports = contructor;
    }, {
        "./abstract.js": 1,
        "./interface.js": 3,
        "./rebind.js": 4,
        "./stub.js": 5
    } ],
    3: [ function(require, module, exports) {
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
    4: [ function(require, module, exports) {
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
    5: [ function(require, module, exports) {
        module.exports = function() {};
    }, {} ],
    6: [ function(require, module, exports) {
        arguments[4][1][0].apply(exports, arguments);
    }, {
        dup: 1
    } ],
    7: [ function(require, module, exports) {
        arguments[4][2][0].apply(exports, arguments);
    }, {
        "./abstract.js": 6,
        "./interface.js": 8,
        "./rebind.js": 9,
        "./stub.js": 10,
        dup: 2
    } ],
    8: [ function(require, module, exports) {
        arguments[4][3][0].apply(exports, arguments);
    }, {
        dup: 3
    } ],
    9: [ function(require, module, exports) {
        arguments[4][4][0].apply(exports, arguments);
    }, {
        dup: 4
    } ],
    10: [ function(require, module, exports) {
        arguments[4][5][0].apply(exports, arguments);
    }, {
        dup: 5
    } ],
    11: [ function(require, module, exports) {
        module.exports = function() {
            var i, str = arguments[0], len = arguments.length;
            for (i = 1; i < len; i += 1) {
                str = str.replace(/%s/, arguments[i]);
            }
            return str;
        };
    }, {} ],
    12: [ function(require, module, exports) {
        (function(global) {
            module.exports = function(enabled) {
                var log, record = {}, cbQueue = {}, master = [], ls = global.localStorage || {};
                log = function(channel, data) {
                    var i, len, channel, entry;
                    var channelValid = typeof channel === "string";
                    var dataType = typeof data;
                    var dataValid = dataType !== "undefined" && dataType !== "function";
                    if (ls.lumberjack !== "on" && !enabled) {
                        return;
                    }
                    if (channelValid && dataValid) {
                        entry = {
                            time: new Date(),
                            data: data,
                            channel: channel,
                            id: master.length
                        };
                        record[channel] = record[channel] || [];
                        record[channel].push(entry);
                        master.push(entry);
                        cbQueue[channel] = cbQueue[channel] || [];
                        len = cbQueue[channel].length;
                        for (i = 0; i < len; i += 1) {
                            cbQueue[channel][i](data);
                        }
                    } else {
                        throw Error("Lumberjack Error: log(channel, data) requires an channel {String} and a payload {String|Object|Number|Boolean}.");
                    }
                };
                log.clear = function(channel) {
                    if (channel) {
                        record[channel] = [];
                    } else {
                        record = {};
                        master = [];
                    }
                };
                log.readback = function(channel, pretty) {
                    var channelValid = typeof channel === "string";
                    if (channelValid) {
                        if (pretty) {
                            return JSON.stringify(record[channel], null, 4);
                        }
                        return record[channel] || [];
                    }
                    throw Error("log.readback(channel, pretty) requires an channel {String}.");
                };
                log.readback.master = function(pretty) {
                    if (pretty) {
                        return JSON.stringify(master, null, 4);
                    }
                    return master;
                };
                log.readback.channels = function(pretty) {
                    var keys = Object.keys(record);
                    if (pretty) {
                        return JSON.stringify(keys);
                    }
                    return keys;
                };
                log.on = function(channel, cb) {
                    var channelValid = typeof channel === "string";
                    var cbValid = typeof cb === "function";
                    if (channelValid && cbValid) {
                        cbQueue[channel] = cbQueue[channel] || [];
                        cbQueue[channel].push(cb);
                    } else {
                        throw Error("log.on(channel, cb) requires an channel {String} and a callback {Function}.");
                    }
                };
                log.off = function(channel) {
                    var channelValid = typeof channel === "string";
                    if (channelValid) {
                        cbQueue[channel] = [];
                    } else {
                        throw Error("log.off(channel) requires an channel {String}.");
                    }
                };
                log.enable = function() {
                    enabled = true;
                };
                log.disable = function() {
                    enabled = false;
                };
                return log;
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {} ],
    13: [ function(require, module, exports) {
        var Dimension = require("./dimension.js"), Point = require("./point.js"), log = require("./log.js");
        module.exports = function(opts) {
            var timeLastFrame, timeSinceLastFrame = 0, updating = false, frames = opts.frames || 1, size = opts.size || Dimension(), start = opts.start || Point(), start = Point(size.width * start.x, size.height * start.y), direction = 1;
            return {
                size: size,
                frame: 0,
                speed: opts.speed || 0,
                load: function(cb) {
                    opts.sheet.load(cb);
                },
                start: function() {
                    timeLastFrame = Date.now();
                    updating = true;
                },
                pause: function() {
                    updating = false;
                },
                stop: function() {
                    updating = false;
                    timeSinceLastFrame = 0;
                    this.frame = 0;
                    direction = 1;
                },
                update: function() {
                    var now, elapsed, timeBetweenFrames;
                    if (updating && this.speed) {
                        timeBetweenFrames = 1 / this.speed * 1e3;
                        now = Date.now();
                        elapsed = now - timeLastFrame;
                        timeSinceLastFrame += elapsed;
                        if (timeSinceLastFrame >= timeBetweenFrames) {
                            timeSinceLastFrame = 0;
                            this.nextFrame();
                        }
                        timeLastFrame = now;
                    }
                },
                nextFrame: function() {
                    this.frame += direction;
                    if (opts.sinusoid) {
                        if (this.frame % (frames - 1) === 0) {
                            direction *= -1;
                        }
                    } else {
                        this.frame %= frames;
                    }
                    return this.frame;
                },
                draw: function(ctx, pos, scale, rotation) {
                    var finalSize, offset = this.frame * size.width;
                    scale = scale || Dimension(1, 1);
                    rotation = rotation || 0;
                    finalSize = Dimension(size.width * scale.width, size.height * scale.height);
                    ctx.save();
                    ctx.translate(pos.x + finalSize.width / 2, pos.y + finalSize.height / 2);
                    ctx.rotate(rotation);
                    ctx.drawImage(opts.sheet, start.x + offset, start.y, size.width, size.height, -finalSize.width / 2, -finalSize.height / 2, finalSize.width, finalSize.height);
                    ctx.restore();
                }
            };
        };
    }, {
        "./dimension.js": 23,
        "./log.js": 32,
        "./point.js": 36
    } ],
    14: [ function(require, module, exports) {
        module.exports = function(opts) {
            var audio = document.createElement("audio"), oldplay = audio.play;
            audio.loop = opts.loop || false;
            audio.volume = opts.volume || 1;
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
            opts.on = opts.on || {};
            audio.onloadeddata = opts.on.load;
            audio.onplay = opts.on.play;
            audio.onplaying = opts.on.playing;
            audio.onended = opts.on.ended;
            audio.src = "assets/sound/" + opts.src;
            return audio;
        };
    }, {} ],
    15: [ function(require, module, exports) {
        var mobile = require("./detect-mobile.js"), canvas = document.createElement("canvas");
        if (mobile) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        } else {
            if (localStorage.drago === "landscape") {
                canvas.width = 480;
                canvas.height = 320;
            } else {
                canvas.width = 320;
                canvas.height = 480;
            }
            canvas.style.border = "1px solid #000";
        }
        document.body.appendChild(canvas);
        canvas.mobile = mobile;
        canvas.ctx = canvas.getContext("2d");
        module.exports = canvas;
    }, {
        "./detect-mobile.js": 22
    } ],
    16: [ function(require, module, exports) {
        var Shape = require("./shape.js"), Vector = require("./vector.js"), Point = require("./point.js"), Dimension = require("./dimension.js");
        module.exports = function(pos, rad) {
            pos = pos || Point();
            rad = rad || 0;
            return Shape({
                pos: pos,
                name: "circle",
                intersects: {
                    rectangle: function(rect) {
                        var vect, pt = Point(this.x, this.y);
                        if (this.x > rect.right) pt.x = rect.right; else if (this.x < rect.x) pt.x = rect.x;
                        if (this.y > rect.bottom) pt.y = rect.bottom; else if (this.y < rect.y) pt.y = rect.y;
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
                draw: function(ctx) {
                    ctx.beginPath();
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "rgba(250, 50, 50, 0.5)";
                    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
                    ctx.stroke();
                },
                move: function(x, y) {
                    this.x = x;
                    this.y = y;
                    this.top = y - this.radius;
                    this.right = x + this.radius;
                    this.bottom = y + this.radius;
                    this.left = x - this.radius;
                },
                resize: function(rad) {
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
    }, {
        "./dimension.js": 23,
        "./point.js": 36,
        "./shape.js": 41,
        "./vector.js": 48
    } ],
    17: [ function(require, module, exports) {
        var BaseClass = require("baseclassjs"), Sprite = require("./sprite.js");
        module.exports = function(opts) {
            opts = opts || {};
            return Sprite(opts).extend({
                load: function(cb) {
                    cb();
                },
                drawing: opts.drawing === false ? false : true,
                updating: opts.updating === false ? false : true,
                start: function() {
                    this.drawing = true;
                    this.updating = true;
                },
                pause: function() {
                    this.drawing = true;
                    this.updating = false;
                },
                stop: function() {
                    this.drawing = false;
                    this.updating = false;
                },
                update: BaseClass.Stub,
                draw: BaseClass.Stub
            });
        };
    }, {
        "./sprite.js": 42,
        baseclassjs: 7
    } ],
    18: [ function(require, module, exports) {
        var Counter = require("./id-counter.js"), EventHandler = require("./event-handler.js"), BaseClass = require("baseclassjs"), Rectangle = require("./rectangle.js"), Point = require("./point.js");
        module.exports = function(opts) {
            var activeCollisions = {}, collisionsThisFrame = {}, collisionSets = [], updated = false;
            if (opts.collisionSets) {
                collisionSets = [].concat(opts.collisionSets);
            }
            return BaseClass({
                id: Counter.nextId,
                name: opts.name,
                mask: opts.mask || Rectangle(),
                offset: opts.offset || Point(),
                move: function(pos) {
                    this.mask.move(pos.x + this.offset.x, pos.y + this.offset.y);
                },
                intersects: function(mask) {
                    return this.mask.intersects(mask);
                },
                update: function() {
                    var that = this;
                    if (!updated) {
                        collisionSets.forEach(function(handler) {
                            handler.update(that);
                        });
                        updated = true;
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
            }).implement(EventHandler({
                events: opts.on,
                singles: opts.one
            }));
        };
    }, {
        "./event-handler.js": 25,
        "./id-counter.js": 29,
        "./point.js": 36,
        "./rectangle.js": 39,
        baseclassjs: 7
    } ],
    19: [ function(require, module, exports) {
        module.exports = function(opts) {
            var activeCollisions = [];
            return {
                name: opts.name,
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
                                intersects = pivot.intersects(other.mask), colliding = pivot.isCollidingWith(other.id);
                                if (intersects) {
                                    pivot.addCollision(other.id);
                                    if (!colliding) {
                                        pivot.trigger("collide/" + other.name, other);
                                    }
                                    pivot.trigger("colliding/" + other.name, other);
                                } else {
                                    if (colliding) {
                                        pivot.removeCollision(other.id);
                                        pivot.trigger("separate/" + other.name, other);
                                    }
                                    pivot.trigger("miss/" + other.name, other);
                                }
                            }
                        });
                    });
                },
                teardown: function() {
                    this.clearCollisions();
                }
            };
        };
    }, {} ],
    20: [ function(require, module, exports) {
        module.exports = {
            Shape: require("./shape.js"),
            Circle: require("./circle.js"),
            Rectangle: require("./rectangle.js"),
            Dimension: require("./dimension.js"),
            Point: require("./point.js"),
            Vector: require("./vector.js"),
            Polar: require("./polar.js"),
            FrameCounter: require("./frame-counter.js"),
            IdCounter: require("./id-counter.js"),
            random: require("./random.js"),
            Mouse: require("./mouse.js"),
            Keyboard: require("./keyboard.js"),
            EventHandler: require("./event-handler.js"),
            SpriteSheet: require("./spritesheet.js"),
            AnimationStrip: require("./animation-strip.js"),
            Audio: require("./audio.js"),
            Font: require("./font.js"),
            CollisionHandler: require("./collision-handler.js"),
            collisions: require("./dragon-collisions.js"),
            Game: require("./game.js"),
            canvas: require("./canvas.js"),
            Screen: require("./screen.js"),
            Collidable: require("./collidable.js"),
            Sprite: require("./sprite.js"),
            ClearSprite: require("./clear-sprite.js"),
            ui: {
                Slider: require("./ui/slider.js"),
                Button: require("./ui/button.js"),
                Label: require("./ui/label.js"),
                Decal: require("./ui/decal.js")
            }
        };
    }, {
        "./animation-strip.js": 13,
        "./audio.js": 14,
        "./canvas.js": 15,
        "./circle.js": 16,
        "./clear-sprite.js": 17,
        "./collidable.js": 18,
        "./collision-handler.js": 19,
        "./dimension.js": 23,
        "./dragon-collisions.js": 24,
        "./event-handler.js": 25,
        "./font.js": 26,
        "./frame-counter.js": 27,
        "./game.js": 28,
        "./id-counter.js": 29,
        "./keyboard.js": 31,
        "./mouse.js": 35,
        "./point.js": 36,
        "./polar.js": 37,
        "./random.js": 38,
        "./rectangle.js": 39,
        "./screen.js": 40,
        "./shape.js": 41,
        "./sprite.js": 42,
        "./spritesheet.js": 43,
        "./ui/button.js": 44,
        "./ui/decal.js": 45,
        "./ui/label.js": 46,
        "./ui/slider.js": 47,
        "./vector.js": 48
    } ],
    21: [ function(require, module, exports) {
        module.exports = {
            show: {
                fps: function() {}
            }
        };
    }, {} ],
    22: [ function(require, module, exports) {
        module.exports = "ontouchstart" in window;
    }, {} ],
    23: [ function(require, module, exports) {
        function Dimension(w, h) {
            return {
                width: w || 0,
                height: h || 0,
                clone: function() {
                    return Dimension(this.width, this.height);
                },
                equals: function(other) {
                    return this.width === other.width && this.height === other.height;
                },
                scale: function(scale) {
                    return Dimension(this.width * scale, this.height * scale);
                }
            };
        }
        module.exports = Dimension;
    }, {} ],
    24: [ function(require, module, exports) {
        var CollisionHandler = require("./collision-handler.js"), Dimension = require("./dimension.js");
        module.exports = CollisionHandler({
            name: "dragon"
        });
    }, {
        "./collision-handler.js": 19,
        "./dimension.js": 23
    } ],
    25: [ function(require, module, exports) {
        var BaseClass = require("baseclassjs");
        module.exports = function(opts) {
            var events = {}, singles = {}, name;
            opts = opts || {};
            for (name in opts.events) {
                events[name] = [ opts.events[name] ];
            }
            for (name in opts.singles) {
                singles[name] = [ opts.singles[name] ];
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
                    var that = this;
                    if (name in events) {
                        events[name].forEach(function(cb) {
                            cb.call(that, data);
                        });
                    }
                    if (name in singles) {
                        singles[name].forEach(function(cb) {
                            cb.call(that, data);
                        });
                        singles[name] = [];
                    }
                }
            });
        };
    }, {
        baseclassjs: 7
    } ],
    26: [ function(require, module, exports) {
        var str = require("curb"), tpl = "@font-face{font-family:'%s';font-style:%s;font-weight:%s;src:url(assets/fonts/%s);unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2212,U+2215,U+E0FF,U+EFFD,U+F000}", cache = {};
        module.exports = {
            load: function(opts) {
                var style;
                if (!cache[opts.name]) {
                    style = document.createElement("style");
                    style.innerHTML = str(tpl, opts.name, opts.style || "normal", opts.weight || "400", opts.src);
                    document.body.appendChild(style);
                    cache[opts.name] = true;
                }
            }
        };
    }, {
        curb: 11
    } ],
    27: [ function(require, module, exports) {
        var timeSinceLastSecond = frameCountThisSecond = frameRate = 0, timeLastFrame = Date.now();
        module.exports = {
            countFrame: function() {
                var timeThisFrame = Date.now(), elapsedTime = timeThisFrame - timeLastFrame;
                frameCountThisSecond += 1;
                timeLastFrame = timeThisFrame;
                timeSinceLastSecond += elapsedTime;
                if (timeSinceLastSecond >= 1e3) {
                    timeSinceLastSecond -= 1e3;
                    frameRate = frameCountThisSecond;
                    frameCountThisSecond = 0;
                }
            },
            get frameRate() {
                return frameRate;
            },
            draw: function(ctx) {
                ctx.font = "30px Verdana";
                ctx.fillStyle = "rgba(250, 50, 50, 0.5)";
                ctx.fillText(frameRate, 20, 50);
            }
        };
    }, {} ],
    28: [ function(require, module, exports) {
        var CollisionHandler = require("./collision-handler.js"), Point = require("./point.js"), Dimension = require("./dimension.js"), Circle = require("./circle.js"), Rectangle = require("./rectangle.js"), Collidable = require("./collidable.js"), FrameCounter = require("./frame-counter.js"), Mouse = require("./mouse.js"), canvas = require("./canvas.js"), ctx = canvas.ctx, Counter = require("./id-counter.js"), log = require("./log.js"), dragonCollisions = require("./dragon-collisions.js"), debug = false, screens = [], screenMap = {}, screensToAdd = [], screenRemoved = false, loadQueue = {}, running = false, masks = {
            screentap: Collidable({
                name: "screentap",
                mask: Circle(Point(), 8)
            }),
            screendrag: require("./mask-screendrag.js"),
            screenhold: require("./mask-screenhold.js"),
            screenedge: {
                top: Collidable({
                    name: "screenedge/top",
                    mask: Rectangle(Point(0, -9), Dimension(canvas.width, 10))
                }),
                right: Collidable({
                    name: "screenedge/right",
                    mask: Rectangle(Point(canvas.width - 1, 0), Dimension(10, canvas.height))
                }),
                bottom: Collidable({
                    name: "screenedge/bottom",
                    mask: Rectangle(Point(0, canvas.height - 1), Dimension(canvas.width, 10))
                }),
                left: Collidable({
                    name: "screenedge/left",
                    mask: Rectangle(Point(-9, 0), Dimension(10, canvas.height))
                })
            }
        };
        Mouse.on.down(function() {
            masks.screentap.move(Mouse.offset);
            dragonCollisions.update(masks.screentap);
        });
        module.exports = {
            debug: require("./debug-console.js"),
            screen: function(name) {
                return screenMap[name];
            },
            addScreens: function(set) {
                var id;
                if (set) {
                    set = [].concat(set);
                    id = Counter.nextId;
                    loadQueue[id] = set.length;
                    set.forEach(function(screen) {
                        screen.load(function() {
                            loadQueue[id] -= 1;
                            if (loadQueue[id] === 0) {
                                screensToAdd = screensToAdd.concat(set);
                            }
                        });
                    });
                }
            },
            removeScreen: function(screen) {
                screen.removed = true;
                screenRemoved = true;
            },
            run: function(debugMode) {
                var that = this, step = function() {
                    that.update();
                    that.draw();
                    that.teardown();
                    FrameCounter.countFrame();
                    if (running) {
                        window.requestAnimationFrame(step);
                    }
                };
                debug = debugMode;
                if (debugMode) {
                    window.Dragon = this;
                }
                if (!running) {
                    running = true;
                    window.requestAnimationFrame(step);
                }
            },
            kill: function() {
                running = false;
                screens.forEach(function(screen) {
                    screen.stop();
                });
            },
            update: function() {
                masks.screendrag.update();
                masks.screenhold.update();
                dragonCollisions.update(masks.screendrag);
                dragonCollisions.update(masks.screenhold);
                dragonCollisions.update(masks.screenedge.top);
                dragonCollisions.update(masks.screenedge.right);
                dragonCollisions.update(masks.screenedge.bottom);
                dragonCollisions.update(masks.screenedge.left);
                screens.forEach(function(screen) {
                    if (screen.updating()) {
                        screen.update();
                    }
                });
                dragonCollisions.handleCollisions();
                if (screensToAdd.length) {
                    screensToAdd.forEach(function(screen) {
                        screens.push(screen);
                        if (screen.name) {
                            screenMap[screen.name] = screen;
                        }
                        screen.trigger("ready");
                    });
                    screens.sort(function(a, b) {
                        return a.depth - b.depth;
                    });
                    screensToAdd = [];
                }
            },
            draw: function() {
                screens.forEach(function(screen) {
                    if (screen.drawing()) {
                        screen.draw(ctx, debug);
                    }
                });
                if (debug) {
                    FrameCounter.draw(ctx);
                    dragonCollisions.draw(ctx);
                }
            },
            teardown: function() {
                dragonCollisions.teardown();
                screens.forEach(function(screen) {
                    screen.teardown();
                });
                if (screenRemoved) {
                    screens = screens.filter(function(screen) {
                        return !screen.removed;
                    });
                    screenRemoved = false;
                }
            }
        };
    }, {
        "./canvas.js": 15,
        "./circle.js": 16,
        "./collidable.js": 18,
        "./collision-handler.js": 19,
        "./debug-console.js": 21,
        "./dimension.js": 23,
        "./dragon-collisions.js": 24,
        "./frame-counter.js": 27,
        "./id-counter.js": 29,
        "./log.js": 32,
        "./mask-screendrag.js": 33,
        "./mask-screenhold.js": 34,
        "./mouse.js": 35,
        "./point.js": 36,
        "./rectangle.js": 39
    } ],
    29: [ function(require, module, exports) {
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
    30: [ function(require, module, exports) {
        module.exports = function(src) {
            var img = new Image();
            img.ready = false;
            img.cmd = [];
            img.processLoadEvents = function() {
                this.cmd.forEach(function(cb) {
                    cb(img);
                });
                this.cmd = [];
            };
            img.onload = function() {
                this.ready = true;
                this.processLoadEvents();
            };
            img.load = function(cb) {
                cb = cb || function() {};
                if (this.ready) {
                    cb(img);
                } else {
                    this.cmd.push(cb);
                    this.src = "assets/img/" + src;
                }
            };
            return img;
        };
    }, {} ],
    31: [ function(require, module, exports) {
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
    32: [ function(require, module, exports) {
        var Lumberjack = require("lumberjackjs");
        module.exports = Lumberjack();
    }, {
        lumberjackjs: 12
    } ],
    33: [ function(require, module, exports) {
        var Collidable = require("./collidable.js"), Circle = require("./circle.js"), Point = require("./point.js"), Mouse = require("./mouse.js");
        module.exports = Collidable({
            name: "screendrag",
            mask: Circle(Point(), 8)
        }).extend({
            update: function() {
                if (Mouse.is.dragging) {
                    this.move(Mouse.offset);
                } else {
                    this.move(Point(-999, -999));
                }
            }
        });
    }, {
        "./circle.js": 16,
        "./collidable.js": 18,
        "./mouse.js": 35,
        "./point.js": 36
    } ],
    34: [ function(require, module, exports) {
        var Collidable = require("./collidable.js"), Circle = require("./circle.js"), Point = require("./point.js"), Mouse = require("./mouse.js");
        module.exports = Collidable({
            name: "screenhold",
            mask: Circle(Point(), 8)
        }).extend({
            update: function() {
                if (Mouse.is.down && !Mouse.is.dragging) {
                    this.move(Mouse.offset);
                } else {
                    this.move(Point(-999, -999));
                }
            }
        });
    }, {
        "./circle.js": 16,
        "./collidable.js": 18,
        "./mouse.js": 35,
        "./point.js": 36
    } ],
    35: [ function(require, module, exports) {
        (function(global) {
            var Point = require("./point.js"), Vector = require("./vector.js"), canvas = require("./canvas.js"), isDown = false, isDragging = false, isHolding = false, current = Point(), last = Point(), shift = Vector(), startEventName, moveEventName, endEventName;
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
                global.setTimeout(function() {
                    if (isDown) {
                        isHolding = true;
                    }
                }, 200);
            });
            document.addEventListener(endEventName, function(event) {
                isDown = isDragging = isHolding = false;
            });
            canvas.addEventListener(moveEventName, function(event) {
                last = current;
                current = getOffset(event);
                if (isDown) {
                    shift.x = current.x - last.x;
                    shift.y = current.y - last.y;
                    if (shift.magnitude > 1) {
                        isDragging = true;
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
                on: {
                    down: function(cb) {
                        canvas.addEventListener(startEventName, cb);
                    },
                    click: function(cb) {},
                    dclick: function(cb) {},
                    up: function(cb) {
                        document.addEventListener(endEventName, cb);
                    },
                    move: function(cb) {
                        canvas.addEventListener(moveEventName, cb);
                    }
                },
                eventName: {
                    start: startEventName,
                    move: moveEventName,
                    end: endEventName
                }
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./canvas.js": 15,
        "./point.js": 36,
        "./vector.js": 48
    } ],
    36: [ function(require, module, exports) {
        function Point(x, y) {
            return {
                x: x || 0,
                y: y || 0,
                clone: function() {
                    return Point(this.x, this.y);
                },
                equals: function(other) {
                    return this.x === other.x && this.y === other.y;
                }
            };
        }
        module.exports = Point;
    }, {} ],
    37: [ function(require, module, exports) {
        var Vector = require("./vector.js");
        function isEqual(my, other, tfactor, mfactor) {
            var mag = my.magnitude === mfactor * other.magnitude, mytheta = (my.theta % Math.PI).toFixed(5), otheta = ((other.theta + tfactor) % Math.PI).toFixed(5);
            return mag && mytheta === otheta;
        }
        function Polar(theta, mag) {
            return {
                theta: theta || 0,
                magnitude: mag || 0,
                invert: function() {
                    return Polar(this.theta + Math.PI, this.magnitude * -1);
                },
                clone: function() {
                    return Polar(this.theta, this.magnitude);
                },
                toVector: function() {
                    return Vector(this.magnitude * Math.cos(this.theta), this.magnitude * Math.sin(this.theta));
                },
                equals: function(other) {
                    return isEqual(this, other, 0, 1) || isEqual(this, other, Math.PI, -1);
                }
            };
        }
        module.exports = Polar;
    }, {
        "./vector.js": 48
    } ],
    38: [ function(require, module, exports) {
        (function(global) {
            var i, len = 50, set = [], curr = 0;
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
    39: [ function(require, module, exports) {
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
                move: function(x, y) {
                    this.x = x;
                    this.y = y;
                    this.top = y;
                    this.right = x + this.width;
                    this.bottom = y + this.height;
                    this.left = x;
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
                    ctx.strokeStyle = "rgba(250, 50, 50, 0.5)";
                    ctx.rect(this.x, this.y, this.width, this.height);
                    ctx.stroke();
                }
            });
        };
    }, {
        "./dimension.js": 23,
        "./point.js": 36,
        "./shape.js": 41,
        "./vector.js": 48
    } ],
    40: [ function(require, module, exports) {
        var BaseClass = require("baseclassjs"), EventHandler = require("./event-handler.js"), Counter = require("./id-counter.js");
        module.exports = function(opts) {
            var loaded = false, sprites = [], spriteMap = {}, spritesToAdd = [], spritesLoading = [], loadQueue = {}, spriteRemoved = false, collisionMap = {}, updating = false, drawing = false;
            function ingestSprites() {
                if (spritesToAdd.length) {
                    spritesToAdd.forEach(function(sprite) {
                        sprites.push(sprite);
                        if (sprite.name) {
                            spriteMap[sprite.name] = sprite;
                        }
                        sprite.trigger("ready");
                    });
                    sprites.sort(function(a, b) {
                        return a.depth - b.depth;
                    });
                    spritesToAdd = [];
                }
            }
            return BaseClass({
                name: opts.name,
                updating: function() {
                    return updating;
                },
                drawing: function() {
                    return drawing;
                },
                load: function(cb) {
                    if (!loaded) {
                        this.addCollisionSets(opts.collisionSets);
                        this.addSprites({
                            set: opts.spriteSet,
                            onload: cb,
                            force: true
                        });
                        loaded = true;
                    }
                },
                start: function() {
                    updating = true;
                    drawing = true;
                    this.trigger("start");
                },
                pause: function() {
                    updating = false;
                    drawing = true;
                    this.trigger("pause");
                },
                stop: function() {
                    updating = false;
                    drawing = false;
                    this.trigger("stop");
                },
                depth: opts.depth || 0,
                collision: function(name) {
                    return collisionMap[name];
                },
                addCollisionSets: function(set) {
                    if (set) {
                        set = [].concat(set);
                        set.forEach(function(handler) {
                            collisionMap[handler.name] = handler;
                        });
                    }
                },
                sprite: function(name) {
                    return spriteMap[name];
                },
                addSprites: function(opts) {
                    var id, onload, set;
                    opts = opts || {};
                    onload = opts.onload || function() {};
                    set = [].concat(opts.set);
                    if (set.length) {
                        id = Counter.nextId;
                        loadQueue[id] = set.length;
                        set.forEach(function(sprite) {
                            sprite.removed = false;
                            sprite.load(function() {
                                loadQueue[id] -= 1;
                                if (loadQueue[id] === 0) {
                                    spritesToAdd = spritesToAdd.concat(set);
                                    if (opts.force) {
                                        ingestSprites();
                                    }
                                    onload();
                                }
                            });
                        });
                    } else {
                        onload();
                    }
                },
                removeSprite: function(sprite) {
                    sprite.removed = true;
                    spriteRemoved = true;
                },
                clearSprites: function() {
                    sprites = [];
                },
                update: function() {
                    var i;
                    if (updating) {
                        sprites.forEach(function(sprite) {
                            if (updating && !sprite.removed) {
                                if (sprite.updating) {
                                    sprite.update();
                                }
                            }
                        });
                        for (i in collisionMap) {
                            collisionMap[i].handleCollisions();
                        }
                    }
                    ingestSprites();
                },
                draw: function(ctx, debug) {
                    var name;
                    if (drawing) {
                        sprites.forEach(function(sprite) {
                            if (sprite.drawing) {
                                sprite.draw(ctx);
                            }
                        });
                        if (debug) {
                            for (name in collisionMap) {
                                collisionMap[name].draw(ctx);
                            }
                        }
                    }
                },
                teardown: function() {
                    var i;
                    if (updating) {
                        sprites.forEach(function(sprite) {
                            if (!sprite.removed) {
                                sprite.teardown();
                            }
                        });
                    }
                    for (i in collisionMap) {
                        collisionMap[i].teardown();
                    }
                    if (spriteRemoved) {
                        sprites = sprites.filter(function(sprite) {
                            return !sprite.removed;
                        });
                        spriteRemoved = false;
                    }
                }
            }).implement(EventHandler({
                events: opts.on,
                singles: opts.one
            }));
        };
    }, {
        "./event-handler.js": 25,
        "./id-counter.js": 29,
        baseclassjs: 7
    } ],
    41: [ function(require, module, exports) {
        var BaseClass = require("baseclassjs"), Point = require("./point.js");
        module.exports = function(opts) {
            var pos, intersectMap;
            opts = opts || {};
            intersectMap = opts.intersects || {};
            pos = opts.pos || Point();
            return BaseClass({
                x: pos.x,
                y: pos.y,
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
        "./point.js": 36,
        baseclassjs: 7
    } ],
    42: [ function(require, module, exports) {
        (function(global) {
            var BaseClass = require("baseclassjs"), Collidable = require("./collidable.js"), Point = require("./point.js"), Dimension = require("./dimension.js"), Rectangle = require("./rectangle.js");
            module.exports = function(opts) {
                var loaded = false, stripMap = opts.strips || {}, pos = opts.pos || Point();
                if (!opts.freemask) {
                    opts.mask = opts.mask || Rectangle();
                    opts.offset = Point(opts.mask.x, opts.mask.y);
                    opts.mask.move(pos.x + opts.offset.x, pos.y + opts.offset.y);
                }
                opts.one = opts.one || {};
                opts.one.ready = opts.one.ready || function() {
                    this.start();
                };
                return Collidable(opts).extend({
                    strip: stripMap[opts.startingStrip],
                    updating: opts.updating || false,
                    drawing: opts.drawing || false,
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
                    pos: pos,
                    scale: opts.scale || 1,
                    size: opts.size || (stripMap[opts.startingStrip] || {}).size,
                    trueSize: function() {
                        return this.size.scale(this.scale);
                    },
                    rotation: opts.rotation || 0,
                    depth: opts.depth || 0,
                    speed: opts.speed || Point(),
                    start: function() {
                        this.updating = true;
                        this.drawing = true;
                        this.strip.start();
                        this.trigger("start");
                    },
                    pause: function() {
                        this.updating = false;
                        this.drawing = true;
                        this.strip.pause();
                        this.trigger("pause");
                    },
                    stop: function() {
                        this.updating = false;
                        this.drawing = false;
                        this.strip.stop();
                        this.trigger("stop");
                    },
                    update: function() {
                        if (this.updating) {
                            this.shift();
                            this.strip.update();
                            this.base.update();
                        }
                    },
                    draw: function(ctx) {
                        var stripSize;
                        if (this.drawing) {
                            stripSize = this.strip.size;
                            this.strip.draw(ctx, this.pos, Dimension(this.scale * this.size.width / stripSize.width, this.scale * this.size.height / stripSize.height), this.rotation);
                        }
                    },
                    load: function(onload) {
                        var name, loadQueue;
                        onload = onload || function() {};
                        if (!loaded) {
                            loadQueue = global.Object.keys(stripMap).length;
                            for (name in stripMap) {
                                stripMap[name].load(function() {
                                    loadQueue -= 1;
                                    if (loadQueue === 0) {
                                        onload();
                                        loaded = true;
                                    }
                                });
                            }
                        } else {
                            onload();
                        }
                    },
                    move: function(x, y) {
                        this.pos.x = x;
                        this.pos.y = y;
                        if (!opts.freemask) {
                            this.base.move(this.pos);
                        }
                    },
                    shift: function(vx, vy) {
                        this.pos.x += vx || this.speed.x;
                        this.pos.y += vy || this.speed.y;
                        if (!opts.freemask) {
                            this.base.move(this.pos);
                        }
                    }
                });
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./collidable.js": 18,
        "./dimension.js": 23,
        "./point.js": 36,
        "./rectangle.js": 39,
        baseclassjs: 7
    } ],
    43: [ function(require, module, exports) {
        var createImage = require("./image.js"), cache = {};
        module.exports = function(opts) {
            var img, src = opts.src;
            if (src in cache) {
                img = cache[src];
            } else {
                img = createImage(src);
                cache[src] = img;
            }
            return img;
        };
    }, {
        "./image.js": 30
    } ],
    44: [ function(require, module, exports) {
        var Sprite = require("../sprite.js"), Dimension = require("../dimension.js"), Rectangle = require("../rectangle.js"), Point = require("../point.js"), AnimationStrip = require("../animation-strip.js"), SpriteSheet = require("../spritesheet.js"), collisions = require("../dragon-collisions.js");
        module.exports = function(opts) {
            opts.down = opts.down || {};
            return Sprite({
                name: opts.name || "dragon-ui-button",
                collisionSets: [ collisions ],
                mask: Rectangle(Point(), opts.size),
                strips: {
                    up: AnimationStrip({
                        sheet: SpriteSheet({
                            src: opts.up.src
                        }),
                        size: opts.up.size
                    }),
                    down: AnimationStrip({
                        sheet: SpriteSheet({
                            src: opts.down.src || opts.up.src
                        }),
                        size: opts.down.size || opts.up.size
                    })
                },
                startingStrip: "up",
                pos: opts.pos,
                size: opts.size,
                on: {
                    "colliding/screentap": function() {
                        this.useStrip("down");
                        opts.onpress.call(this);
                    },
                    "colliding/screenhold": function() {
                        this.useStrip("down");
                    }
                }
            }).extend({
                update: function() {
                    this.useStrip("up");
                    this.base.update();
                }
            });
        };
    }, {
        "../animation-strip.js": 13,
        "../dimension.js": 23,
        "../dragon-collisions.js": 24,
        "../point.js": 36,
        "../rectangle.js": 39,
        "../sprite.js": 42,
        "../spritesheet.js": 43
    } ],
    45: [ function(require, module, exports) {
        var Sprite = require("../sprite.js"), AnimationStrip = require("../animation-strip.js"), SpriteSheet = require("../spritesheet.js");
        module.exports = function(opts) {
            opts.name = opts.name || "dragon-ui-decal";
            opts.strips = {
                decal: AnimationStrip({
                    sheet: SpriteSheet({
                        src: opts.strip.src
                    }),
                    size: opts.strip.size
                })
            };
            opts.startingStrip = "decal";
            return Sprite(opts);
        };
    }, {
        "../animation-strip.js": 13,
        "../sprite.js": 42,
        "../spritesheet.js": 43
    } ],
    46: [ function(require, module, exports) {
        var ClearSprite = require("../clear-sprite.js");
        module.exports = function(opts) {
            opts.style = opts.style || function() {};
            opts.name = opts.name || "dragon-ui-label";
            return ClearSprite(opts).extend({
                text: opts.text,
                draw: function(ctx) {
                    opts.style(ctx);
                    ctx.fillText(this.text, this.pos.x, this.pos.y);
                }
            });
        };
    }, {
        "../clear-sprite.js": 17
    } ],
    47: [ function(require, module, exports) {
        var Sprite = require("../sprite.js"), Dimension = require("../dimension.js"), Rectangle = require("../rectangle.js"), Point = require("../point.js"), AnimationStrip = require("../animation-strip.js"), SpriteSheet = require("../spritesheet.js"), ClearSprite = require("../clear-sprite.js"), collisions = require("../dragon-collisions.js");
        module.exports = function(opts) {
            var pos = opts.pos, size = opts.size, buffer = 5, knobSize = Dimension(16, 32), lane = Sprite({
                name: "slider-lane",
                collisionSets: [ collisions ],
                mask: Rectangle(Point(), Dimension(size.width, size.height - buffer * 2)),
                strips: {
                    slider: AnimationStrip({
                        sheet: SpriteSheet({
                            src: opts.src.lane
                        }),
                        size: Dimension(32, 8)
                    })
                },
                startingStrip: "slider",
                pos: Point(pos.x - size.width / 2, pos.y - size.height / 2 + buffer),
                size: Dimension(size.width, size.height - buffer * 2),
                on: {
                    "colliding/screentap": function(mouse) {
                        var x, value;
                        x = Math.max(mouse.mask.x, this.mask.left);
                        x = Math.min(x, this.mask.right);
                        knob.pos.x = x - knobSize.width / 2;
                        value = x - this.mask.left;
                        value = (value / this.mask.width).toFixed(3);
                        opts.onslide(value);
                    }
                }
            }), knob = Sprite({
                name: "slider-knob",
                collisionSets: [ collisions ],
                mask: Rectangle(Point(), knobSize),
                strips: {
                    slider: AnimationStrip({
                        sheet: SpriteSheet({
                            src: opts.src.knob
                        }),
                        size: Dimension(8, 16)
                    })
                },
                startingStrip: "slider",
                pos: Point(pos.x - knobSize.width / 2, pos.y - knobSize.height / 2),
                size: knobSize,
                on: {
                    "colliding/screendrag": function(mouse) {
                        var x, value;
                        x = Math.max(mouse.mask.x, lane.mask.left);
                        x = Math.min(x, lane.mask.right);
                        this.pos.x = x - knobSize.width / 2;
                        value = x - lane.mask.left;
                        value = (value / lane.mask.width).toFixed(3);
                        opts.onslide(value);
                    }
                }
            });
            opts.onslide = opts.onslide || function() {};
            return ClearSprite().extend({
                load: function(cb) {
                    var queue = 2, done = function() {
                        queue -= 1;
                        if (!queue) {
                            cb();
                        }
                    };
                    lane.load(done);
                    knob.load(done);
                },
                start: function() {
                    lane.start();
                    knob.start();
                },
                pause: function() {
                    lane.pause();
                    knob.start();
                },
                stop: function() {
                    lane.stop();
                    knob.stop();
                },
                update: function() {
                    lane.update();
                    knob.update();
                },
                draw: function(ctx) {
                    lane.draw(ctx);
                    knob.draw(ctx);
                },
                teardown: function() {
                    lane.teardown();
                    knob.teardown();
                }
            });
        };
    }, {
        "../animation-strip.js": 13,
        "../clear-sprite.js": 17,
        "../dimension.js": 23,
        "../dragon-collisions.js": 24,
        "../point.js": 36,
        "../rectangle.js": 39,
        "../sprite.js": 42,
        "../spritesheet.js": 43
    } ],
    48: [ function(require, module, exports) {
        var Polar = require("./polar.js");
        function Vector(x, y) {
            return {
                x: x || 0,
                y: y || 0,
                get magnitude() {
                    return Math.abs(Math.sqrt(this.y * this.y + this.x * this.x));
                },
                clone: function() {
                    return Vector(this.x, this.y);
                },
                equals: function(other) {
                    return this.x === other.x && this.y === other.y;
                },
                scale: function(scale) {
                    return Vector(this.x * scale, this.y * scale);
                },
                toPolar: function() {
                    return Polar(Math.atan(this.y / this.x), this.magnitude);
                }
            };
        }
        module.exports = Vector;
    }, {
        "./polar.js": 37
    } ],
    49: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = $.CollisionHandler({
            name: "racetrack"
        });
    }, {
        dragonjs: 20
    } ],
    50: [ function(require, module, exports) {
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
    51: [ function(require, module, exports) {
        (function(global) {
            var $ = require("dragonjs"), riverton = require("./screens/tracks/riverton.js");
            global.Cocoon.Utils.setAntialias(false);
            $.canvas.ctx.webkitImageSmoothingEnabled = false;
            $.canvas.ctx.mozImageSmoothingEnabled = false;
            $.canvas.ctx.imageSmoothingEnabled = false;
            $.Font.load({
                name: "Wonder",
                src: "8-bit-wonder.TTF"
            });
            $.Game.addScreens([ require("./screens/gear.js"), require("./screens/train.js"), require("./screens/care.js"), require("./screens/startrace.js"), require("./screens/raceresult.js"), riverton ]);
            $.Game.run(true, true);
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./screens/care.js": 58,
        "./screens/gear.js": 59,
        "./screens/raceresult.js": 60,
        "./screens/startrace.js": 61,
        "./screens/tracks/riverton.js": 63,
        "./screens/train.js": 64,
        dragonjs: 20
    } ],
    52: [ function(require, module, exports) {
        (function(global) {
            var $ = require("dragonjs"), Horse = require("./sprites/horse.js"), Picker = require("./picker.js"), Stats = require("./horse-stats.js");
            function scale(difficulty) {
                var steps = [ 100, 180, 240, 280, 300 ], bonus = global.Math.floor($.random() * 30);
                return steps[difficulty] + bonus;
            }
            module.exports = function(difficulty) {
                var horse = Picker.next.horse;
                return Horse({
                    showname: horse.name,
                    stats: Stats({
                        body: horse.body + scale(difficulty)
                    })
                });
            };
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "./horse-stats.js": 53,
        "./picker.js": 56,
        "./sprites/horse.js": 71,
        dragonjs: 20
    } ],
    53: [ function(require, module, exports) {
        function Stats(opts) {
            opts = opts || {};
            return {
                body: opts.body || 120,
                mind: opts.mind || 1,
                health: opts.health || 1,
                clone: function() {
                    return Stats(this);
                }
            };
        }
        module.exports = Stats;
    }, {} ],
    54: [ function(require, module, exports) {
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
    55: [ function(require, module, exports) {
        function Stats(opts) {
            opts = opts || {};
            return {
                body: opts.body || 1,
                mind: opts.mind || 1,
                temper: opts.temper || 1,
                clone: function() {
                    return Stats(this);
                }
            };
        }
        module.exports = Stats;
    }, {} ],
    56: [ function(require, module, exports) {
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
        "./data/horses.json": 50,
        dragonjs: 20
    } ],
    57: [ function(require, module, exports) {
        var Horse = require("./sprites/horse.js"), Jockey = require("./sprites/jockey.js");
        module.exports = {
            money: 100,
            stats: require("./shop-stats.js"),
            refreshStats: function() {
                this.horse.refreshStats();
                this.jockey.refreshStats();
            },
            horse: Horse(),
            jockey: Jockey()
        };
    }, {
        "./shop-stats.js": 65,
        "./sprites/horse.js": 71,
        "./sprites/jockey.js": 72
    } ],
    58: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = $.Screen({
            name: "care",
            spriteSet: [ require("../sprites/buttons/open-gear.js"), require("../sprites/buttons/open-train.js"), require("../sprites/buttons/open-care.js"), require("../sprites/buttons/race.js") ],
            depth: 0
        }).extend({
            draw: function(ctx) {
                ctx.fillStyle = "#fde142";
                ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
                this.base.draw(ctx);
            }
        });
    }, {
        "../sprites/buttons/open-care.js": 67,
        "../sprites/buttons/open-gear.js": 68,
        "../sprites/buttons/open-train.js": 69,
        "../sprites/buttons/race.js": 70,
        dragonjs: 20
    } ],
    59: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = $.Screen({
            name: "gear",
            spriteSet: [ require("../sprites/buttons/open-gear.js"), require("../sprites/buttons/open-train.js"), require("../sprites/buttons/open-care.js"), require("../sprites/buttons/race.js") ],
            depth: 0
        }).extend({
            draw: function(ctx) {
                ctx.fillStyle = "#fde142";
                ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
                this.base.draw(ctx);
            }
        });
    }, {
        "../sprites/buttons/open-care.js": 67,
        "../sprites/buttons/open-gear.js": 68,
        "../sprites/buttons/open-train.js": 69,
        "../sprites/buttons/race.js": 70,
        dragonjs: 20
    } ],
    60: [ function(require, module, exports) {
        var $ = require("dragonjs"), result = require("../sprites/track/raceresult.js");
        module.exports = $.Screen({
            name: "raceresult",
            spriteSet: [ result.win, result.lose ],
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
        "../sprites/track/raceresult.js": 78,
        dragonjs: 20
    } ],
    61: [ function(require, module, exports) {
        (function(global) {
            var $ = require("dragonjs"), countdown = require("../sprites/track/countdown.js");
            module.exports = $.Screen({
                name: "startrace",
                spriteSet: [ countdown ],
                depth: 10
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
                                $.Game.screen("track").race();
                            }
                        };
                    }
                    count(4)();
                    this.base.start();
                }
            });
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "../sprites/track/countdown.js": 76,
        dragonjs: 20
    } ],
    62: [ function(require, module, exports) {
        (function(global) {
            var BaseClass = require("baseclassjs"), $ = require("dragonjs"), player = require("../player.js"), Util = require("../util.js"), LaneName = require("../sprites/track/lanename.js");
            module.exports = function(opts) {
                var stable = [], lanenames = [];
                return $.Screen({
                    name: "track",
                    collisionSets: [ require("../collisions/racetrack.js") ],
                    spriteSet: [],
                    depth: 0
                }).extend({
                    trackLength: 0,
                    buildStable: BaseClass.Abstract,
                    getStable: function() {
                        return stable;
                    },
                    start: function() {
                        var lanes;
                        stable = this.buildStable().concat(player.horse);
                        lanes = Util.range(stable.length);
                        Util.shuffle(lanes);
                        this.addSprites({
                            set: stable
                        });
                        stable.forEach(function(horse, i) {
                            horse.pos.x = 20;
                            horse.pos.y = lanes[i] * 30 + 40;
                            lanenames[i] = LaneName({
                                name: i + 1,
                                longname: horse.showname,
                                pos: $.Point(2, i * 30 + 40)
                            });
                        });
                        this.addSprites({
                            set: lanenames
                        });
                        $.Game.screen("startrace").start();
                        this.base.start();
                    },
                    race: function() {
                        var length = this.trackLength;
                        stable.forEach(function(horse) {
                            horse.race(length);
                        });
                    },
                    endRace: function(playerWon, winner) {
                        var that = this;
                        $.Game.screen("raceresult").start(playerWon);
                        stable.forEach(function(horse, i) {
                            horse.speed.x = 0;
                            lanenames[i].pause();
                        });
                        global.setTimeout(function() {
                            stable.forEach(function(horse, i) {
                                that.removeSprite(horse);
                                that.removeSprite(lanenames[i]);
                            });
                            player.horse.endRace();
                            $.Game.screen("raceresult").stop();
                            that.stop();
                            $.Game.screen("train").start();
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
        "../collisions/racetrack.js": 49,
        "../player.js": 57,
        "../sprites/track/lanename.js": 77,
        "../util.js": 79,
        baseclassjs: 2,
        dragonjs: 20
    } ],
    63: [ function(require, module, exports) {
        var Track = require("../track.js"), makeHorse = require("../../horse-factory.js");
        module.exports = Track().extend({
            trackLength: 3e3,
            buildStable: function() {
                return [ makeHorse(1), makeHorse(1), makeHorse(1), makeHorse(1), makeHorse(1), makeHorse(1), makeHorse(1) ];
            }
        });
    }, {
        "../../horse-factory.js": 52,
        "../track.js": 62
    } ],
    64: [ function(require, module, exports) {
        (function(global) {
            var $ = require("dragonjs"), train = require("../sprites/buttons/open-train.js"), player = require("../player.js"), ranks = require("../sprites/shop/ranks.js"), TrainLabel = require("../sprites/shop/train-label.js"), StatLabel = require("../sprites/shop/stat-label.js"), addRank = require("../sprites/buttons/add-rank.js"), shopStats = require("../shop-stats.js");
            module.exports = $.Screen({
                name: "train",
                spriteSet: [ require("../sprites/buttons/open-gear.js"), train, require("../sprites/buttons/open-care.js"), require("../sprites/buttons/race.js"), addRank("gym", function() {
                    player.jockey.coreStats.body += 1;
                    player.jockey.refreshStats();
                }), addRank("coach"), addRank("facility", function() {
                    var steps = [ 250, 200, 150, 100, 100 ], bonus = global.Math.floor($.random() * 50), gain = steps[shopStats.facility - 1] + bonus;
                    player.horse.coreStats.body += gain;
                    player.horse.refreshStats();
                }), addRank("groom"), addRank("doctor"), TrainLabel("Gym"), TrainLabel("Coach"), TrainLabel("Facility"), TrainLabel("Groom"), TrainLabel("Doctor"), StatLabel("horse", "body"), StatLabel("horse", "mind"), StatLabel("horse", "health"), StatLabel("jockey", "body"), StatLabel("jockey", "mind"), StatLabel("jockey", "temper") ],
                one: {
                    ready: function() {
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
                    ranks.draw(ctx);
                    this.base.draw(ctx);
                }
            });
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
        "../player.js": 57,
        "../shop-stats.js": 65,
        "../sprites/buttons/add-rank.js": 66,
        "../sprites/buttons/open-care.js": 67,
        "../sprites/buttons/open-gear.js": 68,
        "../sprites/buttons/open-train.js": 69,
        "../sprites/buttons/race.js": 70,
        "../sprites/shop/ranks.js": 73,
        "../sprites/shop/stat-label.js": 74,
        "../sprites/shop/train-label.js": 75,
        dragonjs: 20
    } ],
    65: [ function(require, module, exports) {
        var opts = {};
        module.exports = {
            groom: opts.groom || 0,
            facility: opts.facility || 0,
            doctor: opts.doctor || 0,
            gym: opts.gym || 0,
            coach: opts.coach || 0
        };
    }, {} ],
    66: [ function(require, module, exports) {
        var $ = require("dragonjs"), len = $.canvas.height * .1, player = require("../../player.js"), ranks = require("../shop/ranks.js");
        module.exports = function(name, onpress) {
            onpress = onpress || function() {};
            return $.ui.Button({
                pos: $.Point(ranks.pos[name].x + ranks.realWidth - len, ranks.pos[name].y - len - 2),
                size: $.Dimension(len, len),
                up: {
                    src: "buttons/plus.png",
                    size: $.Dimension(8, 8)
                },
                down: {
                    src: "buttons/plus.null.png",
                    size: $.Dimension(8, 8)
                },
                onpress: function() {
                    if (player.stats[name] < 5) {
                        player.stats[name] += 1;
                        onpress();
                    }
                }
            }).extend({
                update: function() {
                    if (player.stats[name] < 5) {
                        this.base.update();
                    } else {
                        this.useStrip("down");
                        this.base.base.update();
                    }
                }
            });
        };
    }, {
        "../../player.js": 57,
        "../shop/ranks.js": 73,
        dragonjs: 20
    } ],
    67: [ function(require, module, exports) {
        var $ = require("dragonjs"), height = $.canvas.height * .32, width = .1;
        module.exports = $.ui.Button({
            name: "open-care",
            pos: $.Point(0, $.canvas.height - height),
            size: $.Dimension($.canvas.width * width, height),
            up: {
                src: "buttons/care.png",
                size: $.Dimension(11, 35)
            },
            down: {
                src: "buttons/care.down.png",
                size: $.Dimension(11, 35)
            },
            onpress: function() {
                $.Game.screen("train").stop();
                $.Game.screen("gear").stop();
                $.Game.screen("care").start();
                this.pause();
                require("./open-gear.js").start();
                require("./open-train.js").start();
            }
        }).extend({
            width: width,
            realWidth: $.canvas.width * width
        });
    }, {
        "./open-gear.js": 68,
        "./open-train.js": 69,
        dragonjs: 20
    } ],
    68: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = $.ui.Button({
            name: "open-gear",
            pos: $.Point(0, 0),
            size: $.Dimension($.canvas.width * .1, $.canvas.height * .32),
            up: {
                src: "buttons/gear.png",
                size: $.Dimension(11, 35)
            },
            down: {
                src: "buttons/gear.down.png",
                size: $.Dimension(11, 35)
            },
            onpress: function() {
                $.Game.screen("train").stop();
                $.Game.screen("care").stop();
                $.Game.screen("gear").start();
                this.pause();
                require("./open-train.js").start();
                require("./open-care.js").start();
            }
        });
    }, {
        "./open-care.js": 67,
        "./open-train.js": 69,
        dragonjs: 20
    } ],
    69: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = $.ui.Button({
            name: "open-train",
            pos: $.Point(0, $.canvas.height * .32),
            size: $.Dimension($.canvas.width * .1, $.canvas.height * .36),
            up: {
                src: "buttons/train.png",
                size: $.Dimension(11, 43)
            },
            down: {
                src: "buttons/train.down.png",
                size: $.Dimension(11, 43)
            },
            onpress: function() {
                $.Game.screen("gear").stop();
                $.Game.screen("care").stop();
                $.Game.screen("train").start();
                this.pause();
                require("./open-gear.js").start();
                require("./open-care.js").start();
            }
        });
    }, {
        "./open-care.js": 67,
        "./open-gear.js": 68,
        dragonjs: 20
    } ],
    70: [ function(require, module, exports) {
        var $ = require("dragonjs"), width = .18;
        module.exports = $.ui.Button({
            pos: $.Point($.canvas.width * (1 - width), 0),
            size: $.Dimension($.canvas.width * width, $.canvas.height),
            up: {
                src: "buttons/start-race.png",
                size: $.Dimension(11, 35)
            },
            down: {
                src: "buttons/start-race.down.png",
                size: $.Dimension(11, 35)
            },
            onpress: function() {
                $.Game.screen("train").stop();
                $.Game.screen("gear").stop();
                $.Game.screen("care").stop();
                $.Game.screen("track").start();
            }
        }).extend({
            width: width,
            realWidth: $.canvas.width * width
        });
    }, {
        dragonjs: 20
    } ],
    71: [ function(require, module, exports) {
        (function(global) {
            var $ = require("dragonjs"), Roster = require("../picker.js"), Illness = require("../illness.js"), Stats = require("../horse-stats.js"), shopStats = require("../shop-stats.js");
            module.exports = function(opts) {
                var theta = 3, height, starty, boost, trot, stride;
                opts = opts || {};
                return $.Sprite({
                    name: "horse",
                    collisionSets: [ require("../collisions/racetrack.js"), $.collisions ],
                    mask: $.Rectangle($.Point(), $.Dimension(25, 18)),
                    strips: {
                        horse: $.AnimationStrip({
                            sheet: $.SpriteSheet({
                                src: "horse.png"
                            }),
                            size: $.Dimension(50, 37)
                        })
                    },
                    startingStrip: "horse",
                    scale: .5,
                    on: {
                        "collide/screenedge/right": function() {
                            this.speed.x = 0;
                            this.scale = 2;
                            this.pos.x = $.canvas.width / 2 - this.trueSize().width / 2;
                            this.pos.y = $.canvas.height / 2 - this.trueSize().height / 2;
                            $.Game.screen("track").endRace(this === require("../player.js").horse, this);
                        }
                    }
                }).extend({
                    showname: opts.showname || Roster.next.horse.name,
                    coreStats: opts.stats || Stats(),
                    adjStats: Stats(),
                    racing: false,
                    refreshStats: function(mod) {
                        var set = this.coreStats.clone();
                        mod = mod || function() {};
                        mod(set);
                        this.sickness(set);
                        this.adjStats = set;
                    },
                    endRace: function() {
                        this.racing = false;
                        this.scale = .5;
                    },
                    sickness: Illness.none,
                    race: function(trackLength) {
                        this.racing = true;
                        starty = this.pos.y;
                        trot = .08 * $.random();
                        boost = $.random() * 10 + 2;
                        this.refreshStats();
                        this.speed.x = stride = this.adjStats.body / trackLength;
                    },
                    update: function() {
                        if (this.racing) {
                            theta += .15 + trot;
                            if (theta > 3.14) {
                                height = 6 + 3 * $.random();
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
        "../collisions/racetrack.js": 49,
        "../horse-stats.js": 53,
        "../illness.js": 54,
        "../picker.js": 56,
        "../player.js": 57,
        "../shop-stats.js": 65,
        dragonjs: 20
    } ],
    72: [ function(require, module, exports) {
        var $ = require("dragonjs"), Roster = require("../picker.js"), Stats = require("../jockey-stats.js");
        module.exports = function(opts) {
            opts = opts || {};
            return $.Sprite({
                name: "jockey",
                strips: {
                    jockey: $.AnimationStrip({
                        sheet: $.SpriteSheet({
                            src: "jockey.png"
                        }),
                        size: $.Dimension(64, 64)
                    })
                },
                startingStrip: "jockey",
                pos: $.Point(100, 100),
                depth: 2
            }).extend({
                showname: opts.showname || Roster.next.jockey.name,
                coreStats: opts.stats || Stats(),
                adjStats: Stats(),
                refreshStats: function(mod) {
                    var set = this.coreStats.clone();
                    mod = mod || function() {};
                    mod(set);
                    this.adjStats = set;
                }
            });
        };
    }, {
        "../jockey-stats.js": 55,
        "../picker.js": 56,
        dragonjs: 20
    } ],
    73: [ function(require, module, exports) {
        var $ = require("dragonjs"), pips = $.AnimationStrip({
            sheet: $.SpriteSheet({
                src: "icons/train-pips.png"
            }),
            size: $.Dimension(16, 4),
            frames: 6
        }), stats = require("../../shop-stats.js"), race = require("../buttons/race.js"), open = require("../buttons/open-care.js"), width = $.canvas.width, height = $.canvas.height, center = (width - race.realWidth - open.realWidth) / 2 + open.realWidth, realWidth = width * .3, margin = width * .02, scaleWidth = realWidth / 16, pos = {
            facility: $.Point(center - margin - realWidth, height * .5),
            groom: $.Point(center - margin - realWidth, height * .7),
            doctor: $.Point(center - margin - realWidth, height * .9),
            gym: $.Point(center + margin, height * .5),
            coach: $.Point(center + margin, height * .7)
        };
        pips.load();
        module.exports = {
            draw: function(ctx) {
                var key, value;
                for (key in stats) {
                    pips.frame = stats[key];
                    pips.draw(ctx, pos[key], $.Dimension(scaleWidth, 3));
                }
            },
            pos: pos,
            realWidth: realWidth,
            realHeight: 12
        };
    }, {
        "../../shop-stats.js": 65,
        "../buttons/open-care.js": 67,
        "../buttons/race.js": 70,
        dragonjs: 20
    } ],
    74: [ function(require, module, exports) {
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
                text: grid[type][name].name + " " + player[type].adjStats[name],
                pos: grid[type][name].pos,
                style: function(ctx) {
                    ctx.font = "12px Wonder";
                    ctx.textBaseline = "bottom";
                    ctx.textAlign = grid[type][name].side;
                    ctx.fillStyle = "black";
                }
            }).extend({
                update: function() {
                    this.text = grid[type][name].name + " " + player[type].adjStats[name];
                }
            });
        };
    }, {
        "../../player.js": 57,
        "../buttons/open-care.js": 67,
        "../buttons/race.js": 70,
        dragonjs: 20
    } ],
    75: [ function(require, module, exports) {
        var $ = require("dragonjs"), len = $.canvas.height * .1, ranks = require("./ranks.js");
        module.exports = function(name) {
            var keyname = name.toLowerCase();
            return $.ui.Label({
                text: name,
                pos: $.Point(ranks.pos[keyname].x + ranks.realWidth - len, ranks.pos[keyname].y - 5),
                style: function(ctx) {
                    ctx.font = "16px Wonder";
                    ctx.textBaseline = "bottom";
                    ctx.textAlign = "right";
                    ctx.fillStyle = "black";
                }
            });
        };
    }, {
        "./ranks.js": 73,
        dragonjs: 20
    } ],
    76: [ function(require, module, exports) {
        var $ = require("dragonjs"), BaseClass = require("baseclassjs");
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
        baseclassjs: 2,
        dragonjs: 20
    } ],
    77: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = function(opts) {
            return $.ui.Label({
                text: opts.name,
                pos: opts.pos,
                style: function(ctx) {
                    ctx.font = "12px Wonder";
                    ctx.textBaseline = "top";
                    ctx.textAlign = "left";
                    ctx.fillStyle = "black";
                },
                collisionSets: [ $.collisions ],
                mask: $.Rectangle($.Point(), $.Dimension(15, 15)),
                on: {
                    "collide/screenhold": function() {
                        this.text = opts.longname;
                    },
                    "separate/screenhold": function() {
                        this.text = opts.name;
                    }
                }
            }).extend({
                update: function() {
                    this.base.base.base.base.update();
                }
            });
        };
    }, {
        dragonjs: 20
    } ],
    78: [ function(require, module, exports) {
        var $ = require("dragonjs"), BaseClass = require("baseclassjs");
        module.exports = {
            win: $.ui.Decal({
                strip: {
                    src: "win.png",
                    size: $.Dimension(50, 9)
                },
                scale: 3,
                pos: $.Point($.canvas.width / 2 - 25 * 3, $.canvas.height / 2 - 4 * 3),
                name: "raceresult-win",
                updating: false,
                drawing: false
            }),
            lose: $.ui.Decal({
                strip: {
                    src: "lost.png",
                    size: $.Dimension(57, 9)
                },
                scale: 3,
                pos: $.Point($.canvas.width / 2 - 28 * 3, $.canvas.height / 2 - 4 * 3),
                name: "raceresult-lose",
                updating: false,
                drawing: false
            })
        };
    }, {
        baseclassjs: 2,
        dragonjs: 20
    } ],
    79: [ function(require, module, exports) {
        var $ = require("dragonjs");
        module.exports = {
            shuffle: function(arr) {
                var i, j, x;
                for (i = 0; i < arr.length; i += 1) {
                    j = parseInt($.random() * (i + 1));
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
        dragonjs: 20
    } ]
}, {}, [ 51, 52, 53, 54, 55, 56, 57, 65, 79 ]);