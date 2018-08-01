(function (root, factory) {

  root.element = factory();

}(this, function () {
  var div = document.createElement('div');
  var classList = div.classList;

  var animationEnd = (function(div) {
    var animations = {
      animation: 'animationend',
      OAnimation: 'oAnimationEnd',
      MozAnimation: 'mozAnimationEnd',
      WebkitAnimation: 'webkitAnimationEnd'
    };

    for (var key in animations) {
      if (div.style[key] !== undefined) {
        return animations[key];
      }
    }
  }(div));

  var get = {}, has = {}, add = {}, rem = {};

  get.dataset = function (elem) {
    return fpc.prop(elem, 'dataset');
  };

  get.animation = function (elem) {
    return fpc.pipe(elem)
      .into(get.dataset)
      .then(fpc.prop, 'animation')
      .end;
  };

  has.dataset = function (elem) {
    return get.dataset(elem) != null;
  };

  has.animation = function (elem) {
    var animation = get.animation(elem);

    return fpc.is.str(animation) && animation.length > 0;
  };

  /*
   * [ 'class1 class2', 'class3' ] => [ 'class1', 'class2', 'class3' ]
   */
  function splitClasses (classes) {
    return fpc.reduce(classes, function (acc, cl) {
      return acc.concat(cl.split(' '));
    }, []);
  }

  function toArray (val) {
    return fpc.is.reduceable(val) ? fpc.slice(val) : [ val ];
  }

  add.class = function (elems) {
    var classes = fpc.slice(arguments, 1);

    toArray(elems).forEach(function (elem) {
      classList.add.apply(elem.classList, splitClasses(classes));
    });

    return elems;
  };

  rem.class = function (elems) {
    var classes = fpc.slice(arguments, 1);

    toArray(elems).forEach(function (elem) {
      classList.remove.apply(elem.classList, splitClasses(classes));
    });

    return elems;
  };

  function hide (elems) {
    toArray(elems).forEach(function (elem) {
      elem.style.visibility = 'hidden';
    });

    return elems;
  }

  function show (elems) {
    toArray(elems).forEach(function (elem) {
      elem.style.visibility = '';
    });

    return elems;
  }

  function animate (elem) {
    if (fpc.is.reduceable(elem)) {
      fpc.forEach(elem, animate);
      return elem;
    }

    var animation = get.animation(elem);

    if (has.animation(elem)) {
      add.class(elem, 'animated', animation);

      elem.addEventListener(animationEnd, function () {
        rem.class(elem, animation);
      });
    }

    return elem;
  }

  var scrollHandlerStarted = false;

  var checkScheduled = false;

  var toAnimateOnScroll = [];

  function isVisible (elem) {
    var elemRect = elem.getBoundingClientRect();

    return elemRect.top < window.innerHeight && elemRect.bottom > 0;
  }

  function animateVisibleElems () {
    var elems = fpc.reduce(toAnimateOnScroll, function (acc, elem) {
      isVisible(elem) ? acc.visible.push(elem) : acc.nonVisible.push(elem);

      return acc;
    }, { visible: [], nonVisible: [] });

    fpc.pipe(elems.visible)
      .into(show)
      .then(animate);

    toAnimateOnScroll = elems.nonVisible;

    checkScheduled = false;
  }

  function scrollHandler () {
    if (!checkScheduled) {
      if (toAnimateOnScroll.length > 0) {
        setTimeout(animateVisibleElems, 300);

        checkScheduled = true;
      } else {
        window.removeEventListener('scroll', scrollHandler, false);
      }
    }
  }

  function startScrollHandler () {
    scrollHandlerStarted = true;

    window.addEventListener('scroll', scrollHandler, false);

    animateVisibleElems();
  }

  animate.onScroll = function (elems) {
    var toAdd = fpc.pipe(elems)
      .into(toArray)
      .then(hide)
      .end;

    toAnimateOnScroll = toAnimateOnScroll.concat(toAdd);

    if (toAnimateOnScroll.length > 0 && !scrollHandlerStarted) {
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
