/* global atob, btoa, describe, escape, expect, global, it, unescape */

(function (global)
{
    'use strict';
    
    var Base64 =
    {
        // private property
        _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
        
        // public method for encoding
        encode:
        function (input)
        {
            var output = '';
            input += '';
            for (var i = 0; i < input.length;)
            {
                var chr1 = input.charCodeAt(i++);
                var enc1 = chr1 >> 2;
                
                var chr2 = input.charCodeAt(i++);
                var enc2 = (chr1 & 3) << 4 | chr2 >> 4;
                
                var enc3, enc4;
                if (isNaN(chr2))
                {
                    enc3 = enc4 = 64;
                }
                else
                {
                    var chr3 = input.charCodeAt(i++);
                    enc3 = (chr2 & 15) << 2 | chr3 >> 6;
                    if (isNaN(chr3))
                    {
                        enc4 = 64;
                    }
                    else
                    {
                        enc4 = chr3 & 63;
                    }
                }
                
                output +=
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            
            return output;
        },
        
        // public method for decoding
        decode:
        function (input)
        {
            var output = '';
            input += '';
            for (var i = 0; i < input.length;)
            {
                var enc1 = this._keyStr.indexOf(input.charAt(i++));
                var enc2 = this._keyStr.indexOf(input.charAt(i++));
                var chr1 = (enc1 << 2) | (enc2 >> 4);
                output += String.fromCharCode(chr1);
                
                var pos3 = input.charAt(i++);
                var enc3 = this._keyStr.indexOf(pos3);
                if (!pos3 || enc3 === 64)
                {
                    break;
                }
                var chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                output += String.fromCharCode(chr2);
                
                var pos4 = input.charAt(i++);
                var enc4 = this._keyStr.indexOf(pos4);
                if (!pos4 || enc4 === 64)
                {
                    break;
                }
                var chr3 = ((enc3 & 3) << 6) | enc4;
                output += String.fromCharCode(chr3);
            }
            
            return output;
        },
    };
    
    function createOutput(compatibilities)
    {
        function appendLengths(name, char)
        {
            result += '\n' + padRight(name, 4);
            compatibilities.forEach(
                function (compatibility)
                {
                    var content;
                    try
                    {
                        content = JScrewIt.encode(char, false, compatibility).length;
                    }
                    catch (error)
                    {
                        content = 'ERROR';
                    }
                    result += padLeft(content, 8);
                }
            );
        }
        
        function appendLengthsRange(min, max, namer)
        {
            namer = namer || function () { return '`' + String.fromCharCode(charCode) + '`'; };
            for (var charCode = min; charCode <= max; ++charCode)
            {
                var name = namer(charCode);
                var char = String.fromCharCode(charCode);
                appendLengths(name, char);
            }
        }
        
        var result = '     ';
        compatibilities.forEach(
            function (compatibility)
            {
                result += padBoth(compatibility, 8);
            }
        );
        result = result.replace(/ +$/, '');
        result += '\n    ' + Array(compatibilities.length + 1).join(' -------');
        var C0_CONTROL_CODE_NAMES =
        [
            'NUL',  'SOH',  'STX',  'ETX',  'EOT',  'ENQ',  'ACK',  'BEL',
            'BS',   'HT',   'LF',   'VT',   'FF',   'CR',   'SO',   'SI',
            'DLE',  'DC1',  'DC2',  'DC3',  'DC4',  'NAK',  'SYN',  'ETB',
            'CAN',  'EM',   'SUB',  'ESC',  'FS',   'GS',   'RS',   'US'
        ];
        appendLengthsRange(0, 31, function (charCode) { return C0_CONTROL_CODE_NAMES[charCode]; });
        appendLengthsRange(32, 126);
        appendLengths('DEL', '\x7f');
        var C1_CONTROL_CODE_NAMES =
        [
            'PAD',  'HOP',  'BPH',  'NBH',  'IND',  'NEL',  'SSA',  'ESA',
            'HTS',  'HTJ',  'VTS',  'PLD',  'PLU',  'RI',   'SS2',  'SS3',
            'DCS',  'PU1',  'PU2',  'STS',  'CCH',  'MW',   'SPA',  'EPA',
            'SOS',  'SGCI', 'SCI',  'CSI',  'ST',   'OSC',  'PM',   'APC'
        ];
        appendLengthsRange(
            128,
            159,
            function (charCode) { return C1_CONTROL_CODE_NAMES[charCode - 0x80]; }
        );
        appendLengths('NBSP', '\xa0');
        appendLengthsRange(161, 172);
        appendLengths('SHY', '\xad');
        appendLengthsRange(174, 255);
        appendLengths('`∟`', '∟');
        appendLengths('`♥`', '♥');
        return result;
    }
    
    function createWindowEmuFeature(string)
    {
        var result =
        {
            setUp: function ()
            {
                var toString = function () { return string; };
                if (!global.self)
                {
                    global.self = { };
                }
                Object.defineProperty(
                    self,
                    'toString',
                    { configurable: true, value: toString }
                );
                if (self + '' !== string)
                {
                    self.toString = toString;
                }
            },
            tearDown: function ()
            {
                if (typeof module === 'undefined')
                {
                    delete self.toString;
                }
                else
                {
                    delete global.self;
                }
            }
        };
        return result;
    }
    
    function describeEncodeTest(compatibility)
    {
        describe(
            'encodes with ' + compatibility + ' compatibility',
            function ()
            {
                var expression1 = 'return Math.log(2e18)^0';
                it(
                    JSON.stringify(expression1) + ' (with wrapWithEval)',
                    function ()
                    {
                        var encoding = JScrewIt.encode(expression1, true, compatibility);
                        expect(eval(encoding)).toBe(42);
                    }
                );
                var expression2 = 'return decodeURI(encodeURI("♠♥♦♣"))';
                it(
                    JSON.stringify(expression2) + ' (with wrapWithEval)',
                    function ()
                    {
                        var encoding = JScrewIt.encode(expression2, true, compatibility);
                        expect(eval(encoding)).toBe('♠♥♦♣');
                    }
                );
                var expression3 = 'true or false';
                it(
                    JSON.stringify(expression3),
                    function ()
                    {
                        var encoding = JScrewIt.encode(expression3, false, compatibility);
                        expect(eval(encoding)).toBe(expression3);
                        expect(encoding).toBe(
                            JScrewIt.debug.replace(
                                'true + " " + "o" + "r" + " " + false',
                                compatibility
                            )
                        );
                    }
                );
            }
        );
    }
    
    function emuIt(description, callback, emuFeatures)
    {
        it(
            description,
            function ()
            {
                try
                {
                    emuFeatures.forEach(function (feature) { featureSet[feature].setUp(); });
                    callback();
                }
                finally
                {
                    emuFeatures.forEach(function (feature) { featureSet[feature].tearDown(); });
                }
            }
        );
    }
    
    function getEmuFeatures(features)
    {
        if (features.every(function (feature) { return feature in featureSet; }))
        {
            return features.filter(function (feature) { return featureSet[feature]; });
        }
    }
    
    function init(arg)
    {
        JScrewIt = arg || global.JScrewIt;
        for (var feature in featureSet)
        {
            var condition = featureSet[feature].condition;
            if (condition && !condition())
            {
                delete featureSet[feature];
            }
        }
        JScrewIt.FEATURE_INFOS.AUTO.includes.forEach(
            function (feature)
            {
                featureSet[feature] = null;
            }
        );
    }
    
    function isExpected(expected)
    {
        var result =
            function ()
            {
                this.toBe(expected);
            };
        return result;
    }
    
    function listFeatures(available)
    {
        var callback = function (feature) { return !!featureSet[feature] !== available; };
        var result = Object.getOwnPropertyNames(featureSet).filter(callback).sort();
        return result;
    }
    
    function padBoth(str, length)
    {
        str += '';
        var result = padRight(padLeft(str, length + str.length >> 1), length);
        return result;
    }
    
    function padLeft(str, length)
    {
        str += '';
        var result = Array(length - str.length + 1).join(' ') + str;
        return result;
    }
    
    function padRight(str, length)
    {
        str += '';
        var result = str + Array(length - str.length + 1).join(' ');
        return result;
    }
    
    function run()
    {
        describe(
            'JScrewIt',
            function()
            {
                it(
                    'is set up correctly',
                    function ()
                    {
                        var self = { };
                        JScrewIt.debug.setUp(self);
                        expect(self.JScrewIt).toBe(JScrewIt);
                        expect(self.JSFuck).toBe(JScrewIt);
                    }
                );
            }
        );
        describe(
            'Character definitions of',
            function ()
            {
                for (var charCode = 0; charCode < 256; ++charCode)
                {
                    testCharacter(charCode);
                }
                for (; charCode < 0x00010000; charCode <<= 1)
                {
                    testCharacter(charCode + 0x1f);
                }
            }
        );
        describe(
            'Constants definitions of',
            function ()
            {
                testConstant('Array', isExpected(Array));
                testConstant('Boolean', isExpected(Boolean));
                testConstant('Date', isExpected(Date));
                testConstant('Function', isExpected(Function));
                testConstant('Number', isExpected(Number));
                testConstant('RegExp', isExpected(RegExp));
                testConstant('String', isExpected(String));
                
                testConstant('atob', function () { this.toBe(atob); });
                testConstant('btoa', function () { this.toBe(btoa); });
                testConstant('escape', isExpected(escape));
                testConstant('self', function () { this.toBe(global.self); });
                testConstant('unescape', isExpected(unescape));
                
                testConstant(
                    'ANY_FUNCTION',
                    function ()
                    {
                        this.toMatch(/^\s*function [\w\$]+\(\)\s*\{\s*\[native code]\s*\}\s*$/);
                    }
                );
                testConstant(
                    'ARRAY_ITERATOR',
                    function ()
                    {
                        var expected =
                            /^\[object Array ?Iterator]$/.test(
                                Object.prototype.toString.call(this.actual)
                            ) ?
                            this.actual : [].entries();
                        this.toBe(expected);
                    }
                );
                testConstant('CONSTRUCTOR', isExpected('constructor'));
                testConstant('FILL', function () { this.toBe(Array.prototype.fill); });
                testConstant('FILTER', function () { this.toBe(Array.prototype.filter); });
                testConstant(
                    'PLAIN_OBJECT',
                    function ()
                    {
                        var expected =
                            Object.prototype.toString.call(this.actual) === '[object Object]' ?
                            this.actual : { };
                        this.toBe(expected);
                    }
                );
                testConstant('TO_STRING', isExpected('toString'));
            }
        );
        describe(
            'JScrewIt.encode',
            function ()
            {
                describeEncodeTest('DEFAULT');
                if (JScrewIt.areFeaturesAvailable('COMPACT'))
                {
                    describeEncodeTest('COMPACT');
                }
                if (JScrewIt.areFeaturesAvailable('NO_IE'))
                {
                    describeEncodeTest('NO_IE');
                }
                describeEncodeTest('AUTO');
                it(
                    'throws a ReferenceError for incompatible features',
                    function ()
                    {
                        var fn =
                            function () { JScrewIt.encode('', false, ['NO_IE_SRC', 'IE_SRC']); };
                        expect(fn).toThrow(ReferenceError('Incompatible features'));
                    }
                );
            }
        );
        describe(
            'JScrewIt.areFeaturesCompatible',
            function()
            {
                it(
                    'returns true for compatible features',
                    function ()
                    {
                        var compatible = JScrewIt.areFeaturesCompatible(['FILL', 'SELF']);
                        expect(compatible).toBe(true);
                    }
                );
                it(
                    'returns false for incompatible features',
                    function ()
                    {
                        var compatible = JScrewIt.areFeaturesCompatible(['V8_SRC', 'IE_SRC']);
                        expect(compatible).toBe(false);
                    }
                );
                it(
                    'throws a ReferenceError for unknown features',
                    function ()
                    {
                        var fn = function () { JScrewIt.areFeaturesCompatible(['???']); };
                        expect(fn).toThrow(ReferenceError('Unknown feature "???"'));
                    }
                );
            }
        );
        describe(
            'JScrewIt.FEATURE_INFOS',
            function()
            {
                describe(
                    'contains correct information for the feature',
                    function ()
                    {
                        it(
                            'DEFAULT',
                            function ()
                            {
                                var info = JScrewIt.FEATURE_INFOS.DEFAULT;
                                expect(info.available).toBe(true);
                                expect(info.includes.length).toBe(0);
                                expect(info.excludes.length).toBe(0);
                            }
                        );
                        it(
                            'AUTO',
                            function ()
                            {
                                var info = JScrewIt.FEATURE_INFOS.AUTO;
                                expect(info.available).toBe(true);
                                expect(info.includes.length).toBeGreaterThan(0);
                                expect(info.excludes.length).toBe(0);
                            }
                        );
                        it(
                            'V8_SRC',
                            function ()
                            {
                                var info = JScrewIt.FEATURE_INFOS.V8_SRC;
                                expect(info.includes).toContain('NO_IE_SRC');
                                expect(info.excludes).toContain('FF_SAFARI_SRC');
                            }
                        );
                    }
                );
                describe(
                    'contains only well-formed obejcts:',
                    function ()
                    {
                        var features = Object.getOwnPropertyNames(JScrewIt.FEATURE_INFOS);
                        features.forEach(
                            function (feature)
                            {
                                it(
                                    feature,
                                    function ()
                                    {
                                        var info = JScrewIt.FEATURE_INFOS[feature];
                                        expect(typeof info).toBe('object');
                                        expect(info.name).toBe(feature);
                                        var available = info.available;
                                        expect(typeof available).toBe('boolean');
                                        expect(available).toBe(
                                            JScrewIt.areFeaturesAvailable(feature)
                                        );
                                        expect(Array.isArray(info.includes)).toBeTruthy();
                                        var excludes = info.excludes;
                                        expect(Array.isArray(excludes)).toBeTruthy();
                                        expect(typeof info.description).toBe('string');
                                        excludes.forEach(
                                            function (exclude)
                                            {
                                                var info = JScrewIt.FEATURE_INFOS[exclude];
                                                expect(info.excludes).toContain(feature);
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
        describe(
            'JScrewIt.debug.defineConstant fails for',
            function ()
            {
                it(
                    'invalid identifier',
                    function ()
                    {
                        expect(
                            function ()
                            {
                                JScrewIt.debug.defineConstant('X:X', '0');
                            }
                        ).toThrow(SyntaxError('Invalid identifier "X:X"'));
                    }
                );
                it(
                    'identifier already defined',
                    function ()
                    {
                        expect(
                            function ()
                            {
                                JScrewIt.debug.defineConstant('Array', '0');
                            }
                        ).toThrow(ReferenceError('Array already defined'));
                    }
                );
            }
        );
        describe(
            'JScrewIt.debug.replace can replace',
            function ()
            {
                it(
                    'a number',
                    function ()
                    {
                        var actual = eval(JScrewIt.debug.replace('""+2'));
                        expect(actual).toBe('2');
                    }
                );
                it(
                    'NaN',
                    function ()
                    {
                        var actual = eval(JScrewIt.debug.replace('""+NaN'));
                        expect(actual).toBe('NaN');
                    }
                );
            }
        );
        describe(
            'SyntaxError thrown for',
            function ()
            {
                function debugReplacer(input)
                {
                    var result = function () { JScrewIt.debug.replace(input); };
                    return result;
                }
                
                JScrewIt.debug.defineConstant('A', 'B');
                JScrewIt.debug.defineConstant('C', 'D');
                JScrewIt.debug.defineConstant('D', 'C');
                JScrewIt.debug.defineConstant('E', '?');
                
                it(
                    'Undefined literal',
                    function ()
                    {
                        expect(debugReplacer('A')).toThrow(
                            SyntaxError('Undefined literal B in the definition of A')
                        );
                    }
                );
                it(
                    'Circular reference',
                    function ()
                    {
                        expect(debugReplacer('C')).toThrow(
                            SyntaxError('Circular reference detected: C < D < C')
                        );
                    }
                );
                it(
                    'Unexpected character',
                    function ()
                    {
                        expect(debugReplacer('E')).toThrow(
                            SyntaxError('Unexpected character "?" in the definition of E')
                        );
                    }
                );
            }
        );
        describe(
            'hasOuterPlus is',
            function ()
            {
                it(
                    'true for leading plus',
                    function ()
                    {
                        var solution = Object('+[]');
                        expect(JScrewIt.debug.hasOuterPlus(solution)).toBe(true);
                        expect(solution.outerPlus).toBe(true);
                    }
                );
                it(
                    'true for middle plus',
                    function ()
                    {
                        var solution = Object('[]+[]');
                        expect(JScrewIt.debug.hasOuterPlus(solution)).toBe(true);
                        expect(solution.outerPlus).toBe(true);
                    }
                );
                it(
                    'false for inner plus',
                    function ()
                    {
                        var solution = Object('(+[])');
                        expect(JScrewIt.debug.hasOuterPlus(solution)).toBe(false);
                        expect(solution.outerPlus).toBe(false);
                    }
                );
                it(
                    'false for leading !+',
                    function ()
                    {
                        var solution = Object('!+[]');
                        expect(JScrewIt.debug.hasOuterPlus(solution)).toBe(false);
                        expect(solution.outerPlus).toBe(false);
                    }
                );
                it(
                    'cached',
                    function ()
                    {
                        var solution = { outerPlus: true };
                        expect(JScrewIt.debug.hasOuterPlus(solution)).toBe(true);
                    }
                );
            }
        );
    }
    
    function testCharacter(charCode)
    {
        var char = String.fromCharCode(charCode);
        var desc =
            charCode >= 0x7f && charCode <= 0xa0 || charCode === 0xad ?
            '"\\u00' + charCode.toString(16) + '"' : JSON.stringify(char);
        describe(
            desc,
            function ()
            {
                function verifyOutput(output)
                {
                    expect(output).toMatch(/^[!+()[\]]*$/);
                    var actual = eval(output) + '';
                    expect(actual).toBe(character);
                }
                
                var character = char;
                var entries = JScrewIt.debug.getCharacterEntries(character);
                if (entries)
                {
                    var defaultEntryFound = false;
                    entries.forEach(
                        function (entry, index)
                        {
                            var features = JScrewIt.debug.getEntryFeatures(entry);
                            var usingDefaultFeature = !features.length;
                            defaultEntryFound |= usingDefaultFeature;
                            var emuFeatures = getEmuFeatures(features);
                            if (emuFeatures)
                            {
                                emuIt(
                                    '(definition ' + index + ')',
                                    function ()
                                    {
                                        var definition = entry.definition;
                                        var output = JScrewIt.debug.replace(definition, features);
                                        verifyOutput(output);
                                    },
                                    emuFeatures
                                );
                            }
                        }
                    );
                    if (!defaultEntryFound)
                    {
                        it(
                            '(default)',
                            function ()
                            {
                                var output = JScrewIt.encode(character, false);
                                verifyOutput(output);
                            }
                        );
                    }
                }
                else
                {
                    it(
                        '(default)',
                        function ()
                        {
                            var output = JScrewIt.encode(character, false);
                            verifyOutput(output);
                        }
                    );
                    if ('ATOB' in featureSet)
                    {
                        (featureSet.ATOB ? emuIt : it)(
                            '(atob)',
                            function ()
                            {
                                var output = JScrewIt.encode(character, false, 'ATOB');
                                verifyOutput(output);
                                expect(output.length).not.toBeGreaterThan(
                                    JScrewIt.encode(character, false).length
                                );
                            },
                            ['ATOB']
                        );
                    }
                }
            }
        );
    }
    
    function testConstant(constant, validator)
    {
        describe(
            constant,
            function ()
            {
                function verifyOutput(output)
                {
                    expect(output).toMatch(/^[!+()[\]]*$/);
                    var actual = eval(output);
                    validator.call(expect(actual));
                }
                
                var entries = JScrewIt.debug.getConstantEntries(constant);
                entries.forEach(
                    function (entry, index)
                    {
                        var features = JScrewIt.debug.getEntryFeatures(entry);
                        var emuFeatures = getEmuFeatures(features);
                        if (emuFeatures)
                        {
                            emuIt(
                                '(definition ' + index + ')',
                                function ()
                                {
                                    var definition = entry.definition;
                                    var output = JScrewIt.debug.replace(definition, features);
                                    verifyOutput(output);
                                },
                                emuFeatures
                            );
                        }
                    }
                );
            }
        );
    }
    
    var JScrewIt;
    var featureSet =
    {
        ATOB:
        {
            setUp: function ()
            {
                global.atob =
                    function (value)
                    {
                        return Base64.decode(value);
                    };
                global.btoa =
                    function (value)
                    {
                        return Base64.encode(value);
                    };
            },
            tearDown: function ()
            {
                delete global.atob;
                delete global.btoa;
            }
        },
        DOMWINDOW: createWindowEmuFeature('[object DOMWindow]'),
        FILL:
        {
            setUp: function ()
            {
                var fill = Function();
                var string = (Array.prototype.join + '').replace(/\bjoin\b/, 'fill');
                fill.toString = function () { return string; };
                Object.defineProperty(Array.prototype, 'fill', { configurable: true, value: fill });
            },
            tearDown: function ()
            {
                delete Array.prototype.fill;
            }
        },
        NAME:
        {
            setUp: function ()
            {
                var get =
                    function ()
                    {
                        var result = /^\s*function ([\w\$]+)/.exec(this)[1];
                        return result;
                    };
                Object.defineProperty(Function.prototype, 'name', { configurable: true, get: get });
            },
            tearDown: function ()
            {
                delete Function.prototype.name;
            }
        },
        QUOTE:
        {
            setUp: function ()
            {
                var quote = function () { return JSON.stringify(this); };
                Object.defineProperty(
                    String.prototype,
                    'quote',
                    { configurable: true, value: quote }
                );
            },
            tearDown: function ()
            {
                delete String.prototype.quote;
            }
        },
        SELF:
        {
            setUp: function ()
            {
                if (!global.self)
                {
                    global.self = { toString: function () { return '[object Window]'; } };
                }
            },
            tearDown: function ()
            {
                delete global.self;
            }
        },
        WINDOW: createWindowEmuFeature('[object Window]')
    };
    
    var TestSuite =
    {
        createOutput: createOutput,
        init: init,
        listFeatures: listFeatures,
        run: run
    };
    
    if (global.self)
    {
        self.TestSuite = TestSuite;
    }
    if (typeof module !== 'undefined')
    {
        module.exports = TestSuite;
    }
    
})(typeof self === 'undefined' ? global : self);
