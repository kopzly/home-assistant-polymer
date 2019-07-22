export function checkForGaplux() {
  return (
    location.hostname.toLowerCase().startsWith("lux1") ||
    location.port == "8234"
  );
}

export function changeText(loc) {
  document.title = "Gaplux";
  let tabIconElement = document.querySelector("link[rel*='icon']");
  let newhHref = "/static/icons/Gaplux-favicon.png";
  // let newhHref = 'http://gapit.io/mail/logo.png'
  if (tabIconElement) {
    tabIconElement.setAttribute("href", newhHref);
  }
  let names = [".header", ".title"];
  let oldLoc;
  while (loc !== oldLoc) {
    for (let name of names) {
      let elements = loc.querySelectorAll(`* /deep/ ${name}`);
      for (let element of elements) {
        element.innerHTML =
          name == ".header"
            ? '<img src="http://gapit.io/mail/logo.png" height="52" />Gaplux'
            : "Gaplux";
      }
    }
    oldLoc = loc;
    loc =
      loc.shadowRoot === undefined || loc.shadowRoot === 0
        ? loc
        : loc.shadowRoot;
  }
}
