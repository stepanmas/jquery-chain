!function ()
{
    "use strict";
    
    $.Chain = function (options)
    {
        var cache = {
            canvas: null,
            dots  : []
        };
        
        this._stop = false;
        
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
                line  : {
                    color: '#b59371',
                    width: 1
                },
                dots  : {
                    size : [2, 2],
                    color: '#b59371'
                },
                el    : '.Chain',
                follow: '.Chain-dot',
                add   : 'round' // round, rect or false
            },
            options
        );
        
        var getPosition = function (el)
        {
            return [el.position().left + (el.data('left') || 0), el.position().top + (el.data('top') || 0)];
        };
        
        
        this.draw = function ()
        {
            var $canvas = cache.canvas,
                canvas  = $canvas[0],
                context = cache.context || canvas.getContext('2d');
            
            cache.context = context;
            
            if (!cache.dots.length)
                return null;
            
            canvas.height = $canvas.height();
            canvas.width  = $canvas.width();
            
            context.beginPath();
            context.lineWidth = options.line.width;
            context.fillStyle = options.dots.color;
            context.lineJoin  = "round";
            context.strokeStyle = options.line.color;
            
            $.each(
                cache.dots,
                function (i, dot)
                {
                    var yet_dot = getPosition(dot);
                    
                    if (i === 0)
                        context.moveTo.apply(context, yet_dot);
                    else
                        context.lineTo.apply(context, yet_dot);
                }
            );
            
            context.stroke();
            
            /**
             * Draw dots
             */
            if (options.add)
            {
                $.each(
                    cache.dots,
                    function (i, dot)
                    {
                        var yet_dot = getPosition(dot);
                        
                        if (options.add === 'round')
                        {
                            context.beginPath();
                            context.arc(yet_dot[0], yet_dot[1], options.dots.size[0], 0, Math.PI * 2, false);
                            context.fill();
                            context.closePath();
                        }
                        
                        else
                            if (options.add === 'rect')
                            {
                                context.beginPath();
                                context.fillRect(
                                    yet_dot[0] - options.dots.size[0] / 2, yet_dot[1] - options.dots.size[1] / 2,
                                    options.dots.size[0], options.dots.size[1]
                                );
                                context.fill();
                                context.closePath();
                            }
                    }
                );
            }
            
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
                
                $(options.follow, block).each(
                    function (i, el)
                    {
                        cache.dots.push($(el));
                    }
                );
                
                block.data('chain-initialized', true)
            }
            
            !function loop()
            {
                self.draw();
                if (!self._stop) requestAnimFrame(loop)
            }();
        };
        
        
        this._clear = function ()
        {
            var canvas = $(cache.canvas);
            
            cache.context.clearRect(0, 0, canvas.width(), canvas.height());
        };
        
        
        /**
         * Commands
         */
        
        this.stop = function ()
        {
            this._stop = true;
        };
        
        this.start = function ()
        {
            this._stop = false;
            this.render()
        };
        
        this.clear = function ()
        {
            this._stop = true;
            this._clear();
        };
        
        return this;
    };
}();