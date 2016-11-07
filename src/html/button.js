/* eslint-env browser */
/* global art */

// Not much more than a collection of hacks for IE.

function createButton(text)
{
    'use strict';
    
    function deactivate()
    {
        button.className = 'button';
        setCaptureListeners('off');
    }
    
    function filterClick(evt)
    {
        if (isDisabled())
            evt.stopPropagation();
    }
    
    function handleDocumentMousemove(evt)
    {
        if (evt.target !== button && isActive()) // capture lost
            deactivate();
    }
    
    function handleDocumentMouseout(evt)
    {
        if (!evt.relatedTarget && isActive()) // capture lost
            deactivate();
    }
    
    function handleKeydown(evt)
    {
        if (evt.keyCode === 13) // Enter
        {
            button.click();
            evt.preventDefault();
        }
    }
    
    function handleKeyup(evt)
    {
        if (evt.keyCode === 32) // Space
        {
            button.click();
            evt.preventDefault();
        }
    }
    
    function handleMousedown(evt)
    {
        if (evt.which === 1 && !isDisabled() && !isActive())
        {
            button.setCapture();
            button.className = 'active button';
            setCaptureListeners('on');
        }
    }
    
    function handleMouseup(evt)
    {
        if (evt.which === 1 && isActive())
        {
            document.releaseCapture();
            deactivate();
        }
    }
    
    function isActive()
    {
        var active = /\bactive\b/.test(button.className);
        return active;
    }
    
    function isDisabled()
    {
        var disabled = !button.hasAttribute('tabindex');
        return disabled;
    }
    
    function setCaptureListeners(methodName)
    {
        var method = art[methodName];
        art(
            document,
            method('mousemove', handleDocumentMousemove),
            method('mouseout', handleDocumentMouseout)
        );
    }
    
    function setTabindex()
    {
        button.setAttribute('tabindex', 0);
    }
    
    var button =
        art(
            'SPAN',
            { className: 'button' },
            art.on('click', filterClick, true),
            art.on('keydown', handleKeydown),
            art.on('keyup', handleKeyup),
            art.on('mouseup', handleMouseup),
            art('SPAN', text),
            art('SPAN')
        );
    setTabindex();
    if (button.msMatchesSelector)
    {
        button.firstChild.setAttribute('unselectable', 'on');
        art(button, art.on('mousedown', handleMousedown));
    }
    Object.defineProperty(
        button,
        'disabled',
        {
            configurable: true,
            get: function ()
            {
                var value = isDisabled();
                return value;
            },
            set: function (value)
            {
                value = !!value;
                if (value !== isDisabled())
                {
                    if (value)
                    {
                        button.removeAttribute('tabindex');
                        if (isActive())
                        {
                            document.releaseCapture();
                            setCaptureListeners('off');
                        }
                        button.blur();
                    }
                    else
                        setTabindex();
                    // Make sure the class does change so a refresh is triggered in IE and Edge.
                    button.className = '';
                    button.className = 'button';
                }
            }
        }
    );
    return button;
}

art.css(
    '.button',
    {
        background: '#e0e0e0',
        color:      '#212121',
        cursor:     'default',
        display:    'inline-block',
        outline:    'none',
        position:   'relative'
    }
);
art.css('.button, .button>:last-child', { 'border-radius': '.1em' });
art.css('.button.active, .button[tabindex]:active', { background: '#29b3e5' });
art.css(
    '.button.active>:first-child, .button[tabindex]:active>:first-child',
    { left: '.1em', top: '.1em' }
);
art.css(
    '.button.active>:last-child, .button[tabindex]:active>:last-child',
    { 'border-color': '#0088b6' }
);
art.css('.button:focus', { 'box-shadow': '0 0 2px 2px rgba(0, 127, 255, .75)' });
art.css('.button:not([tabindex])', { background: '#e9e9e9', color: '#707070' });
art.css('.button:not([tabindex])>:last-child', { 'border-color': '#bababa' });
art.css(
    '.button>:first-child',
    {
        display:                'inline-block',
        margin:                 '.15em .5em',
        position:               'relative',
        'user-select':          'none',
        '-moz-user-select':     'none',
        '-ms-user-select':      'none',
        '-webkit-user-select':  'none',
    }
);
art.css(
    '.button>:last-child',
    {
        'border-color': '#707070',
        'border-style': 'solid',
        'border-width': '1px',
        display:        'inline-block',
        position:       'absolute',
        left:           '0',
        right:          '0',
        top:            '0',
        bottom:         '0'
    }
);
art.css('.button[tabindex]:hover:not(.active):not(:active)', { background: '#a3f4ff' });
art.css(
    '.button[tabindex]:hover:not(.active):not(:active)>:last-child',
    { 'border-color': '#189fdd' }
);