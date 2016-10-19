!function ()
{
    "use strict";
    
    $.Chain = function (options)
    {
        var cache = {
            canvas: null,
            dots  : []
        };
        
        window.requestAnimFrame = (function ()
        {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback)
                {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
        
        
        options = $.extend(
            {
                line: {
                    color: 'blue',
                    width: 1
                },
                el  : '.Chain',
                dot : '.Chain-dot',
                dots: []
            },
            options
        );
        
        var getPosition = function (el)
        {
            return [el.position().left, el.position().top];
        };
        
        
        this.draw = function ()
        {
            var $canvas = $(cache.canvas),
                canvas  = $canvas[0],
                context = canvas.getContext('2d');
            
            if (!cache.dots.length)
                return null;
            
            canvas.height = $canvas.height();
            canvas.width  = $canvas.width();
            
            context.beginPath();
            context.lineWidth = options.line.width;
            context.moveTo.apply(context, getPosition(cache.dots[0]));
            
            $.each(
                cache.dots,
                function (i, dot)
                {
                    if (!i) return;
                    
                    context.lineTo.apply(context, getPosition(dot));
                }
            );
            
            context.strokeStyle = options.line.color;
            context.stroke();
            
            return true;
        };
        
        
        this.render = function ()
        {
            var self  = this,
                block = $(options.el);
            
            if (!block.data('chain-initialized'))
            {
                block.css('position', 'relative');
    
                cache.canvas = $(
                    '<canvas/>', {
                        css     : {
                            position     : 'absolute',
                            width        : '100%',
                            height       : '100%',
                            pointerEvents: 'none'
                        },
                        appendTo: block
                    }
                );
                
                $(options.dot, block).each(
                    function (i, el)
                    {
                        cache.dots.push($(el));
                    }
                );
                
                !function loop()
                {
                    self.draw();
                    requestAnimFrame(loop)
                }();
            }
            
            if (!this.draw())
                console.warn('Elements for bind is not found');
        };
        
        return this;
    };
}();