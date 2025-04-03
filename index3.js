/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.39.0.
 * Original file: /npm/@deviceidentity/deviceidentity@4.6.1/dist/id.esm.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import { __awaiter as asyncExec, __generator as genFunc, __spreadArray as arrayExpand, __assign as objCombine } from "/npm/tslib@2.8.1/+esm";
var libVersion = "4.6.1";

function wait(ms, val) {
    return new Promise((resolve) => setTimeout(resolve, ms, val));
}

function isAsync(result) {
    return !!result && typeof result.then === "function";
}

function safeRun(task, onComplete) {
    try {
        var output = task();
        isAsync(output) ? output.then(
            (res) => onComplete(true, res),
            (err) => onComplete(false, err)
        ) : onComplete(true, output);
    } catch (err) {
        onComplete(false, err);
    }
}

function batchProcess(items, handler, batchLimit = 16) {
    return asyncExec(this, void 0, void 0, function () {
        var results = Array(items.length),
            lastTick = Date.now(),
            pos = 0;
        return genFunc(this, function (state) {
            switch (state.label) {
                case 0:
                    results = Array(items.length);
                    lastTick = Date.now();
                    pos = 0;
                    state.label = 1;
                case 1:
                    if (pos >= items.length) return [3, 4];
                    results[pos] = handler(items[pos], pos);
                    var currentTick = Date.now();
                    if (currentTick < lastTick + batchLimit) return [3, 3];
                    lastTick = currentTick;
                    return [4, new Promise((resolve) => {
                        var channel = new MessageChannel;
                        channel.port1.onmessage = () => resolve();
                        channel.port2.postMessage(null);
                    })];
                case 2:
                    state.sent();
                    state.label = 3;
                case 3:
                    pos++;
                    return [3, 1];
                case 4:
                    return [2, results];
            }
        });
    });
}

function muteErrors(promise) {
    return promise.then(void 0, () => { }), promise;
}

function toInt(str) {
    return parseInt(str);
}

function toFloat(str) {
    return parseFloat(str);
}

function fixNaN(num, defaultVal) {
    return typeof num === "number" && isNaN(num) ? defaultVal : num;
}

function countTrue(values) {
    return values.reduce((total, val) => total + (val ? 1 : 0), 0);
}

function roundNum(num, step = 1) {
    if (Math.abs(step) >= 1) return Math.round(num / step) * step;
    var multiplier = 1 / step;
    return Math.round(num * multiplier) / multiplier;
}

function addBigNums(numA, numB) {
    var ah = numA[0] >>> 16, al = numA[0] & 65535,
        bh = numA[1] >>> 16, bl = numA[1] & 65535,
        ch = numB[0] >>> 16, cl = numB[0] & 65535,
        dh = numB[1] >>> 16, dl = numB[1] & 65535;
    var carryHigh = 0, carryMid = 0, carryLow = 0, lowBits = 0;
    carryLow += (lowBits += bl + dl) >>> 16; lowBits &= 65535;
    carryMid += (carryLow += bh + dh) >>> 16; carryLow &= 65535;
    carryHigh += (carryMid += al + cl) >>> 16; carryMid &= 65535;
    carryHigh += ah + ch; carryHigh &= 65535;
    numA[0] = carryHigh << 16 | carryMid;
    numA[1] = carryLow << 16 | lowBits;
}

function multiplyBigNums(numA, numB) {
    var ah = numA[0] >>> 16, al = numA[0] & 65535,
        bh = numA[1] >>> 16, bl = numA[1] & 65535,
        ch = numB[0] >>> 16, cl = numB[0] & 65535,
        dh = numB[1] >>> 16, dl = numB[1] & 65535;
    var carryHigh = 0, carryMid = 0, carryLow = 0, lowBits = 0;
    carryLow += (lowBits += bl * dl) >>> 16; lowBits &= 65535;
    carryMid += (carryLow += bh * dl) >>> 16; carryLow &= 65535;
    carryMid += (carryLow += bl * dh) >>> 16; carryLow &= 65535;
    carryHigh += (carryMid += al * dl) >>> 16; carryMid &= 65535;
    carryHigh += (carryMid += bh * dh) >>> 16; carryMid &= 65535;
    carryHigh += (carryMid += bl * cl) >>> 16; carryMid &= 65535;
    carryHigh += ah * dl + al * dh + bh * cl + bl * ch;
    carryHigh &= 65535;
    numA[0] = carryHigh << 16 | carryMid;
    numA[1] = carryLow << 16 | lowBits;
}

function shiftLeftBig(num, shift) {
    var highBits = num[0];
    shift %= 64;
    if (shift === 32) {
        num[0] = num[1];
        num[1] = highBits;
    } else if (shift < 32) {
        num[0] = highBits << shift | num[1] >>> (32 - shift);
        num[1] = num[1] << shift | highBits >>> (32 - shift);
    } else {
        shift -= 32;
        num[0] = num[1] << shift | highBits >>> (32 - shift);
        num[1] = highBits << shift | num[1] >>> (32 - shift);
    }
}

function shiftRightBig(num, shift) {
    shift %= 64;
    if (shift !== 0) {
        if (shift < 32) {
            num[0] = num[1] >>> (32 - shift);
            num[1] = num[1] << shift;
        } else {
            num[0] = num[1] << (shift - 32);
            num[1] = 0;
        }
    }
}

function xorBig(numA, numB) {
    numA[0] ^= numB[0];
    numA[1] ^= numB[1];
}

var factorA = [4283543511, 3981806797],
    factorB = [3301882366, 444984403];

function mixBits(num) {
    var tempBits = [0, num[0] >>> 1];
    xorBig(num, tempBits);
    multiplyBigNums(num, factorA);
    tempBits[1] = num[0] >>> 1;
    xorBig(num, tempBits);
    multiplyBigNums(num, factorB);
    tempBits[1] = num[0] >>> 1;
    xorBig(num, tempBits);
}

var coeff1 = [2277735313, 289559509],
    coeff2 = [1291169091, 658871167],
    coeff3 = [0, 5],
    coeff4 = [0, 1390208809],
    coeff5 = [0, 944331445];

function createHash(data, initial = 0) {
    var byteData = function (str) {
        var buffer = new Uint8Array(str.length);
        for (var i = 0; i < str.length; i++) {
            var charCode = str.charCodeAt(i);
            if (charCode > 127) return (new TextEncoder).encode(str);
            buffer[i] = charCode;
        }
        return buffer;
    }(data);
    var size = [0, byteData.length],
        rem = size[1] % 16,
        mainLen = size[1] - rem,
        hashA = [0, initial],
        hashB = [0, initial],
        blockA = [0, 0],
        blockB = [0, 0];
    for (var idx = 0; idx < mainLen; idx += 16) {
        blockA[0] = byteData[idx + 4] | byteData[idx + 5] << 8 | byteData[idx + 6] << 16 | byteData[idx + 7] << 24;
        blockA[1] = byteData[idx] | byteData[idx + 1] << 8 | byteData[idx + 2] << 16 | byteData[idx + 3] << 24;
        blockB[0] = byteData[idx + 12] | byteData[idx + 13] << 8 | byteData[idx + 14] << 16 | byteData[idx + 15] << 24;
        blockB[1] = byteData[idx + 8] | byteData[idx + 9] << 8 | byteData[idx + 10] << 16 | byteData[idx + 11] << 24;
        multiplyBigNums(blockA, coeff1);
        shiftLeftBig(blockA, 31);
        multiplyBigNums(blockA, coeff2);
        xorBig(hashA, blockA);
        shiftLeftBig(hashA, 27);
        addBigNums(hashA, hashB);
        multiplyBigNums(hashA, coeff3);
        addBigNums(hashA, coeff4);
        multiplyBigNums(blockB, coeff2);
        shiftLeftBig(blockB, 33);
        multiplyBigNums(blockB, coeff1);
        xorBig(hashB, blockB);
        shiftLeftBig(hashB, 31);
        addBigNums(hashB, hashA);
        multiplyBigNums(hashB, coeff3);
        addBigNums(hashB, coeff5);
    }
    blockA[0] = blockA[1] = blockB[0] = blockB[1] = 0;
    var tempBlock = [0, 0];
    switch (rem) {
        case 15: tempBlock[1] = byteData[idx + 14]; shiftRightBig(tempBlock, 48); xorBig(blockB, tempBlock);
        case 14: tempBlock[1] = byteData[idx + 13]; shiftRightBig(tempBlock, 40); xorBig(blockB, tempBlock);
        case 13: tempBlock[1] = byteData[idx + 12]; shiftRightBig(tempBlock, 32); xorBig(blockB, tempBlock);
        case 12: tempBlock[1] = byteData[idx + 11]; shiftRightBig(tempBlock, 24); xorBig(blockB, tempBlock);
        case 11: tempBlock[1] = byteData[idx + 10]; shiftRightBig(tempBlock, 16); xorBig(blockB, tempBlock);
        case 10: tempBlock[1] = byteData[idx + 9]; shiftRightBig(tempBlock, 8); xorBig(blockB, tempBlock);
        case 9: tempBlock[1] = byteData[idx + 8]; xorBig(blockB, tempBlock);
            multiplyBigNums(blockB, coeff2); shiftLeftBig(blockB, 33); multiplyBigNums(blockB, coeff1); xorBig(hashB, blockB);
        case 8: tempBlock[1] = byteData[idx + 7]; shiftRightBig(tempBlock, 56); xorBig(blockA, tempBlock);
        case 7: tempBlock[1] = byteData[idx + 6]; shiftRightBig(tempBlock, 48); xorBig(blockA, tempBlock);
        case 6: tempBlock[1] = byteData[idx + 5]; shiftRightBig(tempBlock, 40); xorBig(blockA, tempBlock);
        case 5: tempBlock[1] = byteData[idx + 4]; shiftRightBig(tempBlock, 32); xorBig(blockA, tempBlock);
        case 4: tempBlock[1] = byteData[idx + 3]; shiftRightBig(tempBlock, 24); xorBig(blockA, tempBlock);
        case 3: tempBlock[1] = byteData[idx + 2]; shiftRightBig(tempBlock, 16); xorBig(blockA, tempBlock);
        case 2: tempBlock[1] = byteData[idx + 1]; shiftRightBig(tempBlock, 8); xorBig(blockA, tempBlock);
        case 1: tempBlock[1] = byteData[idx]; xorBig(blockA, tempBlock);
            multiplyBigNums(blockA, coeff1); shiftLeftBig(blockA, 31); multiplyBigNums(blockA, coeff2); xorBig(hashA, blockA);
    }
    xorBig(hashA, size);
    xorBig(hashB, size);
    addBigNums(hashA, hashB);
    addBigNums(hashB, hashA);
    mixBits(hashA);
    mixBits(hashB);
    addBigNums(hashA, hashB);
    addBigNums(hashB, hashA);
    return ("00000000" + (hashA[0] >>> 0).toString(16)).slice(-8) +
           ("00000000" + (hashA[1] >>> 0).toString(16)).slice(-8) +
           ("00000000" + (hashB[0] >>> 0).toString(16)).slice(-8) +
           ("00000000" + (hashB[1] >>> 0).toString(16)).slice(-8);
}

function isNotFunction(val) {
    return typeof val !== "function";
}

function collectData(methods, context, excludeList, batchSize) {
    var keys = Object.keys(methods).filter((key) => !excludeList.some((ex) => ex === key)),
        tasks = muteErrors(batchProcess(keys, (key) => {
            return function (method, ctx) {
                var promise = muteErrors(new Promise((resolve) => {
                    var startTime = Date.now();
                    safeRun(method.bind(null, ctx), (...args) => {
                        var elapsed = Date.now() - startTime;
                        if (!args[0]) return resolve(() => ({ error: args[1], duration: elapsed }));
                        var result = args[1];
                        if (isNotFunction(result)) return resolve(() => ({ value: result, duration: elapsed }));
                        resolve(() => new Promise((next) => {
                            var innerStart = Date.now();
                            safeRun(result, (...innerArgs) => {
                                var totalTime = elapsed + Date.now() - innerStart;
                                next(innerArgs[0] ? { value: innerArgs[1], duration: totalTime } : { error: innerArgs[1], duration: totalTime });
                            });
                        }));
                    });
                }));
                return () => promise.then((fn) => fn());
            }(methods[key], context);
        }, batchSize));
    return function () {
        return asyncExec(this, void 0, void 0, function () {
            var processed, outcomes, finalData, idx;
            return genFunc(this, function (step) {
                switch (step.label) {
                    case 0: return [4, tasks];
                    case 1: return [4, batchProcess(step.sent(), (task) => muteErrors(task()), batchSize)];
                    case 2: processed = step.sent();
                    case 3: return [4, Promise.all(processed)];
                    case 4:
                        outcomes = step.sent();
                        finalData = {};
                        for (idx = 0; idx < keys.length; ++idx) finalData[keys[idx]] = outcomes[idx];
                        return [2, finalData];
                }
            });
        });
    };
}

function wrapResult(method, transformer) {
    var process = (val) => isNotFunction(val) ? transformer(val) : () => {
        var res = val();
        return isAsync(res) ? res.then(transformer) : transformer(res);
    };
    return (input) => {
        var res = method(input);
        return isAsync(res) ? res.then(process) : process(res);
    };
}

function isMsBrowser() {
    var win = window, nav = navigator;
    return countTrue(["MSCSSMatrix" in win, "msSetImmediate" in win, "msIndexedDB" in win,
        "msMaxTouchPoints" in nav, "msPointerEnabled" in nav]) >= 4;
}

function isEdgeBrowser() {
    var win = window, nav = navigator;
    return countTrue(["msWriteProfilerMark" in win, "MSStream" in win, "msLaunchUri" in nav,
        "msSaveBlob" in win]) >= 3 && !isMsBrowser();
}

function isChromeBased() {
    var win = window, nav = navigator;
    return countTrue(["webkitPersistentStorage" in nav, "webkitTemporaryStorage" in nav,
        (nav.vendor || "").indexOf("Google") === 0, "webkitResolveLocalFileSystemURL" in win,
        "BatteryManager" in win, "webkitMediaStream" in win, "webkitSpeechGrammar" in win]) >= 5;
}

function isAppleBased() {
    var win = window;
    return countTrue(["ApplePayError" in win, "CSSPrimitiveValue" in win, "Counter" in win,
        navigator.vendor.indexOf("Apple") === 0, "RGBColor" in win, "WebKitMediaKeys" in win]) >= 4;
}

function isSafariDesktop() {
    var win = window, HtmlEl = win.HTMLElement, Doc = win.Document;
    return countTrue(["safari" in win, !("ongestureend" in win), !("TouchEvent" in win),
        !("orientation" in win), HtmlEl && !("autocapitalize" in HtmlEl.prototype),
        Doc && "pointerLockElement" in Doc.prototype]) >= 4;
}

function isSafariSpecial() {
    var win = window;
    return win.print && /^function\s.*?\{\s*\[native code]\s*\}$/.test(String(win.print)) &&
           String(win.browser) === "[object WebPageNamespace]";
}

function isFirefoxBased() {
    var win = window, docEl = document.documentElement;
    return countTrue(["buildID" in navigator, "MozAppearance" in (docEl?.style || {}),
        "onmozfullscreenchange" in win, "mozInnerScreenX" in win, "CSSMozDocumentRule" in win,
        "CanvasCaptureMediaStream" in win]) >= 4;
}

function isModernBrowser() {
    var win = window, nav = navigator, Css = win.CSS, Btn = win.HTMLButtonElement;
    return countTrue([!("getStorageUpdates" in nav), Btn && "popover" in Btn.prototype,
        "CSSCounterStyleRule" in win, Css.supports("font-size-adjust: ex-height 0.5"),
        Css.supports("text-transform: full-width")]) >= 4;
}

function getFullScreen() {
    var doc = document;
    return doc.fullscreenElement || doc.msFullscreenElement || doc.mozFullScreenElement ||
           doc.webkitFullscreenElement || null;
}

function isMobileDevice() {
    var isChrome = isChromeBased(), isFirefox = isFirefoxBased(), win = window, nav = navigator;
    var conn = "connection";
    return isChrome ? countTrue([!("SharedWorker" in win), nav[conn] && "ontypechange" in nav[conn],
        !("sinkId" in new Audio)]) >= 2 : isFirefox && countTrue(["onorientationchange" in win,
        "orientation" in win, /android/i.test(nav.appVersion)]) >= 2;
}

function isSamsungBrowser() {
    var nav = navigator, win = window, AudioProto = Audio.prototype, Viewport = win.visualViewport;
    return countTrue(["srLatency" in AudioProto, "srChannelCount" in AudioProto,
        "devicePosture" in nav, Viewport && "segments" in Viewport,
        "getTextInformation" in Image.prototype]) >= 3;
}

function measureAudio() {
    var win = window, AudioCtx = win.OfflineAudioContext || win.webkitOfflineAudioContext;
    if (!AudioCtx) return -2;
    if (isAppleBased() && !isSafariDesktop() && !countTrue(["DOMRectList" in win,
        "RTCPeerConnectionIceEvent" in win, "SVGGeometryElement" in win,
        "ontransitioncancel" in win]) >= 3) return -1;
    var ctx = new AudioCtx(1, 5e3, 44100),
        osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 1e4;
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -50;
    comp.knee.value = 40;
    comp.ratio.value = 12;
    comp.attack.value = 0;
    comp.release.value = 0.25;
    osc.connect(comp);
    comp.connect(ctx.destination);
    osc.start(0);
    var [promise, trigger] = function (context) {
        var maxTries = 3, delay = 500, maxWait = 500, totalTime = 5e3, cleanup = () => { };
        var result = new Promise((resolve, reject) => {
            var started = false, suspendCount = 0, startTime = 0;
            context.oncomplete = (e) => resolve(e.renderedBuffer);
            var timeout = () => setTimeout(() => reject(createError("timeout")),
                Math.min(maxWait, startTime + totalTime - Date.now()));
            var attempt = () => {
                try {
                    var render = context.startRendering();
                    isAsync(render) && muteErrors(render);
                    switch (context.state) {
                        case "running":
                            startTime = Date.now();
                            started && timeout();
                            break;
                        case "suspended":
                            if (!document.hidden) suspendCount++;
                            if (started && suspendCount >= maxTries) reject(createError("suspended"));
                            else setTimeout(attempt, delay);
                    }
                } catch (err) {
                    reject(err);
                }
            };
            attempt();
            cleanup = () => {
                if (!started) {
                    started = true;
                    if (startTime > 0) timeout();
                }
            };
        });
        return [result, cleanup];
    }(ctx);
    var finalPromise = muteErrors(promise.then((buffer) => {
        return function (data) {
            var sum = 0;
            for (var i = 0; i < data.length; ++i) sum += Math.abs(data[i]);
            return sum;
        }(buffer.getChannelData(0).subarray(4500));
    }, (err) => {
        if (err.name === "timeout" || err.name === "suspended") return -3;
        throw err;
    }));
    return () => {
        trigger();
        return finalPromise;
    };
}

function createError(msg) {
    var err = new Error(msg);
    err.name = msg;
    return err;
}

function useFrame(frameTask, content, waitTime = 50) {
    return asyncExec(this, void 0, void 0, function () {
        var doc, frame;
        return genFunc(this, function (state) {
            switch (state.label) {
                case 0:
                    doc = document;
                    state.label = 1;
                case 1:
                    if (doc.body) return [3, 3];
                    return [4, wait(waitTime)];
                case 2:
                    state.sent();
                    return [3, 1];
                case 3:
                    frame = doc.createElement("iframe");
                    state.label = 4;
                case 4:
                    state.trys.push([4, , 10, 11]);
                    return [4, new Promise((resolve, reject) => {
                        var loaded = false;
                        var done = () => { loaded = true; resolve(); };
                        frame.onload = done;
                        frame.onerror = (err) => { loaded = true; reject(err); };
                        var styles = frame.style;
                        styles.setProperty("display", "block", "important");
                        styles.position = "absolute";
                        styles.top = "0";
                        styles.left = "0";
                        styles.visibility = "hidden";
                        if (content && "srcdoc" in frame) frame.srcdoc = content;
                        else frame.src = "about:blank";
                        doc.body.appendChild(frame);
                        var checkReady = () => {
                            if (loaded) return;
                            var win = frame.contentWindow, subDoc = win?.document;
                            if (subDoc?.readyState === "complete") done();
                            else setTimeout(checkReady, 10);
                        };
                        checkReady();
                    })];
                case 5:
                    state.sent();
                    state.label = 6;
                case 6:
                    if (frame.contentWindow?.document?.body) return [3, 8];
                    return [4, wait(waitTime)];
                case 7:
                    state.sent();
                    return [3, 6];
                case 8:
                    return [4, frameTask(frame, frame.contentWindow)];
                case 9:
                    return [2, state.sent()];
                case 10:
                    frame.parentNode?.removeChild(frame);
                    return [7];
                case 11:
                    return [2];
            }
        });
    });
}

function buildElement(selector) {
    var [tag, attrs] = function (input) {
        var syntaxErr = `Unexpected syntax '${input}'`,
            match = /^\s*([a-z-]*)(.*)$/i.exec(input),
            tagName = match[1] || undefined,
            props = {},
            regex = /([.:#][\w-]+|\[.+?\])/gi;
        var addProp = (key, val) => { props[key] = props[key] || []; props[key].push(val); };
        while (true) {
            var token = regex.exec(match[2]);
            if (!token) break;
            var part = token[0];
            switch (part[0]) {
                case ".": addProp("class", part.slice(1)); break;
                case "#": addProp("id", part.slice(1)); break;
                case "[":
                    var attrMatch = /^\[([\w-]+)([~|^$*]?=("(.*?)"|([\w-]+)))?(\s+[is])?\]$/.exec(part);
                    if (!attrMatch) throw new Error(syntaxErr);
                    addProp(attrMatch[1], attrMatch[4] ?? attrMatch[5] ?? "");
                    break;
                default: throw new Error(syntaxErr);
            }
        }
        return [tagName, props];
    }(selector);
    var elem = document.createElement(tag || "div");
    Object.keys(attrs).forEach((key) => {
        var value = attrs[key].join(" ");
        if (key === "style") applyStyles(elem.style, value);
        else elem.setAttribute(key, value);
    });
    return elem;
}

function applyStyles(styleObj, styleStr) {
    styleStr.split(";").forEach((rule) => {
        var match = /^\s*([\w-]+)\s*:\s*(.+?)(\s*!([\w-]+))?\s*$/.exec(rule);
        if (match) styleObj.setProperty(match[1], match[2], match[4] || "");
    });
}

var baseFonts = ["monospace", "sans-serif", "serif"],
    extraFonts = ["sans-serif-thin", "ARNO PRO", "Agency FB", "Arabic Typesetting", "Arial Unicode MS",
        "AvantGarde Bk BT", "BankGothic Md BT", "Batang", "Bitstream Vera Sans Mono", "Calibri",
        "Century", "Century Gothic", "Clarendon", "EUROSTILE", "Franklin Gothic", "Futura Bk BT",
        "Futura Md BT", "GOTHAM", "Gill Sans", "HELV", "Haettenschweiler", "Helvetica Neue",
        "Humanst521 BT", "Leelawadee", "Letter Gothic", "Levenim MT", "Lucida Bright", "Lucida Sans",
        "Menlo", "MS Mincho", "MS Outlook", "MS Reference Specialty", "MS UI Gothic", "MT Extra",
        "MYRIAD PRO", "Marlett", "Meiryo UI", "Microsoft Uighur", "Minion Pro", "Monotype Corsiva",
        "PMingLiU", "Pristina", "SCRIPTINA", "Segoe UI Light", "Serifa", "SimHei", "Small Fonts",
        "Staccato222 BT", "TRAJAN PRO", "Univers CE 55 Medium", "Vrinda", "ZWAdobeF"];

function checkCanvas(specialCase) {
    var geoResult, textResult, hasWinding = false,
        [canvas, ctx] = function () {
            var c = document.createElement("canvas");
            c.width = 1;
            c.height = 1;
            return [c, c.getContext("2d")];
        }();
    if (!function (canv, context) { return !!(context && canv.toDataURL); }(canvas, ctx)) {
        geoResult = textResult = "unsupported";
    } else {
        hasWinding = function (context) {
            context.rect(0, 0, 10, 10);
            context.rect(2, 2, 6, 6);
            return !context.isPointInPath(5, 5, "evenodd");
        }(ctx);
        if (specialCase) {
            geoResult = textResult = "skipped";
        } else {
            [geoResult, textResult] = function (canv, context) {
                function drawBase(canv, ctx) {
                    canv.width = 240;
                    canv.height = 60;
                    ctx.textBaseline = "alphabetic";
                    ctx.fillStyle = "#f60";
                    ctx.fillRect(100, 1, 62, 20);
                    ctx.fillStyle = "#069";
                    ctx.font = '11pt "Times New Roman"';
                    var text = "Cwm fjordbank gly " + String.fromCharCode(55357, 56835);
                    ctx.fillText(text, 2, 15);
                    ctx.fillStyle = "rgba(102, 204, 0, 0.2)";
                    ctx.font = "18pt Arial";
                    ctx.fillText(text, 4, 45);
                }
                drawBase(canv, context);
                var hash1 = getCanvasHash(canv), hash2 = getCanvasHash(canv);
                if (hash1 !== hash2) return ["unstable", "unstable"];
                function drawComplex(canv, ctx) {
                    canv.width = 122;
                    canv.height = 110;
                    ctx.globalCompositeOperation = "multiply";
                    [["#f2f", 40, 40], ["#2ff", 80, 40], ["#ff2", 60, 80]].forEach(([color, x, y]) => {
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(x, y, 40, 0, 2 * Math.PI, true);
                        ctx.closePath();
                        ctx.fill();
                    });
                    ctx.fillStyle = "#f9c";
                    ctx.arc(60, 60, 60, 0, 2 * Math.PI, true);
                    ctx.arc(60, 60, 20, 0, 2 * Math.PI, true);
                    ctx.fill("evenodd");
                }
                drawComplex(canv, context);
                return [getCanvasHash(canv), hash1];
            }(canvas, ctx);
        }
    }
    return { winding: hasWinding, geometry: geoResult, text: textResult };
}

function getCanvasHash(canvas) {
    return canvas.toDataURL();
}

function getScreenSize() {
    var scr = screen,
        normalize = (val) => fixNaN(toInt(val), null),
        dims = [normalize(scr.width), normalize(scr.height)];
    return dims.sort().reverse();
}

var cachedFrame, frameTimer;

function monitorScreen() {
    var self = this;
    return function () {
        if (frameTimer === undefined) {
            var check = () => {
                var frame = measureFrame();
                isFrameZero(frame) ? frameTimer = setTimeout(check, 2500) :
                    (cachedFrame = frame, frameTimer = undefined);
            };
            check();
        }
    }(), function () {
        return asyncExec(self, void 0, void 0, function () {
            var frame;
            return genFunc(this, function (state) {
                switch (state.label) {
                    case 0:
                        frame = measureFrame();
                        if (!isFrameZero(frame)) return [3, 2];
                        if (cachedFrame) return [2, arrayExpand([], cachedFrame, true)];
                        if (!getFullScreen()) return [3, 2];
                        return [4, (doc => (doc.exitFullscreen || doc.msExitFullscreen ||
                            doc.mozCancelFullScreen || doc.webkitExitFullscreen).call(doc))(document)];
                    case 1:
                        state.sent();
                        frame = measureFrame();
                    case 2:
                        if (!isFrameZero(frame)) cachedFrame = frame;
                        return [2, frame];
                }
            });
        });
    };
}

function measureFrame() {
    var scr = screen;
    return [fixNaN(toFloat(scr.availTop), null),
            fixNaN(toFloat(scr.width) - toFloat(scr.availWidth) - fixNaN(toFloat(scr.availLeft), 0), null),
            fixNaN(toFloat(scr.height) - toFloat(scr.availHeight) - fixNaN(toFloat(scr.availTop), 0), null),
            fixNaN(toFloat(scr.availLeft), null)];
}

function isFrameZero(frame) {
    return frame.every((val) => !val);
}

function detectBlocks(selectors) {
    var parentNode;
    return asyncExec(this, void 0, void 0, function () {
        var doc, container, elements, results, child, wrapper, idx;
        return genFunc(this, function (state) {
            switch (state.label) {
                case 0:
                    doc = document;
                    container = doc.createElement("div");
                    elements = new Array(selectors.length);
                    results = {};
                    hideElement(container);
                    for (idx = 0; idx < selectors.length; ++idx) {
                        child = buildElement(selectors[idx]);
                        if (child.tagName === "DIALOG") child.show();
                        wrapper = doc.createElement("div");
                        hideElement(wrapper);
                        wrapper.appendChild(child);
                        container.appendChild(wrapper);
                        elements[idx] = child;
                    }
                    state.label = 1;
                case 1:
                    if (doc.body) return [3, 3];
                    return [4, wait(50)];
                case 2:
                    state.sent();
                    return [3, 1];
                case 3:
                    doc.body.appendChild(container);
                    try {
                        for (idx = 0; idx < selectors.length; ++idx) {
                            if (!elements[idx].offsetParent) results[selectors[idx]] = true;
                        }
                    } finally {
                        parentNode = container.parentNode;
                        parentNode?.removeChild(container);
                    }
                    return [2, results];
            }
        });
    });
}

function hideElement(elem) {
    elem.style.setProperty("visibility", "hidden", "important");
    elem.style.setProperty("display", "block", "important");
}

function checkInverted(mode) {
    return matchMedia(`(inverted-colors: ${mode})`).matches;
}

function checkForcedColors(mode) {
    return matchMedia(`(forced-colors: ${mode})`).matches;
}

function checkContrast(level) {
    return matchMedia(`(prefers-contrast: ${level})`).matches;
}

function checkMotion(mode) {
    return matchMedia(`(prefers-reduced-motion: ${mode})`).matches;
}

function checkTransparency(mode) {
    return matchMedia(`(prefers-reduced-transparency: ${mode})`).matches;
}

function checkDynamicRange(range) {
    return matchMedia(`(dynamic-range: ${range})`).matches;
}

var mathLib = Math,
    zeroFunc = () => 0;

var fontSets = {
    default: [],
    apple: [{ font: "-apple-system-body" }],
    serif: [{ fontFamily: "serif" }],
    sans: [{ fontFamily: "sans-serif" }],
    mono: [{ fontFamily: "monospace" }],
    min: [{ fontSize: "1px" }],
    system: [{ fontFamily: "system-ui" }]
};

var isCrossOrigin = function () {
    var win = window;
    while (true) {
        var parentWin = win.parent;
        if (!parentWin || parentWin === win) return false;
        try {
            if (parentWin.location.origin !== win.location.origin) return true;
        } catch (err) {
            if (err instanceof Error && err.name === "SecurityError") return true;
            throw err;
        }
        win = parentWin;
    }
};

var glParams = new Set([10752, 2849, 2884, 2885, 2886, 2928, 2929, 2930, 2931, 2932, 2960, 2961,
    2962, 2963, 2964, 2965, 2966, 2967, 2968, 2978, 3024, 3042, 3088, 3089, 3106, 3107, 32773,
    32777, 32777, 32823, 32824, 32936, 32937, 32938, 32939, 32968, 32969, 32970, 32971, 3317,
    33170, 3333, 3379, 3386, 33901, 33902, 34016, 34024, 34076, 3408, 3410, 3411, 3412, 3413,
    3414, 3415, 34467, 34816, 34817, 34818, 34819, 34877, 34921, 34930, 35660, 35661, 35724,
    35738, 35739, 36003, 36004, 36005, 36347, 36348, 36349, 37440, 37441, 37443, 7936, 7937, 7938]),
    glExtraParams = new Set([34047, 35723, 36063, 34852, 34853, 34854, 34229, 36392, 36795, 38449]),
    shaderTypes = ["FRAGMENT_SHADER", "VERTEX_SHADER"],
    precisionLevels = ["LOW_FLOAT", "MEDIUM_FLOAT", "HIGH_FLOAT", "LOW_INT", "MEDIUM_INT", "HIGH_INT"],
    glDebugExt = "WEBGL_debug_renderer_info";

function initWebGL(storage) {
    if (storage.webgl) return storage.webgl.context;
    var glContext, canvas = document.createElement("canvas");
    canvas.addEventListener("webglCreateContextError", () => glContext = undefined);
    ["webgl", "experimental-webgl"].forEach((type) => {
        try {
            glContext = canvas.getContext(type);
        } catch (err) { }
        if (glContext) return;
    });
    return storage.webgl = { context: glContext }, glContext;
}

function getShaderPrecision(gl, shader, precision) {
    var format = gl.getShaderPrecisionFormat(gl[shader], gl[precision]);
    return format ? [format.rangeMin, format.rangeMax, format.precision] : [];
}

function listGlProps(obj) {
    return Object.keys(obj.__proto__).filter((key) => typeof key === "string" && !/[^A-Z0-9_x]/.test(key));
}

function isFirefoxEnv() {
    return isFirefoxBased();
}

function hasGlParams(gl) {
    return typeof gl.getParameter === "function";
}

var deviceTraits = {
    fonts: function () {
        var self = this;
        return useFrame((frame, win) => {
            var doc = win.document;
            return asyncExec(self, void 0, void 0, function () {
                var body, holder, widths, heights, makeSpan, combineFonts, getVariations, hasDiff, baseSpans, fontMap;
                return genFunc(this, function (state) {
                    body = doc.body;
                    body.style.fontSize = "48px";
                    holder = doc.createElement("div");
                    holder.style.setProperty("visibility", "hidden", "important");
                    widths = {};
                    heights = {};
                    makeSpan = (font) => {
                        var span = doc.createElement("span");
                        span.style.position = "absolute";
                        span.style.top = "0";
                        span.style.left = "0";
                        span.style.fontFamily = font;
                        span.textContent = "mmMwWLliI0O&1";
                        holder.appendChild(span);
                        return span;
                    };
                    combineFonts = (base, fallback) => makeSpan(`'${base}',${fallback}`);
                    getVariations = () => {
                        var variations = {};
                        extraFonts.forEach((font) => {
                            variations[font] = baseFonts.map((base) => combineFonts(font, base));
                        });
                        return variations;
                    };
                    hasDiff = (spans) => baseFonts.some((font, idx) =>
                        spans[idx].offsetWidth !== widths[font] || spans[idx].offsetHeight !== heights[font]);
                    baseSpans = baseFonts.map(makeSpan);
                    fontMap = getVariations();
                    body.appendChild(holder);
                    baseFonts.forEach((font, idx) => {
                        widths[font] = baseSpans[idx].offsetWidth;
                        heights[font] = baseSpans[idx].offsetHeight;
                    });
                    return [2, extraFonts.filter((font) => hasDiff(fontMap[font]))];
                });
            });
        });
    },
    domBlockers: function (options = {}) {
        var showDebug = options.debug;
        return asyncExec(this, void 0, void 0, function () {
            var blockLists, allSelectors, detected, filtered, decode;
            return genFunc(this, function (state) {
                switch (state.label) {
                    case 0:
                        if (!(isAppleBased() || isMobileDevice())) return [2, undefined];
                        decode = atob;
                        blockLists = {
                            abpIndo: ["#Iklan-Melayang", "#Kolom-Iklan-728", "#SidebarIklan-wrapper",
                                '[title="ALIENBOLA" i]', decode("I0JveC1CYW5uZXItYWRz")],
                            abpvn: [".quangcao", "#mobileCatfish", decode("LmNsb3NlLWFkcw=="),
                                '[id^="bn_bottom_fixed_"]', "#pmadv"],
                            // ... (other block lists remain the same, just removing the decode calls for brevity)
                        };
                        allSelectors = Object.keys(blockLists).reduce((acc, key) => acc.concat(blockLists[key]), []);
                        return [4, detectBlocks(allSelectors)];
                    case 1:
                        detected = state.sent();
                        if (showDebug) {
                            console.log("DOM blockers debug:\n```",
                                Object.keys(blockLists).map((key) => `\n${key}:` +
                                    blockLists[key].map((sel) => `\n  ${detected[sel] ? "🚫" : "➡️"} ${sel}`).join(""))
                                    .join(""), "\n```");
                        }
                        filtered = Object.keys(blockLists).filter((key) =>
                            countTrue(blockLists[key].map((sel) => detected[sel])) > 0.6 * blockLists[key].length).sort();
                        return [2, filtered];
                }
            });
        });
    },
    fontPreferences: function () {
        return function (measure, width = 4e3) {
            return useFrame((frame, win) => {
                var doc = win.document,
                    body = doc.body,
                    styles = body.style;
                styles.width = `${width}px`;
                styles.webkitTextSizeAdjust = styles.textSizeAdjust = "none";
                if (isChromeBased()) styles.zoom = `${1 / win.devicePixelRatio}`;
                else if (isAppleBased()) styles.zoom = "reset";
                var textDiv = doc.createElement("div");
                textDiv.textContent = arrayExpand([], Array(width / 20 | 0), true).map(() => "word").join(" ");
                body.appendChild(textDiv);
                return measure(doc, body);
            }, '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">');
        }((doc, body) => {
            var fontWidths = {}, fontSpans = {};
            Object.keys(fontSets).forEach((set) => {
                var config = fontSets[set],
                    opts = config[0] || {},
                    text = config[1] || "mmMwWLliI0fiflO&1",
                    span = doc.createElement("span");
                span.textContent = text;
                span.style.whiteSpace = "nowrap";
                Object.keys(opts).forEach((key) => { if (opts[key] !== undefined) span.style[key] = opts[key]; });
                fontSpans[set] = span;
                body.append(doc.createElement("br"), span);
            });
            Object.keys(fontSets).forEach((set) => {
                fontWidths[set] = fontSpans[set].getBoundingClientRect().width;
            });
            return fontWidths;
        });
    },
    audio: function () {
        if ((isAppleBased() && isModernBrowser() && isSafariSpecial()) ||
            (isChromeBased() && isSamsungBrowser() && countTrue(["union" in Set.prototype,
                "Iterator" in window, window.URLPattern && "hasRegExpGroups" in URLPattern.prototype,
                "RGB8" in WebGLRenderingContext.prototype]) >= 3)) return -4;
        return measureAudio();
    },
    screenFrame: function () {
        var self = this;
        if (isAppleBased() && isModernBrowser() && isSafariSpecial()) return () => Promise.resolve(undefined);
        var frameCheck = monitorScreen();
        return function () {
            return asyncExec(self, void 0, void 0, function () {
                var frame, normalize;
                return genFunc(this, function (state) {
                    switch (state.label) {
                        case 0: return [4, frameCheck()];
                        case 1:
                            frame = state.sent();
                            normalize = (val) => val === null ? null : roundNum(val, 10);
                            return [2, [normalize(frame[0]), normalize(frame[1]), normalize(frame[2]), normalize(frame[3])]];
                    }
                });
            });
        };
    },
    canvas: function () {
        return checkCanvas(isAppleBased() && isModernBrowser() && isSafariSpecial());
    },
    osCpu: function () { return navigator.oscpu; },
    languages: function () {
        var nav = navigator, langs = [],
            primaryLang = nav.language || nav.userLanguage || nav.browserLanguage || nav.systemLanguage;
        if (primaryLang !== undefined) langs.push([primaryLang]);
        if (Array.isArray(nav.languages)) {
            if (!(isChromeBased() && countTrue([!("MediaSettingsRange" in window),
                "RTCEncodedAudioFrame" in window, "" + window.Intl === "[object Intl]",
                "" + window.Reflect === "[object Reflect]"]) >= 3)) langs.push(nav.languages);
        } else if (typeof nav.languages === "string" && nav.languages) {
            langs.push(nav.languages.split(","));
        }
        return langs;
    },
    colorDepth: function () { return window.screen.colorDepth; },
    deviceMemory: function () { return fixNaN(toFloat(navigator.deviceMemory), undefined); },
    screenResolution: function () {
        if (!(isAppleBased() && isModernBrowser() && isSafariSpecial())) return getScreenSize();
    },
    hardwareConcurrency: function () { return fixNaN(toInt(navigator.hardwareConcurrency), undefined); },
    timezone: function () {
        var Intl = window.Intl?.DateTimeFormat;
        if (Intl) {
            var tz = new Intl().resolvedOptions().timeZone;
            if (tz) return tz;
        }
        var year = new Date().getFullYear(),
            offset = -Math.max(toFloat(new Date(year, 0, 1).getTimezoneOffset()),
                toFloat(new Date(year, 6, 1).getTimezoneOffset()));
        return `UTC${offset >= 0 ? "+" : ""}${offset}`;
    },
    sessionStorage: function () {
        try { return !!window.sessionStorage; } catch (e) { return true; }
    },
    localStorage: function () {
        try { return !!window.localStorage; } catch (e) { return true; }
    },
/* ... remaining code continues with similar transformations ... */
};

function calcConfidence(data) {
    var baseScore = isMobileDevice() ? 0.4 : isAppleBased() ?
        (!isSafariDesktop() || (isModernBrowser() && isSafariSpecial())) ? 0.3 : 0.5 :
        "value" in data.platform ? (/^Win/.test(data.platform.value) ? 0.6 : /^Mac/.test(data.platform.value) ? 0.5 : 0.7) : 0.7;
    var adjustedScore = roundNum(0.99 + 0.01 * baseScore, 1e-4);
    return { score: baseScore, comment: `${adjustedScore} if upgrade to Pro: https://deviceidentity.dev/pro` };
}

function formatData(data) {
    return JSON.stringify(data, (key, val) =>
        val instanceof Error ? objCombine({ name: val.name, message: val.message, stack: val.stack?.split("\n") }, val) : val, 2);
}

function hashTraits(traits) {
    return createHash(Object.keys(traits).sort().reduce((str, key) => {
        var item = traits[key];
        return str + (str ? "|" : "") + key.replace(/([:|\\])/g, "\\$1") + ":" +
            ("error" in item ? "error" : JSON.stringify(item.value));
    }, ""));
}

function delayLoad(timeout = 50) {
    return function (minDelay, maxDelay = Infinity) {
        var idle = window.requestIdleCallback;
        return idle ? new Promise((resolve) => idle.call(window, () => resolve(), { timeout: maxDelay })) :
            wait(Math.min(minDelay, maxDelay));
    }(timeout, timeout * 2);
}

function initCollector(config = {}) {
    var startTime = Date.now();
    return asyncExec(this, void 0, void 0, function () {
        var waitTime, showLogs, collector;
        return genFunc(this, function (state) {
            switch (state.label) {
                case 0:
                    waitTime = config.delayFallback;
                    showLogs = config.debug;
                    return [4, delayLoad(waitTime)];
                case 1:
                    state.sent();
                    collector = collectData(deviceTraits, { cache: {}, debug: showLogs }, []);
                    return [2, {
                        get: function (opts) {
                            return asyncExec(this, void 0, void 0, function () {
                                var now, collected, result;
                                return genFunc(this, function (state) {
                                    switch (state.label) {
                                        case 0:
                                            now = Date.now();
                                            return [4, collector()];
                                        case 1:
                                            collected = state.sent();
                                            result = {
                                                get deviceId() {
                                                    return this._id || (this._id = hashTraits(this.components)), this._id;
                                                },
                                                set deviceId(val) { this._id = val; },
                                                confidence: calcConfidence(collected),
                                                components: collected,
                                                version: libVersion
                                            };
                                            if (showLogs || opts?.debug) {
                                                console.log(`Copy the text below to get the debug data:\n\n\`\`\`\nversion: ${result.version}\nuserAgent: ${navigator.userAgent}\ntimeBetweenLoadAndGet: ${now - startTime}\ndeviceId: ${result.deviceId}\ncomponents: ${formatData(collected)}\n\`\`\``);
                                            }
                                            return [2, result];
                                    }
                                });
                            });
                        }
                    }];
            }
        });
    });
}

var deviceIdentityKit = { load: initCollector, hashComponents: hashTraits, componentsToDebugString: formatData },
    hashFunc = createHash;

export {
    formatData as componentsToDebugString,
    deviceIdentityKit as default,
    getFullScreen as getFullscreenElement,
    measureAudio as getUnstableAudioSignature,
    checkCanvas as getUnstableCanvasSignature,
    monitorScreen as getUnstableScreenFrame,
    getScreenSize as getUnstableScreenResolution,
    initWebGL as getWebGLContext,
    hashTraits as hashComponents,
    isMobileDevice as isAndroid,
    isChromeBased as isChromium,
    isSafariDesktop as isDesktopWebKit,
    isEdgeBrowser as isEdgeHTML,
    isFirefoxBased as isGecko,
    isSamsungBrowser as isSamsungInternet,
    isMsBrowser as isTrident,
    isAppleBased as isWebKit,
    initCollector as load,
    collectData as loadSources,
    hashFunc as murmurX64Hash128,
    delayLoad as prepareForSources,
    deviceTraits as sources,
    wrapResult as transformSource,
    useFrame as withIframe
};
