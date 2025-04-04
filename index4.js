import { __awaiter as asyncHelper, __generator as generatorHelper, __spreadArray as arraySpread, __assign as objectAssign } from "/npm/tslib@2.8.1/+esm";

const VERSION = "4.6.1";

function delay(ms, value) {
    return new Promise((resolve) => setTimeout(resolve, ms, value));
}

function isPromise(value) {
    return !!value && typeof value.then === "function";
}

function executeSafely(func, callback) {
    try {
        const result = func();
        if (isPromise(result)) {
            result.then(
                (value) => callback(true, value),
                (error) => callback(false, error)
            );
        } else {
            callback(true, result);
        }
    } catch (error) {
        callback(false, error);
    }
}

function processArray(items, processor, chunkSize = 16) {
    return asyncHelper(this, void 0, void 0, function* () {
        const results = Array(items.length);
        let lastTime = Date.now();
        for (let i = 0; i < items.length; i++) {
            results[i] = processor(items[i], i);
            const currentTime = Date.now();
            if (currentTime >= lastTime + chunkSize) {
                lastTime = currentTime;
                yield new Promise((resolve) => {
                    const channel = new MessageChannel();
                    channel.port1.onmessage = () => resolve();
                    channel.port2.postMessage(null);
                });
            }
        }
        return results;
    });
}

function suppressErrors(promise) {
    return promise.then(void 0, () => {});
}

function parseInteger(value) {
    return parseInt(value);
}

function parseDecimal(value) {
    return parseFloat(value);
}

function handleNaN(value, defaultValue) {
    return typeof value === "number" && isNaN(value) ? defaultValue : value;
}

function countTruthy(values) {
    return values.reduce((sum, value) => sum + (value ? 1 : 0), 0);
}

function roundToPrecision(number, precision = 1) {
    if (Math.abs(precision) >= 1) {
        return Math.round(number / precision) * precision;
    }
    const factor = 1 / precision;
    return Math.round(number * factor) / factor;
}

// Bit manipulation functions
function add64(target, source) {
    let high1 = target[0] >>> 16, low1 = target[0] & 0xFFFF;
    let high2 = target[1] >>> 16, low2 = target[1] & 0xFFFF;
    let high3 = source[0] >>> 16, low3 = source[0] & 0xFFFF;
    let high4 = source[1] >>> 16, low4 = source[1] & 0xFFFF;
    
    let carry1 = 0, carry2 = 0, carry3 = 0, resultLow = 0;
    carry1 = (resultLow = low2 + low4) >>> 16;
    resultLow &= 0xFFFF;
    carry2 = (carry1 += high2 + high4) >>> 16;
    carry1 &= 0xFFFF;
    carry3 = (carry2 += low1 + low3) >>> 16;
    carry2 &= 0xFFFF;
    carry3 += high1 + high3;
    carry3 &= 0xFFFF;
    
    target[0] = (carry3 << 16) | carry2;
    target[1] = (carry1 << 16) | resultLow;
}

function multiply64(target, source) {
    let high1 = target[0] >>> 16, low1 = target[0] & 0xFFFF;
    let high2 = target[1] >>> 16, low2 = target[1] & 0xFFFF;
    let high3 = source[0] >>> 16, low3 = source[0] & 0xFFFF;
    let high4 = source[1] >>> 16, low4 = source[1] & 0xFFFF;
    
    let carry1 = 0, carry2 = 0, carry3 = 0, resultLow = 0;
    carry1 = (resultLow = low2 * low4) >>> 16;
    resultLow &= 0xFFFF;
    carry2 = (carry1 += high2 * low4) >>> 16;
    carry1 &= 0xFFFF;
    carry2 += (carry1 += low2 * high4) >>> 16;
    carry1 &= 0xFFFF;
    carry3 = (carry2 += low1 * low4) >>> 16;
    carry2 &= 0xFFFF;
    carry3 += (carry2 += high2 * high4) >>> 16;
    carry2 &= 0xFFFF;
    carry3 += (carry2 += low2 * low3) >>> 16;
    carry2 &= 0xFFFF;
    carry3 += high1 * low4 + low1 * high4 + high2 * low3 + low2 * high3;
    carry3 &= 0xFFFF;
    
    target[0] = (carry3 << 16) | carry2;
    target[1] = (carry1 << 16) | resultLow;
}

function shiftLeft64(value, amount) {
    amount %= 64;
    if (amount === 32) {
        value[0] = value[1];
        value[1] = 0;
    } else if (amount < 32) {
        value[0] = (value[0] << amount) | (value[1] >>> (32 - amount));
        value[1] = value[1] << amount;
    } else {
        amount -= 32;
        value[0] = value[1] << amount;
        value[1] = 0;
    }
}

function shiftRight64(value, amount) {
    amount %= 64;
    if (amount !== 0) {
        if (amount < 32) {
            value[0] = value[1] >>> (32 - amount);
            value[1] = value[1] << amount;
        } else {
            value[0] = value[1] << (amount - 32);
            value[1] = 0;
        }
    }
}

function xor64(target, source) {
    target[0] ^= source[0];
    target[1] ^= source[1];
}

const CONST_A = [0xFF51AFD7, 0xED558CCD];
const CONST_B = [0xC4CEB9FE, 0x1A85EC53];

function transform64(value) {
    const temp = [0, value[0] >>> 1];
    xor64(value, temp);
    multiply64(value, CONST_A);
    temp[1] = value[0] >>> 1;
    xor64(value, temp);
    multiply64(value, CONST_B);
    temp[1] = value[0] >>> 1;
    xor64(value, temp);
}

const CONST_C = [0x87C37B91, 0x114253D5];
const CONST_D = [0x4CF5AD43, 0x2745937F];
const CONST_E = [0, 5];
const CONST_F = [0, 0x5268E236];
const CONST_G = [0, 0x383FBFDD];

function generateHash(input, seed = 0) {
    const bytes = encodeString(input);
    const lengthPair = [0, bytes.length];
    const remainder = lengthPair[1] % 16;
    const mainLength = lengthPair[1] - remainder;
    
    let stateA = [0, seed];
    let stateB = [0, seed];
    let tempA = [0, 0];
    let tempB = [0, 0];
    
    for (let i = 0; i < mainLength; i += 16) {
        tempA[0] = bytes[i + 4] | (bytes[i + 5] << 8) | (bytes[i + 6] << 16) | (bytes[i + 7] << 24);
        tempA[1] = bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24);
        tempB[0] = bytes[i + 12] | (bytes[i + 13] << 8) | (bytes[i + 14] << 16) | (bytes[i + 15] << 24);
        tempB[1] = bytes[i + 8] | (bytes[i + 9] << 8) | (bytes[i + 10] << 16) | (bytes[i + 11] << 24);
        
        multiply64(tempA, CONST_C);
        shiftLeft64(tempA, 31);
        multiply64(tempA, CONST_D);
        xor64(stateA, tempA);
        shiftLeft64(stateA, 27);
        add64(stateA, stateB);
        multiply64(stateA, CONST_E);
        add64(stateA, CONST_F);
        
        multiply64(tempB, CONST_D);
        shiftLeft64(tempB, 33);
        multiply64(tempB, CONST_C);
        xor64(stateB, tempB);
        shiftLeft64(stateB, 31);
        add64(stateB, stateA);
        multiply64(stateB, CONST_E);
        add64(stateB, CONST_G);
    }
    
    tempA[0] = tempA[1] = tempB[0] = tempB[1] = 0;
    const tempC = [0, 0];
    
    switch (remainder) {
        case 15: tempC[1] = bytes[i + 14]; shiftRight64(tempC, 48); xor64(tempB, tempC);
        case 14: tempC[1] = bytes[i + 13]; shiftRight64(tempC, 40); xor64(tempB, tempC);
        case 13: tempC[1] = bytes[i + 12]; shiftRight64(tempC, 32); xor64(tempB, tempC);
        case 12: tempC[1] = bytes[i + 11]; shiftRight64(tempC, 24); xor64(tempB, tempC);
        case 11: tempC[1] = bytes[i + 10]; shiftRight64(tempC, 16); xor64(tempB, tempC);
        case 10: tempC[1] = bytes[i + 9]; shiftRight64(tempC, 8); xor64(tempB, tempC);
        case 9: tempC[1] = bytes[i + 8]; xor64(tempB, tempC);
            multiply64(tempB, CONST_D);
            shiftLeft64(tempB, 33);
            multiply64(tempB, CONST_C);
            xor64(stateB, tempB);
        case 8: tempC[1] = bytes[i + 7]; shiftRight64(tempC, 56); xor64(tempA, tempC);
        case 7: tempC[1] = bytes[i + 6]; shiftRight64(tempC, 48); xor64(tempA, tempC);
        case 6: tempC[1] = bytes[i + 5]; shiftRight64(tempC, 40); xor64(tempA, tempC);
        case 5: tempC[1] = bytes[i + 4]; shiftRight64(tempC, 32); xor64(tempA, tempC);
        case 4: tempC[1] = bytes[i + 3]; shiftRight64(tempC, 24); xor64(tempA, tempC);
        case 3: tempC[1] = bytes[i + 2]; shiftRight64(tempC, 16); xor64(tempA, tempC);
        case 2: tempC[1] = bytes[i + 1]; shiftRight64(tempC, 8); xor64(tempA, tempC);
        case 1: tempC[1] = bytes[i]; xor64(tempA, tempC);
            multiply64(tempA, CONST_C);
            shiftLeft64(tempA, 31);
            multiply64(tempA, CONST_D);
            xor64(stateA, tempA);
    }
    
    xor64(stateA, lengthPair);
    xor64(stateB, lengthPair);
    add64(stateA, stateB);
    add64(stateB, stateA);
    transform64(stateA);
    transform64(stateB);
    add64(stateA, stateB);
    add64(stateB, stateA);
    
    return (
        ("00000000" + (stateA[0] >>> 0).toString(16)).slice(-8) +
        ("00000000" + (stateA[1] >>> 0).toString(16)).slice(-8) +
        ("00000000" + (stateB[0] >>> 0).toString(16)).slice(-8) +
        ("00000000" + (stateB[1] >>> 0).toString(16)).slice(-8)
    );
}

function encodeString(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

function isNotFunction(value) {
    return typeof value !== "function";
}

function collectData(sources, context, excludeKeys, chunkSize) {
    const availableKeys = Object.keys(sources).filter(key => !excludeKeys.includes(key));
    const processed = suppressErrors(
        processArray(
            availableKeys,
            key => {
                const sourceFunc = sources[key];
                return function() {
                    return suppressErrors(
                        new Promise(resolve => {
                            const startTime = Date.now();
                            executeSafely(
                                () => sourceFunc(context),
                                () => {
                                    const duration = Date.now() - startTime;
                                    resolve({ value: context, duration });
                                }
                            );
                        })
                    );
                };
            },
            chunkSize
        )
    );
    
    return asyncHelper(this, void 0, void 0, function* () {
        const results = yield processed;
        const values = yield processArray(results, item => suppressErrors(item()), chunkSize);
        const finalResults = yield Promise.all(values);
        const output = {};
        for (let i = 0; i < availableKeys.length; i++) {
            output[availableKeys[i]] = finalResults[i];
        }
        return output;
    });
}

function wrapResult(func, transformer) {
    const wrapped = value => {
        const result = func(value);
        return isPromise(result) ? result.then(transformer) : transformer(result);
    };
    return value => {
        const result = wrapped(value);
        return isPromise(result) ? result.then(transformer) : transformer(result);
    };
}

// Browser detection functions
function isTrident() {
    const win = window, nav = navigator;
    return countTruthy([
        "MSCSSMatrix" in win,
        "msSetImmediate" in win,
        "msIndexedDB" in win,
        "msMaxTouchPoints" in nav,
        "msPointerEnabled" in nav
    ]) >= 4;
}

function isEdgeHTML() {
    const win = window, nav = navigator;
    return countTruthy([
        "msWriteProfilerMark" in win,
        "MSStream" in win,
        "msLaunchUri" in nav,
        "msSaveBlob" in nav
    ]) >= 3 && !isTrident();
}

function isChromium() {
    const win = window, nav = navigator;
    return countTruthy([
        "webkitPersistentStorage" in nav,
        "webkitTemporaryStorage" in nav,
        nav.vendor?.indexOf("Google") === 0,
        "webkitResolveLocalFileSystemURL" in win,
        "BatteryManager" in win,
        "webkitMediaStream" in win,
        "webkitSpeechGrammar" in win
    ]) >= 5;
}

function isWebKit() {
    const win = window;
    return countTruthy([
        "ApplePayError" in win,
        "CSSPrimitiveValue" in win,
        "Counter" in win,
        navigator.vendor.indexOf("Apple") === 0,
        "RGBColor" in win,
        "WebKitMediaKeys" in win
    ]) >= 4;
}

function isDesktopWebKit() {
    const win = window, { HTMLElement, Document } = win;
    return countTruthy([
        "safari" in win,
        !("ongestureend" in win),
        !("TouchEvent" in win),
        !("orientation" in win),
        HTMLElement && !("autocapitalize" in HTMLElement.prototype),
        Document && "pointerLockElement" in Document.prototype
    ]) >= 4;
}

function isSpecialBrowser() {
    const win = window;
    const printFunc = win.print;
    return (
        /^function\s.*?\{\s*\[native code]\s*\}$/.test(String(printFunc)) &&
        String(win.browser) === "[object WebPageNamespace]"
    );
}

function isGecko() {
    const win = window, nav = navigator;
    const style = document.documentElement?.style || {};
    return countTruthy([
        "buildID" in nav,
        "MozAppearance" in style,
        "onmozfullscreenchange" in win,
        "mozInnerScreenX" in win,
        "CSSMozDocumentRule" in win,
        "CanvasCaptureMediaStream" in win
    ]) >= 4;
}

function isModernBrowser() {
    const win = window, nav = navigator, { CSS, HTMLButtonElement } = win;
    return countTruthy([
        !("getStorageUpdates" in nav),
        HTMLButtonElement && "popover" in HTMLButtonElement.prototype,
        "CSSCounterStyleRule" in win,
        CSS.supports("font-size-adjust: ex-height 0.5"),
        CSS.supports("text-transform: full-width")
    ]) >= 4;
}

function getFullscreenElement() {
    const doc = document;
    return (
        doc.fullscreenElement ||
        doc.msFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.webkitFullscreenElement ||
        null
    );
}

function isAndroid() {
    const isChrome = isChromium();
    const isGeck = isGecko();
    const win = window, nav = navigator;
    const conn = "connection";
    
    return isChrome
        ? countTruthy([
            !("SharedWorker" in win),
            nav[conn] && "ontypechange" in nav[conn],
            !("sinkId" in new Audio())
        ]) >= 2
        : isGeck && countTruthy([
            "onorientationchange" in win,
            "orientation" in win,
            /android/i.test(nav.appVersion)
        ]) >= 2;
}

function isSamsungInternet() {
    const nav = navigator, win = window;
    const AudioProto = Audio.prototype;
    const viewport = win.visualViewport;
    return countTruthy([
        "srLatency" in AudioProto,
        "srChannelCount" in AudioProto,
        "devicePosture" in nav,
        viewport && "segments" in viewport,
        "getTextInformation" in Image.prototype
    ]) >= 3;
}

function getAudioCharacteristics() {
    if (isWebKit() && isModernBrowser() && isSpecialBrowser()) return -4;
    if (isChromium() && isSamsungInternet()) {
        const win = window;
        const hasFeatures = countTruthy([
            "union" in Set.prototype,
            "Iterator" in win,
            win.URLPattern && "hasRegExpGroups" in win.URLPattern.prototype,
            "RGB8" in WebGLRenderingContext.prototype
        ]) >= 3;
        if (hasFeatures) return -4;
    }
    
    const AudioContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AudioContextClass) return -2;
    
    if (isWebKit() && !isDesktopWebKit() && !countTruthy([
        "DOMRectList" in window,
        "RTCPeerConnectionIceEvent" in window,
        "SVGGeometryElement" in window,
        "ontransitioncancel" in window
    ]) >= 3) return -1;
    
    const context = new AudioContextClass(1, 5000, 44100);
    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.value = 10000;
    
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;
    
    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);
    
    const [audioPromise, startRendering] = processAudio(context);
    const result = suppressErrors(audioPromise.then(
        buffer => sumAbsoluteValues(buffer.getChannelData(0).subarray(4500)),
        error => {
            if (error.name === "timeout" || error.name === "suspended") return -3;
            throw error;
        }
    ));
    
    return () => {
        startRendering();
        return result;
    };
}

function processAudio(context) {
    const maxAttempts = 3;
    const delayBetween = 500;
    const minDuration = 500;
    const maxDuration = 5000;
    let cleanup = () => {};
    
    const promise = new Promise((resolve, reject) => {
        let isStarted = false;
        let startTime = 0;
        let suspendCount = 0;
        
        context.oncomplete = event => resolve(event.renderedBuffer);
        
        const timeoutHandler = () => {
            setTimeout(() => reject(createError("timeout")), 
                Math.min(minDuration, Math.max(0, maxDuration - (Date.now() - startTime))));
        };
        
        const tryRender = () => {
            try {
                const renderPromise = context.startRendering();
                if (isPromise(renderPromise)) suppressErrors(renderPromise);
                
                switch (context.state) {
                    case "running":
                        startTime = Date.now();
                        if (isStarted) timeoutHandler();
                        break;
                    case "suspended":
                        if (!document.hidden) suspendCount++;
                        if (isStarted && suspendCount >= maxAttempts) {
                            reject(createError("suspended"));
                        } else {
                            setTimeout(tryRender, delayBetween);
                        }
                        break;
                }
            } catch (error) {
                reject(error);
            }
        };
        
        tryRender();
        cleanup = () => {
            if (!isStarted) {
                isStarted = true;
                if (startTime > 0) timeoutHandler();
            }
        };
    });
    
    return [promise, cleanup];
}

function createError(name) {
    const error = new Error(name);
    error.name = name;
    return error;
}

function sumAbsoluteValues(array) {
    return array.reduce((sum, value) => sum + Math.abs(value), 0);
}

function createIframe(executor, content, timeout = 50) {
    return asyncHelper(this, void 0, void 0, function* () {
        const doc = document;
        while (!doc.body) yield delay(timeout);
        
        const frame = doc.createElement("iframe");
        try {
            yield new Promise((resolve, reject) => {
                let isLoaded = false;
                const onLoad = () => {
                    isLoaded = true;
                    resolve();
                };
                
                frame.onload = onLoad;
                frame.onerror = error => {
                    isLoaded = true;
                    reject(error);
                };
                
                const styles = frame.style;
                styles.setProperty("display", "block", "important");
                styles.position = "absolute";
                styles.top = "0";
                styles.left = "0";
                styles.visibility = "hidden";
                
                if (content && "srcdoc" in frame) {
                    frame.srcdoc = content;
                } else {
                    frame.src = "about:blank";
                }
                
                doc.body.appendChild(frame);
                
                const checkReady = () => {
                    if (isLoaded) return;
                    const frameDoc = frame.contentWindow?.document;
                    if (frameDoc?.readyState === "complete") {
                        onLoad();
                    } else {
                        setTimeout(checkReady, 10);
                    }
                };
                checkReady();
            });
            
            while (!frame.contentWindow?.document.body) yield delay(timeout);
            
            return yield executor(frame, frame.contentWindow);
        } finally {
            frame.parentNode?.removeChild(frame);
        }
    });
}

function createElement(selector) {
    const [tag, attributes] = parseSelector(selector);
    const element = document.createElement(tag || "div");
    
    for (const [key, values] of Object.entries(attributes)) {
        if (key === "style") {
            applyStyles(element.style, values.join(" "));
        } else {
            element.setAttribute(key, values.join(" "));
        }
    }
    return element;
}

function parseSelector(selector) {
    const match = /^\s*([a-z-]*)(.*)$/i.exec(selector);
    const tag = match[1];
    const attributes = {};
    
    const attrRegex = /([.:#][\w-]+|\[.+?\])/gi;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(match[2]))) {
        const token = attrMatch[0];
        switch (token[0]) {
            case ".":
                attributes.class = attributes.class || [];
                attributes.class.push(token.slice(1));
                break;
            case "#":
                attributes.id = attributes.id || [];
                attributes.id.push(token.slice(1));
                break;
            case "[":
                const attrMatch = /^\[([\w-]+)([~|^$*]?=("(.*?)"|([\w-]+)))?(\s+[is])?\]$/.exec(token);
                if (!attrMatch) throw new Error(`Invalid attribute syntax: ${token}`);
                const value = attrMatch[4] || attrMatch[5] || "";
                attributes[attrMatch[1]] = attributes[attrMatch[1]] || [];
                attributes[attrMatch[1]].push(value);
                break;
        }
    }
    return [tag, attributes];
}

function applyStyles(styleObj, styleString) {
    for (const rule of styleString.split(";")) {
        const match = /^\s*([\w-]+)\s*:\s*(.+?)(\s*!([\w-]+))?\s*$/.exec(rule);
        if (match) {
            styleObj.setProperty(match[1], match[2], match[4] || "");
        }
    }
}

const FONT_TYPES = ["monospace", "sans-serif", "serif"];
const FONT_LIST = [
    "sans-serif-thin", "ARNO PRO", "Agency FB", "Arabic Typesetting",
    "Arial Unicode MS", "AvantGarde Bk BT", "BankGothic Md BT", "Batang",
    "Bitstream Vera Sans Mono", "Calibri", "Century", "Century Gothic",
    "Clarendon", "EUROSTILE", "Franklin Gothic", "Futura Bk BT",
    "Futura Md BT", "GOTHAM", "Gill Sans", "HELV", "Haettenschweiler",
    "Helvetica Neue", "Humanst521 BT", "Leelawadee", "Letter Gothic",
    "Levenim MT", "Lucida Bright", "Lucida Sans", "Menlo", "MS Mincho",
    "MS Outlook", "MS Reference Specialty", "MS UI Gothic", "MT Extra",
    "MYRIAD PRO", "Marlett", "Meiryo UI", "Microsoft Uighur", "Minion Pro",
    "Monotype Corsiva", "PMingLiU", "Pristina", "SCRIPTINA",
    "Segoe UI Light", "Serifa", "SimHei", "Small Fonts", "Staccato222 BT",
    "TRAJAN PRO", "Univers CE 55 Medium", "Vrinda", "ZWAdobeF"
];

function getCanvasData(skipTest = false) {
    const [canvas, context] = createCanvas();
    if (!canvas.toDataURL || !context) return { winding: false, geometry: "unsupported", text: "unsupported" };
    
    const winding = context.isPointInPath ? testWinding(context) : false;
    if (skipTest) return { winding, geometry: "skipped", text: "skipped" };
    
    const [geometry, text] = drawCanvas(canvas, context);
    return { winding, geometry, text };
}

function createCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return [canvas, canvas.getContext("2d")];
}

function testWinding(context) {
    context.rect(0, 0, 10, 10);
    context.rect(2, 2, 6, 6);
    return !context.isPointInPath(5, 5, "evenodd");
}

function drawCanvas(canvas, context) {
    canvas.width = 240;
    canvas.height = 60;
    context.textBaseline = "alphabetic";
    context.fillStyle = "#f60";
    context.fillRect(100, 1, 62, 20);
    context.fillStyle = "#069";
    context.font = '11pt "Times New Roman"';
    const text = "Cwm fjordbank gly " + String.fromCharCode(55357, 56835);
    context.fillText(text, 2, 15);
    context.fillStyle = "rgba(102, 204, 0, 0.2)";
    context.font = "18pt Arial";
    context.fillText(text, 4, 45);
    
    const textHash = getCanvasHash(canvas);
    const textHash2 = getCanvasHash(canvas);
    if (textHash !== textHash2) return ["unstable", "unstable"];
    
    canvas.width = 122;
    canvas.height = 110;
    context.globalCompositeOperation = "multiply";
    for (const [color, x, y] of [["#f2f", 40, 40], ["#2ff", 80, 40], ["#ff2", 60, 80]]) {
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, 40, 0, 2 * Math.PI, true);
        context.closePath();
        context.fill();
    }
    context.fillStyle = "#f9c";
    context.arc(60, 60, 60, 0, 2 * Math.PI, true);
    context.arc(60, 60, 20, 0, 2 * Math.PI, true);
    context.fill("evenodd");
    
    return [getCanvasHash(canvas), textHash];
}

function getCanvasHash(canvas) {
    return canvas.toDataURL();
}

function getScreenDimensions() {
    const screenInfo = screen;
    const dimensions = [
        handleNaN(parseInteger(screenInfo.width), null),
        handleNaN(parseInteger(screenInfo.height), null)
    ];
    return dimensions.sort().reverse();
}

let cachedFrame, frameTimeout;

function initScreenFrame() {
    return function() {
        if (frameTimeout === undefined) {
            const checkFrame = () => {
                const frame = getFrameData();
                if (isFrameEmpty(frame)) {
                    frameTimeout = setTimeout(checkFrame, 2500);
                } else {
                    cachedFrame = frame;
                    frameTimeout = undefined;
                }
            };
            checkFrame();
        }
        
        return asyncHelper(this, void 0, void 0, function* () {
            let frame = getFrameData();
            if (isFrameEmpty(frame)) {
                if (cachedFrame) return arraySpread([], cachedFrame, true);
                if (getFullscreenElement()) {
                    const doc = document;
                    const exit = doc.exitFullscreen || doc.msExitFullscreen || 
                               doc.mozCancelFullScreen || doc.webkitExitFullscreen;
                    yield exit.call(doc);
                    frame = getFrameData();
                }
            }
            if (!isFrameEmpty(frame)) cachedFrame = frame;
            return frame;
        });
    };
}

function getFrameData() {
    const s = screen;
    return [
        handleNaN(parseDecimal(s.availTop), null),
        handleNaN(parseDecimal(s.width) - parseDecimal(s.availWidth) - handleNaN(parseDecimal(s.availLeft), 0), null),
        handleNaN(parseDecimal(s.height) - parseDecimal(s.availHeight) - handleNaN(parseDecimal(s.availTop), 0), null),
        handleNaN(parseDecimal(s.availLeft), null)
    ];
}

function isFrameEmpty(frame) {
    return !frame.some(value => value);
}

function checkElements(selectors) {
    return asyncHelper(this, void 0, void 0, function* () {
        const doc = document;
        while (!doc.body) yield delay(50);
        
        const container = doc.createElement("div");
        const elements = new Array(selectors.length);
        const results = {};
        styleElement(container);
        
        for (let i = 0; i < selectors.length; i++) {
            const element = createElement(selectors[i]);
            if (element.tagName === "DIALOG") element.show();
            const wrapper = doc.createElement("div");
            styleElement(wrapper);
            wrapper.appendChild(element);
            container.appendChild(wrapper);
            elements[i] = element;
        }
        
        doc.body.appendChild(container);
        try {
            for (let i = 0; i < selectors.length; i++) {
                if (!elements[i].offsetParent) {
                    results[selectors[i]] = true;
                }
            }
        } finally {
            container.parentNode?.removeChild(container);
        }
        return results;
    });
}

function styleElement(element) {
    element.style.setProperty("visibility", "hidden", "important");
    element.style.setProperty("display", "block", "important");
}

function checkMediaQuery(query, value) {
    return matchMedia(`(${query}: ${value})`).matches;
}

const MATH_LIB = Math;
const NO_OP = () => 0;

const FONT_CONFIG = {
    default: [],
    apple: [{ font: "-apple-system-body" }],
    serif: [{ fontFamily: "serif" }],
    sans: [{ fontFamily: "sans-serif" }],
    mono: [{ fontFamily: "monospace" }],
    min: [{ fontSize: "1px" }],
    system: [{ fontFamily: "system-ui" }]
};

function isCrossOrigin() {
    let current = window;
    while (true) {
        const parentWin = current.parent;
        if (!parentWin || parentWin === current) return false;
        try {
            if (parentWin.location.origin !== current.location.origin) return true;
        } catch (error) {
            if (error instanceof Error && error.name === "SecurityError") return true;
            throw error;
        }
        current = parentWin;
    }
}

const GL_PARAMS = new Set([
    10752, 2849, 2884, 2885, 2886, 2928, 2929, 2930, 2931, 2932,
    2960, 2961, 2962, 2963, 2964, 2965, 2966, 2967, 2968, 2978,
    3024, 3042, 3088, 3089, 3106, 3107, 32773, 32777, 32823, 32824,
    32936, 32937, 32938, 32939, 32968, 32969, 32970, 32971, 3317,
    33170, 3333, 3379, 3386, 33901, 33902, 34016, 34024, 34076,
    3408, 3410, 3411, 3412, 3413, 3414, 3415, 34467, 34816, 34817,
    34818, 34819, 34877, 34921, 34930, 35660, 35661, 35724, 35738,
    35739, 36003, 36004, 36005, 36347, 36348, 36349, 37440, 37441,
    37443, 7936, 7937, 7938
]);

const GL_EXT_PARAMS = new Set([
    34047, 35723, 36063, 34852, 34853, 34854, 34229, 36392, 36795, 38449
]);

const SHADER_TYPES = ["FRAGMENT_SHADER", "VERTEX_SHADER"];
const PRECISION_TYPES = ["LOW_FLOAT", "MEDIUM_FLOAT", "HIGH_FLOAT", "LOW_INT", "MEDIUM_INT", "HIGH_INT"];
const GL_DEBUG = "WEBGL_debug_renderer_info";

function getGLContext(cache) {
    if (cache.webgl) return cache.webgl.context;
    
    const canvas = document.createElement("canvas");
    let context;
    canvas.addEventListener("webglCreateContextError", () => context = undefined);
    
    for (const type of ["webgl", "experimental-webgl"]) {
        try {
            context = canvas.getContext(type);
        } catch (e) {}
        if (context) break;
    }
    
    cache.webgl = { context };
    return context;
}

function getShaderPrecision(gl, shaderType, precisionType) {
    const precision = gl.getShaderPrecisionFormat(gl[shaderType], gl[precisionType]);
    return precision ? [precision.rangeMin, precision.rangeMax, precision.precision] : [];
}

function getGLProperties(gl) {
    return Object.keys(gl.__proto__).filter(prop => typeof prop === "string" && !/[^A-Z0-9_x]/.test(prop));
}

const DEVICE_PROFILER = {
    textStyles: function() {
        return createIframe((frame, win) => {
            return asyncHelper(this, void 0, void 0, function* () {
                const doc = win.document;
                const body = doc.body;
                body.style.fontSize = "48px";
                
                const container = doc.createElement("div");
                container.style.setProperty("visibility", "hidden", "important");
                
                const baseWidths = {};
                const baseHeights = {};
                const fontMap = {};
                
                const createSpan = font => {
                    const span = doc.createElement("span");
                    const style = span.style;
                    style.position = "absolute";
                    style.top = "0";
                    style.left = "0";
                    style.fontFamily = font;
                    span.textContent = "mmMwWLliI0O&1";
                    container.appendChild(span);
                    return span;
                };
                
                const createFontTest = () => {
                    const result = {};
                    for (const font of FONT_LIST) {
                        result[font] = FONT_TYPES.map(type => createSpan(`'${font}',${type}`));
                    }
                    return result;
                };
                
                const hasVariation = spans => {
                    return FONT_TYPES.some((type, i) => 
                        spans[i].offsetWidth !== baseWidths[type] || 
                        spans[i].offsetHeight !== baseHeights[type]
                    );
                };
                
                const baseSpans = FONT_TYPES.map(createSpan);
                const fontTests = createFontTest();
                body.appendChild(container);
                
                FONT_TYPES.forEach((type, i) => {
                    baseWidths[type] = baseSpans[i].offsetWidth;
                    baseHeights[type] = baseSpans[i].offsetHeight;
                });
                
                return FONT_LIST.filter(font => hasVariation(fontTests[font]));
            });
        });
    },
    
    elementBlockers: function({ debug } = {}) {
        return asyncHelper(this, void 0, void 0, function* () {
            if (!isWebKit() && !isAndroid()) return;
            
            const blockers = {
                // Simplified example - original had many more
                basic: [".ad-banner", "#popup-ad", ".overlay-ad"],
                social: [".share-button", "#follow-us", ".social-widget"]
            };
            
            const allSelectors = Object.values(blockers).flat();
            const results = yield checkElements(allSelectors);
            
            if (debug) {
                console.log("Element blockers debug:", results);
            }
            
            return Object.keys(blockers)
                .filter(key => {
                    const selectors = blockers[key];
                    const blockedCount = selectors.filter(sel => results[sel]).length;
                    return blockedCount > 0.6 * selectors.length;
                })
                .sort();
        });
    },
    
    fontMetrics: function() {
        return function(width = 4000) {
            return createIframe((frame, win) => {
                const doc = win.document;
                const body = doc.body;
                body.style.width = `${width}px`;
                body.style.textSizeAdjust = body.style.webkitTextSizeAdjust = "none";
                
                if (isChromium()) {
                    body.style.zoom = `${1 / win.devicePixelRatio}`;
                } else if (isWebKit()) {
                    body.style.zoom = "reset";
                }
                
                const textDiv = doc.createElement("div");
                textDiv.textContent = arraySpread([], Array(width / 20 | 0), true)
                    .map(() => "word")
                    .join(" ");
                body.appendChild(textDiv);
                
                const metrics = {};
                for (const [group, config] of Object.entries(FONT_CONFIG)) {
                    const [style = {}, text = "mmMwWLliI0fiflO&1"] = config;
                    const span = doc.createElement("span");
                    span.textContent = text;
                    span.style.whiteSpace = "nowrap";
                    Object.entries(style).forEach(([key, value]) => span.style[key] = value);
                    body.append(doc.createElement("br"), span);
                    metrics[group] = span.getBoundingClientRect().width;
                }
                
                return metrics;
            }, '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">');
        };
    },
    
    audioProfile: getAudioCharacteristics,
    screenEdges: function() {
        if (isWebKit() && isModernBrowser() && isSpecialBrowser()) {
            return () => Promise.resolve(undefined);
        }
        const frameGetter = initScreenFrame();
        return asyncHelper(this, void 0, void 0, function* () {
            const frame = yield frameGetter();
            return frame.map(value => value === null ? null : roundToPrecision(value, 10));
        });
    },
    
    canvasProfile: () => getCanvasData(isWebKit() && isModernBrowser() && isSpecialBrowser()),
    cpuInfo: () => navigator.oscpu,
    languagePrefs: () => {
        const nav = navigator;
        const langs = [];
        const primary = nav.language || nav.userLanguage || nav.browserLanguage || nav.systemLanguage;
        if (primary) langs.push([primary]);
        
        if (Array.isArray(nav.languages)) {
            if (!(isChromium() && countTruthy([
                !("MediaSettingsRange" in window),
                "RTCEncodedAudioFrame" in window,
                String(window.Intl) === "[object Intl]",
                String(window.Reflect) === "[object Reflect]"
            ]) >= 3)) {
                langs.push(nav.languages);
            }
        } else if (typeof nav.languages === "string" && nav.languages) {
            langs.push(nav.languages.split(","));
        }
        return langs;
    },
    
    colorBits: () => window.screen.colorDepth,
    memorySize: () => handleNaN(parseDecimal(navigator.deviceMemory), undefined),
    screenSize: () => isWebKit() && isModernBrowser() && isSpecialBrowser() ? undefined : getScreenDimensions(),
    coreCount: () => handleNaN(parseInteger(navigator.hardwareConcurrency), undefined),
    timeZone: () => {
        const Intl = window.Intl;
        const timeFormat = Intl?.DateTimeFormat;
        if (timeFormat) {
            const zone = new timeFormat().resolvedOptions().timeZone;
            if (zone) return zone;
        }
        const year = new Date().getFullYear();
        const offset = -Math.max(
            parseDecimal(new Date(year, 0, 1).getTimezoneOffset()),
            parseDecimal(new Date(year, 6, 1).getTimezoneOffset())
        );
        return `UTC${offset >= 0 ? "+" : ""}${offset}`;
    },
    
    hasSession: () => { try { return !!window.sessionStorage; } catch { return true; } },
    hasLocal: () => { try { return !!window.localStorage; } catch { return true; } },
    hasIndexedDB: () => !isTrident() && !isEdgeHTML() && (window.indexedDB || true),
    hasDatabase: () => !!window.openDatabase,
    cpuType: () => navigator.cpuClass,
    platformType: () => {
        const platform = navigator.platform;
        if (platform === "MacIntel" && isWebKit() && !isDesktopWebKit()) {
            if (navigator.platform === "iPad") return "iPad";
            const ratio = screen.width / screen.height;
            return countTruthy([
                "MediaSource" in window,
                !!Element.prototype.webkitRequestFullscreen,
                ratio > 0.65 && ratio < 1.53
            ]) >= 2 ? "iPad" : "iPhone";
        }
        return platform;
    },
    
    pluginList: () => {
        const plugins = navigator.plugins;
        if (!plugins) return;
        return Array.from(plugins).map(plugin => ({
            name: plugin.name,
            description: plugin.description,
            mimeTypes: Array.from(plugin).map(mime => ({
                type: mime.type,
                suffixes: mime.suffixes
            }))
        }));
    },
    
    touchInfo: () => {
        const nav = navigator;
        let maxPoints = 0;
        if (nav.maxTouchPoints !== undefined) {
            maxPoints = parseInteger(nav.maxTouchPoints);
        } else if (nav.msMaxTouchPoints !== undefined) {
            maxPoints = nav.msMaxTouchPoints;
        }
        let hasTouchEvent;
        try {
            document.createEvent("TouchEvent");
            hasTouchEvent = true;
        } catch {
            hasTouchEvent = false;
        }
        return {
            maxTouchPoints: maxPoints,
            touchEvent: hasTouchEvent,
            touchStart: "ontouchstart" in window
        };
    },
    
    vendorName: () => navigator.vendor || "",
    vendorTypes: () => {
        const types = [];
        const vendorKeys = [
            "chrome", "safari", "__crWeb", "__gCrWeb", "yandex", "__yb",
            "__ybro", "__firefox__", "__edgeTrackingPreventionStatistics",
            "webkit", "oprt", "samsungAr", "ucweb", "UCShellJava", "puffinDevice"
        ];
        for (const key of vendorKeys) {
            const obj = window[key];
            if (obj && typeof obj === "object") types.push(key);
        }
        return types.sort();
    },
    
    cookieSupport: () => {
        const doc = document;
        try {
            doc.cookie = "cookietest=1; SameSite=Strict;";
            const supported = doc.cookie.indexOf("cookietest=") !== -1;
            doc.cookie = "cookietest=1; SameSite=Strict; expires=Thu, 01-Jan-1970 00:00:01 GMT";
            return supported;
        } catch {
            return false;
        }
    },
    
    colorRange: () => {
        for (const gamut of ["rec2020", "p3", "srgb"]) {
            if (checkMediaQuery("color-gamut", gamut)) return gamut;
        }
    },
    
    isInverted: () => checkMediaQuery("inverted-colors", "inverted") || 
                     (!checkMediaQuery("inverted-colors", "none") && undefined),
    isForcedColors: () => checkMediaQuery("forced-colors", "active") || 
                         (!checkMediaQuery("forced-colors", "none") && undefined),
    monochromeDepth: () => {
        if (!checkMediaQuery("min-monochrome", "0")) return;
        for (let i = 0; i <= 100; i++) {
            if (checkMediaQuery("max-monochrome", i)) return i;
        }
        throw new Error("Too high value");
    },
    
    contrastLevel: () => {
        if (checkMediaQuery("prefers-contrast", "no-preference")) return 0;
        if (checkMediaQuery("prefers-contrast", "high") || checkMediaQuery("prefers-contrast", "more")) return 1;
        if (checkMediaQuery("prefers-contrast", "low") || checkMediaQuery("prefers-contrast", "less")) return -1;
        if (checkMediaQuery("prefers-contrast", "forced")) return 10;
    },
    
    prefersReducedMotion: () => checkMediaQuery("prefers-reduced-motion", "reduce") || 
                              (!checkMediaQuery("prefers-reduced-motion", "no-preference") && undefined),
    prefersReducedTransparency: () => checkMediaQuery("prefers-reduced-transparency", "reduce") || 
                                    (!checkMediaQuery("prefers-reduced-transparency", "no-preference") && undefined),
    isHDR: () => checkMediaQuery("dynamic-range", "high") || 
                (!checkMediaQuery("dynamic-range", "standard") && undefined),
    
    mathValues: () => {
        const acos = MATH_LIB.acos || NO_OP;
        const acosh = MATH_LIB.acosh || NO_OP;
        const asin = MATH_LIB.asin || NO_OP;
        const asinh = MATH_LIB.asinh || NO_OP;
        const atanh = MATH_LIB.atanh || NO_OP;
        const atan = MATH_LIB.atan || NO_OP;
        const sin = MATH_LIB.sin || NO_OP;
        const sinh = MATH_LIB.sinh || NO_OP;
        const cos = MATH_LIB.cos || NO_OP;
        const cosh = MATH_LIB.cosh || NO_OP;
        const tan = MATH_LIB.tan || NO_OP;
        const tanh = MATH_LIB.tanh || NO_OP;
        const exp = MATH_LIB.exp || NO_OP;
        const expm1 = MATH_LIB.expm1 || NO_OP;
        const log1p = MATH_LIB.log1p || NO_OP;
        
        return {
            acos: acos(0.12312423423423424),
            acosh: acosh(1e308),
            acoshPf: MATH_LIB.log(1e154 + MATH_LIB.sqrt(1e154 * 1e154 - 1)),
            asin: asin(0.12312423423423424),
            asinh: asinh(1),
            asinhPf: MATH_LIB.log(1 + MATH_LIB.sqrt(2)),
            atanh: atanh(0.5),
            atanhPf: MATH_LIB.log(1.5 / 0.5) / 2,
            atan: atan(0.5),
            sin: sin(-1e300),
            sinh: sinh(1),
            sinhPf: (exp(1) - 1 / exp(1)) / 2,
            cos: cos(10.000000000123),
            cosh: cosh(1),
            coshPf: (exp(1) + 1 / exp(1)) / 2,
            tan: tan(-1e300),
            tanh: tanh(1),
            tanhPf: (exp(2) - 1) / (exp(2) + 1),
            exp: exp(1),
            expm1: expm1(1),
            expm1Pf: exp(1) - 1,
            log1p: log1p(10),
            log1pPf: MATH_LIB.log(11),
            powPI: n => MATH_LIB.pow(Math.PI, n)(-100)
        };
    },
    
    pdfSupport: () => navigator.pdfViewerEnabled,
    cpuArchitecture: () => {
        const floatArray = new Float32Array(1);
        const byteArray = new Uint8Array(floatArray.buffer);
        floatArray[0] = Infinity;
        floatArray[0] = floatArray[0] - floatArray[0];
        return byteArray[3];
    },
    
    applePaySupport: () => {
        const ApplePay = window.ApplePaySession;
        if (typeof ApplePay?.canMakePayments !== "function") return -1;
        if (isCrossOrigin()) return -3;
        try {
            return ApplePay.canMakePayments() ? 1 : 0;
        } catch (error) {
            if (error instanceof Error && error.name === "InvalidAccessError" && 
                /\bfrom\b.*\binsecure\b/i.test(error.message)) return -2;
            throw error;
        }
    },
    
    clickTracking: () => {
        const link = document.createElement("a");
        const attr = link.attributionSourceId ?? link.attributionsourceid;
        return attr === undefined ? undefined : String(attr);
    },
    
    audioLatency: () => {
        if (isAndroid() || isWebKit()) {
            const context = window.AudioContext && new AudioContext();
            return context?.baseLatency ?? -1;
        }
        return -2;
    },
    
    dateLocale: () => {
        if (!window.Intl) return -1;
        const DateTime = window.Intl.DateTimeFormat;
        if (!DateTime) return -2;
        const locale = new DateTime().resolvedOptions().locale;
        return locale || locale === "" ? locale : -3;
    },
    
    glBasicInfo: ({ cache }) => {
        const gl = getGLContext(cache);
        if (!gl) return -1;
        if (typeof gl.getParameter !== "function") return -2;
        
        const debugExt = isGecko() ? null : gl.getExtension(GL_DEBUG);
        return {
            version: gl.getParameter(gl.VERSION)?.toString() || "",
            vendor: gl.getParameter(gl.VENDOR)?.toString() || "",
            vendorUnmasked: debugExt?.getParameter(gl.UNMASKED_VENDOR_WEBGL)?.toString() || "",
            renderer: gl.getParameter(gl.RENDERER)?.toString() || "",
            rendererUnmasked: debugExt?.getParameter(gl.UNMASKED_RENDERER_WEBGL)?.toString() || "",
            shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)?.toString() || ""
        };
    },
    
    glExtendedInfo: ({ cache }) => {
        const gl = getGLContext(cache);
        if (!gl) return -1;
        if (typeof gl.getParameter !== "function") return -2;
        
        const extensions = gl.getSupportedExtensions();
        const attributes = gl.getContextAttributes();
        const unsupported = [];
        const extParams = [];
        const params = [];
        const precisions = [];
        const attrList = [];
        
        if (attributes) {
            for (const [key, value] of Object.entries(attributes)) {
                attrList.push(`${key}=${value}`);
            }
        }
        
        for (const prop of getGLProperties(gl)) {
            const value = gl[prop];
            const extra = GL_PARAMS.has(value) ? `=${gl.getParameter(value)}` : "";
            params.push(`${prop}=${value}${extra}`);
        }
        
        if (extensions) {
            for (const ext of extensions) {
                if (ext === GL_DEBUG && isGecko() || ext === "WEBGL_polygon_mode" && (isChromium() || isWebKit())) {
                    continue;
                }
                const extObj = gl.getExtension(ext);
                if (extObj) {
                    for (const prop of getGLProperties(extObj)) {
                        const value = extObj[prop];
                        const extra = GL_EXT_PARAMS.has(value) ? `=${gl.getParameter(value)}` : "";
                        extParams.push(`${prop}=${value}${extra}`);
                    }
                } else {
                    unsupported.push(ext);
                }
            }
        }
        
        for (const shader of SHADER_TYPES) {
            for (const precision of PRECISION_TYPES) {
                const values = getShaderPrecision(gl, shader, precision);
                precisions.push(`${shader}.${precision}=${values.join(",")}`);
            }
        }
        
        extParams.sort();
        params.sort();
        
        return {
            contextAttributes: attrList,
            parameters: params,
            shaderPrecisions: precisions,
            extensions,
            extensionParameters: extParams,
            unsupportedExtensions: unsupported
        };
    }
};

function calculateConfidence(data) {
    const baseScore = isAndroid() ? 0.4 : 
                     isWebKit() ? (!isDesktopWebKit() || (isModernBrowser() && isSpecialBrowser()) ? 0.3 : 0.5) :
                     /^Win/.test(data.platform?.value || "") ? 0.6 :
                     /^Mac/.test(data.platform?.value || "") ? 0.5 : 0.7;
    const adjustedScore = roundToPrecision(0.99 + 0.01 * baseScore, 1e-4);
    return {
        score: baseScore,
        comment: `${adjustedScore} if upgrade to Pro: https://deviceid.dev/pro`
    };
}

function serializeData(data) {
    return JSON.stringify(data, (key, value) => {
        if (value instanceof Error) {
            return objectAssign({
                name: value.name,
                message: value.message,
                stack: value.stack?.split("\n")
            }, value);
        }
        return value;
    }, 2);
}

function hashProfile(data) {
    const components = {};
    for (const [key, value] of Object.entries(data).sort()) {
        const content = "error" in value ? "error" : JSON.stringify(value.value);
        components[key] = content;
    }
    return generateHash(Object.entries(components)
        .map(([k, v]) => `${k.replace(/([:|\\])/g, "\\$1")}:${v}`)
        .join("|"));
}

function waitIdle(timeout = 50) {
    const requestIdle = window.requestIdleCallback;
    return requestIdle ?
        new Promise(resolve => requestIdle.call(window, () => resolve(), { timeout: timeout * 2 })) :
        delay(Math.min(timeout, timeout * 2));
}

function createIdentityLoader(loader, debug) {
    const startTime = Date.now();
    return {
        get: asyncHelper(this, void 0, void 0, function* () {
            const now = Date.now();
            const components = yield loader();
            const identity = {
                get visitorId() {
                    if (!this._id) this._id = hashProfile(components);
                    return this._id;
                },
                set visitorId(value) {
                    this._id = value;
                },
                confidence: calculateConfidence(components),
                components,
                version: VERSION
            };
            
            if (debug) {
                console.log(`Device Identity Data:
version: ${identity.version}
userAgent: ${navigator.userAgent}
timeBetweenLoadAndGet: ${now - startTime}
visitorId: ${identity.visitorId}
components: ${serializeData(components)}`);
            }
            
            return identity;
        })
    };
}

function initializeDeviceIdentity({ delayFallback, debug } = {}) {
    return asyncHelper(this, void 0, void 0, function* () {
        yield waitIdle(delayFallback);
        const collector = () => collectData(DEVICE_PROFILER, {}, [], undefined);
        return createIdentityLoader(collector, debug);
    });
}

export const DeviceIdentity = {
    load: initializeDeviceIdentity,
    hashComponents: hashProfile,
    componentsToDebugString: serializeData
};

export {
    serializeData as componentsToDebugString,
    getFullscreenElement,
    getAudioCharacteristics as getUnstableAudioProfile,
    getCanvasData as getUnstableCanvasProfile,
    initScreenFrame as getUnstableScreenEdges,
    getScreenDimensions as getUnstableScreenSize,
    getGLContext,
    hashProfile as hashComponents,
    isAndroid,
    isChromium,
    isDesktopWebKit,
    isEdgeHTML,
    isGecko,
    isSamsungInternet,
    isTrident,
    isWebKit,
    initializeDeviceIdentity as load,
    collectData as loadSources,
    generateHash as murmurX64Hash128,
    waitIdle as prepareForSources,
    DEVICE_PROFILER as sources,
    wrapResult as transformSource,
    createIframe as withIframe
};
