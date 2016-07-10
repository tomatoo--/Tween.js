var Tween = (function() {

  /**
   * Create tween
   * @param {Object} from
   * @param {Object} to
   * @param {Object} option
   * @param {number} option.duration
   * @param {string} option.easing
   * @param {number} option.delay
   * @constructor
   */
  function Tween(from, to, option) {

    this._from = from;
    this._to = to;

    // Backup original properties
    this._origin = extend({}, this._from);

    // default values
    this._setting = {
      duration: 200,
      easing: 'linear',
      delay: 0
    };

    this._setting = extend(this._setting, option || {});

    this._isPlaying = false;
    this._startFired = false;
    this._startTime = 0;
    this._isComplete = false;

    this._onUpdate = function() {};
    this._onStart = function() {};
    this._onComplete = function() {};

    this._init();
  };

  /**
   * Cash tween object
   */
  Tween.updateList = {};

  /**
   * Update all tween
   * @return {Object}
   */
  Tween.update = function() {
    if(Object.keys(Tween.updateList).length === 0) {
      return false;
    }

    for(var key in Tween.updateList) {
      var obj = Tween.updateList[key];
      obj._update();
    }

    return true;
  };

  /**
   * Remove all tween
   * @return {Object}
   */
  Tween.removeAll = function() {
    for(var key in Tween.updateList) {
      delete Tween.updateList[key];
    }
  };


  Tween.prototype = {

    /**
     * Initialize
     */
    _init: function() {
      this._add();
    },

    /**
     * Push to tween list
     */
    _add: function() {
      this._id = idgen(10000000000);
      Tween.updateList[this._id] = this;
    },

    /**
     * Remove from tween list
     */
    remove: function() {
      this._isPlaying = false;
      this._isComplete = true;
      this._onStart = function(){};
      this._onUpdate = function(){};
      this._onComplete = function(){};
      delete Tween.updateList[this._id];
    },

    /**
     * Start tween
     * @return {Object}
     */
    start: function() {
      this._startTime = window.performance.now();
      this._isPlaying = true;

      return this;
    },

    /**
     * Stop tween
     * @return {Object}
     */
    stop: function() {
      if (!_isPlaying) return this;

      this._isPlaying = false;
      this.remove();
      return this;
    },

    /**
     * Get my ID
     * @return {string}
     */
    id: function() {
      return this._id;
    },

    /**
     * Get my setting
     * @return {Object}
     */
    setting: function() {
      return this._setting;
    },

    /**
     * Get playing state
     * @return {boolean}
     */
    isPlaying: function() {
      return this._isPlaying;
    },

    /**
     * Set callback on update
     * @param {function} callback
     * @return {Object}
     */
    onUpdate: function(callback) {
      this._onUpdate = callback;

      return this;
    },

    /**
     * Set callback on start
     * @param {function} callback
     * @return {Object}
     */
    onStart: function(callback) {
      this._onStart = callback;

      return this;
    },

    /**
     * Set callback on complete
     * @param {function} callback
     * @return {Object}
     */
    onComplete: function(callback) {
      this._onComplete = callback;

      return this;
    },

    /**
     * Call at update
     */
    _update: function() {
      if(this._isPlaying) {

        var now = window.performance.now();

        var elapsed = now - this._startTime;

        if(elapsed < this._setting.delay) {
          return false;
        }

        if(elapsed / (this._setting.duration + this._setting.delay) > 1) {
          elapsed = this._setting.duration + this._setting.delay;
        }

        if(!this._startFired) {
          this._startFired = true;
          this._onStart.call(this);
        }

        for(var key in this._to){
          var start = this._origin[key];
          var variation = this._to[key] - start;
          var eased = easing[this._setting.easing](
            elapsed - this._setting.delay,
            start,
            variation,
            this._setting.duration
          );
          this._from[key] = eased.toFixed(16);
        }

        this._onUpdate.call(this, this._from);

        if(this._setting.duration === elapsed - this._setting.delay){
          this._onComplete.call(this);
          this.remove();
        }
      }
    }

  };

  /**
   * Copy properties
   * @param {Object}
   * @return {Object}
   */
  function extend(arg) {
    if (arguments.length < 2) {
      return arg;
    }
    if (!arg) {
      var arg = {};
    }
    for (var i = 1; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        if (arguments[i][key] !== null &&
          typeof(arguments[i][key]) === 'object') {
            arg[key] = extend(arg[key],arguments[i][key]);
        } else {
            arg[key] = arguments[i][key];
        }
      }
    }
    return arg;
  }

  /**
   * Generate unique ID
   * @param {number}
   * @return {string}
   */
  function idgen(strong) {
    var strong = strong || 10000;
    var id = new Date().getTime().toString(16) +
      Math.floor(strong * Math.random()).toString(16);
    return id;
  }

  /**
   * Easing functions
   * @param {nuber} t
   * @param {nuber} b
   * @param {nuber} c
   * @param {nuber} d
   * @return {number}
   */
  var easing = {
    linear: function (t, b, c, d) {
      return c * t / d + b;
    },
    easeInQuad: function (t, b, c, d) {
      return c * (t /= d) * t + b;
    },
    easeOutQuad: function (t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function (t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * t * t + b;
      return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    easeInCubic: function (t, b, c, d) {
      return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function (t, b, c, d) {
      return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function (t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
      return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function (t, b, c, d) {
      return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function (t, b, c, d) {
      return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function (t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
      return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function (t, b, c, d) {
      return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function (t, b, c, d) {
      return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function (t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
      return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function (t, b, c, d) {
      return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function (t, b, c, d) {
      return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function (t, b, c, d) {
      return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function (t, b, c, d) {
      return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function (t, b, c, d) {
      return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function (t, b, c, d) {
      if (t == 0) return b;
      if (t == d) return b + c;
      if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
      return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (t, b, c, d) {
      return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function (t, b, c, d) {
      return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function (t, b, c, d) {
      if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
      return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function (t, b, c, d) {
      var s = 1.70158;
      var p = 0;
      var a = c;
      if (t == 0) return b;
      if ((t /= d) == 1) return b + c;
      if (!p) p = d * .3;
      if (a < Math.abs(c)) {
        a = c;
        var s = p / 4;
      }
      else var s = p / (2 * Math.PI) * Math.asin(c / a);
      return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) *
        (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function (t, b, c, d) {
      var s = 1.70158;
      var p = 0;
      var a = c;
      if (t == 0) return b;
      if ((t /= d) == 1) return b + c;
      if (!p) p = d * .3;
      if (a < Math.abs(c)) {
        a = c;
        var s = p / 4;
      }
      else var s = p / (2 * Math.PI) * Math.asin(c / a);
      return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) *
        (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function (t, b, c, d) {
      var s = 1.70158;
      var p = 0;
      var a = c;
      if (t == 0) return b;
      if ((t /= d / 2) == 2) return b + c;
      if (!p) p = d * (.3 * 1.5);
      if (a < Math.abs(c)) {
        a = c;
        var s = p / 4;
      }
      else var s = p / (2 * Math.PI) * Math.asin(c / a);
      if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) *
        Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
      return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) *
        (2 * Math.PI) / p) * .5 + c + b;
    },
    easeInBack: function (t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function (t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function (t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      if ((t /= d / 2) < 1) {
        return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
      }
      return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function (t, b, c, d) {
      return c - easing.easeOutBounce(d - t, 0, c, d) + b;
    },
    easeOutBounce: function (t, b, c, d) {
      if ((t /= d) < (1 / 2.75)) {
        return c * (7.5625 * t * t) + b;
      } else if (t < (2 / 2.75)) {
        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
      } else if (t < (2.5 / 2.75)) {
        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
      } else {
        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
      }
    },
    easeInOutBounce: function (t, b, c, d) {
      if (t < d / 2) return easing.easeInBounce(t * 2, 0, c, d) * .5 + b;
      return easing.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
  };

  return Tween;

})();
