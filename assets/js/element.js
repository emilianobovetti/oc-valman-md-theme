(function (root, factory) {

  root.element = factory();

}(this, function () {
  var get = {}, has = {}, add = {}, rem = {};

  var div = document.createElement('div');

  var body = document.body;

  var classList = div.classList;

  var animationEnd =
        div.style.animation != null ? 'animationend'
      : div.style.OAnimation != null ? 'oAnimationEnd'
      : div.style.MozAnimation != null ? 'mozAnimationEnd'
      : div.style.WebkitAnimation != null ? 'webkitAnimationEnd'
      : undefined;

  function prop (val, key) {
    if (val != null) return val[key];
  }

  function isEmpty (val) {
    return val == null || val.length === 0;
  }

  function nonEmpty (val) {
    return !isEmpty(val);
  }

  function isCollection (val) {
    return val != null
      && typeof val.forEach === 'function'
      && typeof val.filter === 'function'
      && typeof val.reduce === 'function'
      && typeof val.map === 'function';
  }

  function isIterable (val) {
    return val != null
      && typeof val.length === 'number'
      && (has.ownProperty(val, 0) || val.length === 0);
  }

  function slice (val, begin, end) {
    return isEmpty(val) ? []
      : typeof val === 'string' ? val.split('')
      : [].slice.call(val, begin, arguments.length < 3 ? val.length : end);
  }

  function toList (val) {
    return isEmpty(val) ? []
      : isCollection(val) ? val
      : isIterable(val) ? slice(val)
      : [ val ];
  }

  has.ownProperty = function (val, key) {
    return has.hasOwnProperty.call(val, key);
  };

  get.data = function (elem) {
    return prop(elem, 'dataset');
  };

  has.data = function (elem) {
    return typeof get.data(elem) === 'object';
  };

  get.data.animation = function (elem) {
    return prop(get.data(elem), 'animation');
  };

  has.data.animation = function (elem) {
    var animation = get.data.animation(elem);

    return typeof animation === 'string'
      && nonEmpty(animation);
  };

  /*
   * [ 'class1  class2', 'class3 ' ] -> [ 'class1', 'class2', 'class3' ]
   */
  function normalizeClasses (classes) {
    return classes.reduce(function (acc, cl) {
      return acc.concat(cl.split(' ').filter(nonEmpty));
    }, []);
  }

  add.class = function (elems) {
    var classes = slice(arguments, 1);

    toList(elems).forEach(function (elem) {
      classList.add.apply(elem.classList, normalizeClasses(classes));
    });

    return elems;
  };

  rem.class = function (elems) {
    var classes = slice(arguments, 1);

    toList(elems).forEach(function (elem) {
      classList.remove.apply(elem.classList, normalizeClasses(classes));
    });

    return elems;
  };

  function hide (elems) {
    toList(elems).forEach(function (elem) {
      elem.style.visibility = 'hidden';
    });

    return elems;
  }

  function show (elems) {
    toList(elems).forEach(function (elem) {
      elem.style.visibility = '';
    });

    return elems;
  }

  var config = {
    defaultAnimation: 'fadeIn',
    animateClass: 'animated'
  };

  function animate (elems) {
    if (isIterable(elems)) {
      toList(elems).forEach(animate);
    } else {
      var animationClass = get.data.animation(elems) || config.defaultAnimation;

      add.class(elems, config.animateClass, animationClass);

      function removeAnimation () {
        rem.class(elems, config.animateClass, animationClass);

        elems.removeEventListener(animationEnd, removeAnimation, false);
      }

      elems.addEventListener(animationEnd, removeAnimation, false);
    }

    return elems;
  }

  var scrollHandlerStarted = false;

  var checkScheduled = false;

  var animateOnScroll = [];

  function isInViewport (elem) {
    var elemRect = elem.getBoundingClientRect();

    return elemRect.bottom >= 0
      && elemRect.left >= 0
      && elemRect.top <= window.innerHeight
      && elemRect.right <= window.innerWidth;
  }

  function groupByViewport (elems) {
    var selection = {
      inView: [],
      notInView: []
    };

    toList(elems).forEach(function (elem) {
      isInViewport(elem)
        ? selection.inView.push(elem)
        : selection.notInView.push(elem);
    });

    return selection;
  }

  function animateElemsInView () {
    var elems = groupByViewport(animateOnScroll);

    animate(show(elems.inView));

    animateOnScroll = elems.notInView;

    checkScheduled = false;
  }

  function scheduleElemsCheck () {
    setTimeout(animateElemsInView, 200);

    checkScheduled = true;
  }

  function scrollHandler () {
    if (checkScheduled) {
      return;
    }

    if (animateOnScroll.length > 0) {
      scheduleElemsCheck();
    } else {
      stopScrollHandler();
    }
  }

  function startScrollHandler () {
    scrollHandlerStarted = true;

    window.addEventListener('scroll', scrollHandler, false);

    scheduleElemsCheck();
  }

  function stopScrollHandler () {
    scrollHandlerStarted = false;

    window.removeEventListener('scroll', scrollHandler, false);
  }

  animate.onScroll = function (elems) {
    animateOnScroll = animateOnScroll.concat(hide(toList(elems)));

    if (animateOnScroll.length > 0 && !scrollHandlerStarted) {
      startScrollHandler();
    }
  };

  function scrollTo (elem) {
    var yEnd = elem.offsetTop;
    var yStart = body.scrollTop;
    var yGap = yStart - yEnd;

    var distance = Math.abs(yGap);
    var duration = Math.log(distance) * 200;
    var time = 0;
    var deltaTime = 20;

    var intervalId = setInterval(function () {
      var timePercent = time / duration;
      var yPercent = (1 - Math.cos(Math.PI * timePercent)) / 2;
      yPercent = yPercent * yPercent;

      if (time >= duration) {
        body.scrollTop = yEnd;
        clearInterval(intervalId);
      } else {
        body.scrollTop = yStart - yGap * yPercent;
        time += deltaTime;
      }
    }, deltaTime);

    return elem;
  }

  return {
    get: get,
    has: has,
    add: add,
    rem: rem,
    hide: hide,
    show: show,
    animate: animate,
    scrollTo: scrollTo,
    isInViewport: isInViewport,
    groupByViewport: groupByViewport,

    util: {
      slice: slice
    }
  };
}));
