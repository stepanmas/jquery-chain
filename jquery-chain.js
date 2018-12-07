!function () {
  'use strict';

  $.Chain = function (options) {
    this.cache = [];
    this._stop = false;
    this._requestId = null;

    window.requestAnimFrame = (function () {
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
          setTimeout(callback, 1000 / 60);
        };
    })();

    window.cancelAnimationFrame = (function () {
      return window.cancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        function (t) {
          clearTimeout(t);
        };
    })();

    this.options = $.extend(
      true,
      {
        line: {
          color: '#b59371',
          width: 1,
        },
        dots: {
          size: [2, 2],
          color: '#b59371',
        },
        el: '.Chain',
        follow: '.Chain-dot', // selector or array contains offset, example: [[50, 32], node] or [[50, 32], [323, 43]]
        add: 'round', // round, rect or false
        canvas: {
          appendTo: false,
          css: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            left: 0,
            top: 0,
          },
        },
      },
      options,
    );

    this.getPosition = function (el) {
      if (el instanceof Array) {
        return el;
      }
      return [el.position().left + (el.data('left') || 0), el.position().top + (el.data('top') || 0)];
    };

    this._clear = function (cb) {
      var self = this;

      requestAnimationFrame(
        function () {
          $.each(
            self.cache,
            function () {
              this.context.clearRect(0, 0, this.canvas.width(), this.canvas.height());
            },
          );

          if (cb) {
            self.cache = [];
            $(self.options.el).data('chain-initialized', false);
            cb();
          }
        },
      );
    };

    return this;
  };


  $.Chain.prototype.update = function (number, position, block) {
    if (this.cache.length) {
      this.cache[block || 0].dots[number] = (position instanceof Array ? [position[0], position[1]] : position);
    }
  };


  // Main methods
  $.Chain.prototype.draw = function () {
    var self = this,
      options = this.options;

    $.each(
      this.cache,
      function () {
        var $canvas = this.canvas,
          canvas = $canvas[0],
          context = this.context || canvas.getContext('2d');

        this.context = context;

        if (!this.dots.length) {
          return null;
        }

        canvas.height = $canvas.height();
        canvas.width = $canvas.width();

        context.beginPath();
        context.lineWidth = options.line.width;
        context.fillStyle = options.dots.color;
        context.lineJoin = 'round';
        context.strokeStyle = options.line.color;

        $.each(
          this.dots,
          function (i, dot) {
            var yet_dot = self.getPosition(dot);

            if (i === 0) {
              context.moveTo.apply(context, yet_dot);
            } else {
              context.lineTo.apply(context, yet_dot);
            }
          },
        );

        context.stroke();

        /**
         * Draw dots
         */
        if (options.add) {
          $.each(
            this.dots,
            function (i, dot) {
              var yet_dot = self.getPosition(dot);

              if (options.add === 'round') {
                context.beginPath();
                context.arc(yet_dot[0], yet_dot[1], options.dots.size[0], 0, Math.PI * 2, false);
                context.fill();
                context.closePath();
              }

              else if (options.add === 'rect') {
                context.beginPath();
                context.fillRect(
                  yet_dot[0] - options.dots.size[0] / 2,
                  yet_dot[1] - options.dots.size[1] / 2,
                  options.dots.size[0], options.dots.size[1],
                );
                context.fill();
                context.closePath();
              }
            },
          );
        }
      },
    );

    return true;
  };

  $.Chain.prototype.render = function () {
    var self = this,
      block = $(this.options.el);

    block.each(
      function () {
        var it = $(this),
          canvasParent = self.options.canvas.appendTo || it;

        if (!it.data('chain-initialized')) {
          canvasParent.css('position', 'relative');

          var canvas = $('> canvas', canvasParent),
            cacheObj = { dots: [] };

          if (!canvas.length) {
            canvas = $(
              '<canvas/>', {
                css: self.options.canvas.css,
                appendTo: canvasParent,
              },
            );
          }

          cacheObj.canvas = canvas;

          $(self.options.follow, it).each(
            function (i, el) {
              if (el instanceof Array) {
                cacheObj.dots.push(el);
              } else {
                cacheObj.dots.push($(el));
              }
            },
          );

          it.data('chain-initialized', true);
          self.cache.push(cacheObj);
        }
      },
    );

    if (this._requestId) {
      window.cancelAnimationFrame(this._requestId);
      this._requestId = null;
    }

    !function loop() {
      self.draw();
      if (!self._stop) {
        self._requestId = requestAnimFrame(loop);
      }
    }();
  };

  /**
   * Commands
   */

  $.Chain.prototype.stop = function () {
    this._stop = true;
  };

  $.Chain.prototype.start = function () {
    this._stop = false;
    this.render();
  };

  $.Chain.prototype.clear = function (cb) {
    this.stop();
    this._clear(cb);
  };
}();
