(function (root, factory) {

  root.element = factory();

}(this, function () {
  var get = {}, has = {}, add = {}, rem = {};

  var div = document.createElement('div');

  var classList = div.classList;

  var animationEnd =
        div.style.animation != null ? 'animationend'
      : div.style.OAnimation != null ? 'oAnimationEnd'
      : div.style.MozAnimation != null ? 'mozAnimationEnd'
      : div.style.WebkitAnimation != null ? 'webkitAnimationEnd'
      : undefined;

  function prop (val, key) {
    if (val != null) return val[key]
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
      && (val.hasOwnProperty(0) || val.length === 0);
  }

  function toList (val) {
    return isEmpty(val) ? []
      : isCollection(val) ? val
      : isIterable(val) ? slice(val)
      : [ val ];
  }

  function slice (val, b, e) {
    var toSlice, begin, end;

    if (val == null) {
      return val;
    }

    end = arguments.length < 3 ? val.length : e;
    begin = arguments.length < 2 ? 0 : b;
    toSlice = typeof val === 'string' ? val.split('') : val;

    return [].slice.call(toSlice, begin, end);
  }

  get.data = function (elem) {
    return prop(elem, 'dataset');
  };

  get.data.animation = function (elem) {
    return prop(get.data(elem), 'animation');
  };

  has.data = function (elem) {
    return typeof get.data(elem) === 'object';
  };

  has.data.animation = function (elem) {
    var animation = get.data.animation(elem);

    return typeof animation === 'string'
      && nonEmpty(animation);
  };

  /*
   * [ 'class1 class2', 'class3' ] => [ 'class1', 'class2', 'class3' ]
   */
  function splitClasses (classes) {
    return classes.reduce(function (acc, cl) {
      return acc.concat(cl.split(' ').filter(nonEmpty));
    }, []);
  }

  add.class = function (elems) {
    var classes = slice(arguments, 1);

    toList(elems).forEach(function (elem) {
      classList.add.apply(elem.classList, splitClasses(classes));
    });

    return elems;
  };

  rem.class = function (elems) {
    var classes = slice(arguments, 1);

    toList(elems).forEach(function (elem) {
      classList.remove.apply(elem.classList, splitClasses(classes));
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

  function animate (elems) {
    if (isIterable(elems)) {
      toList(elems).forEach(animate);
    } else {
      var animation = get.data.animation(elems) || 'fadeIn';

      add.class(elems, 'animated', animation);

      function removeAnimation () {
        rem.class(elems, 'animated', animation);

        elems.removeEventListener(animationEnd, removeAnimation, false);
      }

      elems.addEventListener(animationEnd, removeAnimation, false);
    }

    return elems;
  }

  var scrollHandlerStarted = false;

  var checkScheduled = false;

  var animateWhenInView = [];

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
    var elems = groupByViewport(animateWhenInView);

    animate(show(elems.inView));

    animateWhenInView = elems.notInView;

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

    if (animateWhenInView.length > 0) {
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

  animate.whenInView = function (elems) {
    animateWhenInView = animateWhenInView.concat(hide(toList(elems)));

    if (animateWhenInView.length > 0 && !scrollHandlerStarted) {
      startScrollHandler();
    }
  };

  return {
    get: get,
    has: has,
    add: add,
    rem: rem,
    hide: hide,
    show: show,
    animate: animate,
    isInViewport: isInViewport,
    groupByViewport: groupByViewport,

    util: {
      slice: slice
    }
  };
}));
