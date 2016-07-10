var TweenSequencer = (function() {

  /**
   * Management of animation
   * It depends on the Tween.js.
   * @constructor
   */
  function TweenSequencer() {
    this._init();
  }

  TweenSequencer.prototype = {

    /**
     * Initialize
     */
    _init: function() {
      this._startTime = 0;

      this._tweensList = [];
      this._currentTweens = [];
      this._length = 0;
      this._isRunning = false;

      this._timer = null;

      this._callbackList = [];
      this._onComplete = function() {};
    },

    /**
     * Add tween list
     * @type {Array.<Object>|Object} tweens
     * @type {function} callback
     * @return {Object}
     */
    add: function(tweens, callback) {
      if(!Array.isArray(tweens)) {
        var tweens = [tweens];
      }

      this._tweensList.push(tweens);
      this._callbackList.push(callback || '');// コールバックを追加
      ++this._length;

      return this;
    },

    /**
     * Add delay
     * @type {number} time
     * @type {function} callback
     * @return {Object}
     */
    delay: function(time, callback) {
      var t = new Tween({},{},{
        duration: 1,
        delay: time
      });
      if(callback) {
        t.onComplete(function() {
          if(typeof callback == 'function') callback();
        });
      }
      
      this.add(t);

      return this;
    },

    /**
     * Run sequencer
     * @return {Object}
     */
    run: function() {
      if(!this._startTime) {
        this._startTime = window.performance.now();
      }

      if(this._tweensList.length > 0) {
        this._currentTweens = this._tweensList[0];

        for(var i = 0, l = this._tweensList[0].length; i < l; i++) {
          this._tweensList[0][i].start();
        }

        if(!this._isRunning) {
          this._observe();
          this._isRunning = true;
        }

      } else {
        cancelAnimationFrame(this._timer);
        this._onComplete();
        this._isRunning = false;
      }

      return this;
    },

    /**
     * Remove tween
     * @return {Object}
     */
    remove: function() {
      this._tweensList = [];
      Tween.removeAll();

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
     * Observe tween list
     */
    _observe: function() {
      var _continue = false;
      for(var i = 0, l = this._currentTweens.length; i < l; i++) {
        if(!this._currentTweens[i]._isComplete) {
          _continue = true;
          break;
        }
      }

      if(!_continue) {
        this._tweensList.shift();
        var callback = this._callbackList.shift();
        if(typeof callback === 'function') callback();
        this.run();
      }

      if(this._tweensList.length > 0){
        this._timer = requestAnimationFrame(this._observe.bind(this));
      }
    }

  };

  return TweenSequencer;

})();
