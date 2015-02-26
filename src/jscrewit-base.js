/*
global
FEATURE_INFOS,
Encoder,
availableFeatureMask,
getFeatureMask,
incompatibleFeatureMasks,
module,
self
*/

var JScrewIt;
var getValidFeatureMask;
var setUp;

(function ()
{
    'use strict';
    
    function areFeaturesAvailable(features)
    {
        var featureMask = getFeatureMask(features);
        return (featureMask & availableFeatureMask) === featureMask;
    }
    
    function areFeaturesCompatible(features)
    {
        var featureMask = getFeatureMask(features);
        var result = isFeatureMaskCompatible(featureMask);
        return result;
    }
    
    function encode(input, param2, param3)
    {
        var features;
        var wrapWithEval;
        if (typeof param2 === 'object')
        {
            features = param2.features;
            wrapWithEval = param2.wrapWithEval;
        }
        else
        {
            features = param3;
            wrapWithEval = param2;
        }
        var encoder = getEncoder(features);
        var output = encoder.encode(input + '', wrapWithEval);
        return output;
    }
    
    function getEncoder(features)
    {
        var featureMask = getValidFeatureMask(features);
        var encoder = encoders[featureMask];
        if (!encoder)
        {
            encoders[featureMask] = encoder = new Encoder(featureMask);
        }
        return encoder;
    }
    
    function isFeatureMaskCompatible(featureMask)
    {
        var result =
            incompatibleFeatureMasks.every(
                function (incompatibleFeatureMask)
                {
                    var result =
                        (incompatibleFeatureMask & featureMask) !== incompatibleFeatureMask;
                    return result;
                }
            );
        return result;
    }
    
    var encoders = { };
    
    JScrewIt =
    {
        areFeaturesAvailable:   areFeaturesAvailable,
        areFeaturesCompatible:  areFeaturesCompatible,
        encode:                 encode,
        FEATURE_INFOS:          FEATURE_INFOS,
    };
    
    getValidFeatureMask =
        function (features)
        {
            var featureMask = getFeatureMask(features);
            if (!isFeatureMaskCompatible(featureMask))
            {
                throw new ReferenceError('Incompatible features');
            }
            return featureMask;
        };
    
    setUp =
        function (self)
        {
            if (self != null)
            {
                self.JSFuck = self.JScrewIt = JScrewIt;
            }
        };
    
    setUp(typeof self !== 'undefined' ? self : null);
    
    if (typeof module !== 'undefined')
    {
        module.exports = JScrewIt;
    }

})();