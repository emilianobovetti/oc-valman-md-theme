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

  function isFunction (val) {
    return typeof val === 'function';
  }

  function isList (val) {
    return val != null
      && isFunction(val.forEach)
      && isFunction(val.reduce)
      && isFunction(val.map);
  }

  function isCollection (val) {
    return val != null
      && typeof val.length === 'number'
      && val.hasOwnProperty(0);
  }

  function toList (val) {
    return isEmpty(val) ? []
      : isList(val) ? val
      : isCollection(val) ? slice(val)
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

  get.dataset = function (elem) {
    return prop(elem, 'dataset');
  };

  get.animation = function (elem) {
    return prop(get.dataset(elem), 'animation');
  };

  has.dataset = function (elem) {
    return get.dataset(elem) != null;
  };

  has.animation = function (elem) {
    var animation = get.animation(elem);

    return typeof animation === 'string' && animation.length > 0;
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
    if (isList(elems)) {
      elems.forEach(animate);

      return elems;
    }

    var animation = get.animation(elems);

    if (has.animation(elems)) {
      add.class(elems, 'animated', animation);

      elems.addEventListener(animationEnd, function () {
        rem.class(elems, animation);
      });
    }

    return elems;
  }

  var scrollHandlerStarted = false;

  var checkScheduled = false;

  var animateWhenInView = [];

  function isInViewport (elem) {
    var elemRect = elem.getBoundingClientRect();

    return elemRect.top < window.innerHeight && elemRect.bottom > 0;
  }

  function animateElemsInView () {
    var elems = animateWhenInView.reduce(function (acc, elem) {
      isInViewport(elem) ? acc.inView.push(elem) : acc.notInView.push(elem);

      return acc;
    }, { inView: [], notInView: [] });

    animate(show(elems.inView));

    animateWhenInView = elems.notInView;

    checkScheduled = false;
  }

  function scrollHandler () {
    if (!checkScheduled) {
      if (animateWhenInView.length > 0) {
        setTimeout(animateElemsInView, 300);

        checkScheduled = true;
      } else {
        stopScrollHandler();
      }
    }
  }

  function startScrollHandler () {
    scrollHandlerStarted = true;

    window.addEventListener('scroll', scrollHandler, false);

    setTimeout(animateElemsInView, 300);
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
    animate: animate
  };
}));
