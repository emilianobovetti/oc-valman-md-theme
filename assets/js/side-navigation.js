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

  headingElements.forEach(function (heading) {
    sideNavigationElement.appendChild(createNavigationElement(heading));
  });
}());
