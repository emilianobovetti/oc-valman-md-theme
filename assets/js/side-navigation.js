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
  var navigationLinks = [];

  headingElements.forEach(function (heading) {
    var navigationElement = createNavigationElement(heading);

    navigationLinks.push(navigationElement.querySelector('a'));
    sideNavigationElement.appendChild(navigationElement);
  });

  var checkScheduled = false;

  function setActiveLink () {
    var activeElemIdx = null;

    headingElements.forEach(function (heading, idx) {
      if (activeElemIdx == null && element.isInViewport(heading)) {
        activeElemIdx = idx;
      }
    });

    if (activeElemIdx != null) {
      navigationLinks.forEach(function (link) {
        element.rem.class(link, 'active');
      });

      element.add.class(navigationLinks[activeElemIdx], 'active');
    }

    checkScheduled = false;
  }

  function scrollHandler () {
    if (checkScheduled) {
      return;
    }

    setTimeout(setActiveLink, 200);

    checkScheduled = true;
  }

  setActiveLink();

  window.addEventListener('scroll', scrollHandler, false);

  M.Pushpin.init(sideNavigationElement, { top: 90, offset: 0 });
}());
