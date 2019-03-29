(function () {
  function createNavigationElement (headingElement) {
    var item = document.createElement('li');
    var link = document.createElement('a');
    var text = document.createTextNode(headingElement.textContent);

    link.appendChild(text);
    item.appendChild(link);

    link.classList.add('pointer-on-hover');

    link.addEventListener('click', function (event) {
      element.scrollTo(headingElement);
    });

    return item;
  }

  var sideNavigationElement = document.getElementById('side-navigation');

  var headingElements = document.querySelectorAll('h1, h2, h3, h4');
  var navigationElements = [];

  headingElements.forEach(function (heading) {
    var navigationElement = createNavigationElement(heading);

    navigationElements.push(navigationElement);
    sideNavigationElement.appendChild(navigationElement);
  });

  function inViewportIndex (elems) {
    for (var index = 0; index < elems.length; index++) {
      if (element.isInViewport(elems[index])) {
        return index;
      }
    }

    return -1
  }

  function setActiveNavigationElement () {
    var activeIndex = inViewportIndex(headingElements);

    if (activeIndex < 0) return;

    for (var index = 0; index < navigationElements.length; index++) {
      link = navigationElements[index].querySelector('a');

      if (index === activeIndex) {
        element.add.class(link, 'active');
      } else {
        element.rem.class(link, 'active');
      }
    }
  }

  setActiveNavigationElement();

  function scrollHandler () {
    // TODO: check timestamp
    setActiveNavigationElement();
  }

  window.addEventListener('scroll', scrollHandler, false);

  M.Pushpin.init(sideNavigationElement, { top: 90 });
}());
