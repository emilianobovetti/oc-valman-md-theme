(function (root, factory) {

  root.element = factory();

}(this, function () {
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
  })(document.createElement('div'));

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

  function collectionHandler (collection, action, classes) {
    fpc.forEach(collection, function (elem) {
      action.apply(null, fpc.unshift(classes, elem));
    });
  }

  add.class = function (elem) {
    var classes = fpc.slice(arguments, 1);

    fpc.is.reduceable(elem)
      ? collectionHandler(elem, add.class, classes)
      : elem.classList.add.apply(elem.classList, splitClasses(classes));

    return elem;
  };

  rem.class = function (elem) {
    var classes = fpc.slice(arguments, 1);

    fpc.is.reduceable(elem)
      ? collectionHandler(elem, rem.class, classes)
      : elem.classList.remove.apply(elem.classList, splitClasses(classes));

    return elem;
  };

  function hide (elem) {
    return add.class(elem, 'hide');
  }

  function show (elem) {
    return rem.class(elem, 'hide');
  }

  function animate (elem) {
    var animation = get.animation(elem);

    if (has.animation(elem)) {
      add.class(elem, 'animated', animation);

      elem.addEventListener(animationEnd, function () {
        rem.class(elem, animation);
      });
    }

    return elem;
  }

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
