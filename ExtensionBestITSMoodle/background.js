function injectHTML() {
  chrome.tabs.executeScript(null, {
    code: `
    var loadingElement = document.createElement('div');
    loadingElement.style.position = 'fixed';
    loadingElement.style.top = '0';
    loadingElement.style.left = '0';
    loadingElement.style.width = '100%';
    loadingElement.style.height = '100%';
    loadingElement.style.background = '#eef5f9';
    loadingElement.style.zIndex = '10000';
    loadingElement.style.display = 'flex';
    loadingElement.style.justifyContent = 'center';
    loadingElement.style.alignItems = 'center';
    loadingElement.style.fontSize = '24px';
    loadingElement.style.color = '#000';
    loadingElement.id = 'LoadingScreen';
    loadingElement.textContent = 'Cargando y Mejorando...';
    
    document.body.insertAdjacentElement('beforeend', loadingElement);
    var loadingTimeoutScript = document.createElement('script');
    loadingTimeoutScript.textContent = \`
      var loadingTimeout = setTimeout(function() {
        var loadingScreen = document.getElementById('LoadingScreen');
        if (loadingScreen) {
          loadingScreen.remove();
        }
      }, 3000);
      \`;
    loadingElement.appendChild(loadingTimeoutScript);
    `
  });
}

function httpFailedMsg(url, inject, msg) {
  inject(`console.error(\`Resource:${esc(url)} load failed. (${esc(msg)})\`)`);
}

function esc(str) {
  return str.replace("`", "\\\`");
}

function handleHttp(url, xhr, inject) {
  if (xhr.status !== 200) {
    httpFailedMsg(url, inject, xhr.statusText);
    return;
  }

  let mime = xhr.getResponseHeader("Content-Type");
  if (!mime || !mime.startsWith("application/javascript")) {
    inject(`console.warn(\`Resource:${esc(url)} (${esc(mime)}) is not JS type.\`)`);
  }

  inject(`console.info(\`JS file:${esc(url)} is loaded.\`)`);
  inject(xhr.responseText);
}

function loadScript(url, inject, e) {
  var xhr = new XMLHttpRequest();
  try {
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Cache-Control", "max-age=" + (8 * 60 * 60));
  } catch (err) {
    let msg = err.stack.split("\n")[0];
    httpFailedMsg(url, inject, msg);
    DeleteScreen(e);
  }

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      handleHttp(url, xhr, inject);
    }
    DeleteScreen(e);
  };
  xhr.send();
}

function isNormalUrl(url) {
  if (url.startsWith("https://www.google.com/_/chrome/newtab")) {
    return false;
  }

  return true;
}

function DeleteScreen(e) {
  chrome.tabs.executeScript(e.tabId, {
    matchAboutBlank: true,
    frameId: e.frameId,
    code: "setTimeout(function() {var loadingElement = document.querySelector('#LoadingScreen');if (loadingElement) {  loadingElement.remove();}}, 200);"
  });
}

function onCompletedEvent(e) {
  function injectCode(code) {
    chrome.tabs.executeScript(e.tabId, {
      matchAboutBlank: true,
      frameId: e.frameId,
      code: code,
    });
  }

  chrome.storage.local.get("config", function (data) {
    if (typeof data.config === "undefined") {
      return;
    }

    if (!data.config.enabled) {
      return;
    }

    if (!data.config.localstamp) {
      // Obtener el tiempo local actual en segundos
      const currentTimeStamp = Math.floor(Date.now() / 1000);
      data.config.localstamp = currentTimeStamp;

      // Actualizar la configuración en chrome.storage.local con el nuevo localstamp
      chrome.storage.local.set({ config: data.config }, function () {
        console.log('localstamp actualizado en la configuración:', currentTimeStamp);
      });
    }

    chrome.webNavigation.getFrame(
      {
        tabId: e.tabId,
        frameId: 0, // top frame
      },
      function (info) {
        if (isNormalUrl(info.url) && info.url.includes("its-virtual.ceti.mx")) {
          loadScript(`https://raw.githubusercontent.com/guillermazo/BestITSMoodle/main/main.js?v=${data.config.localstamp}`, injectCode, e);
        }
      }
    );
  });
}

function LoadingContent() {
  chrome.storage.local.get("config", function (data) {
    if (typeof data.config === "undefined") {
      return;
    }

    if (!data.config.enabled) {
      return;
    }
    injectHTML();
  });
}

chrome.webNavigation.onCompleted.addListener(onCompletedEvent, {
  url: [
    { hostEquals: "its-virtual.ceti.mx" },
  ],
});

chrome.webNavigation.onDOMContentLoaded.addListener(LoadingContent, {
  url: [
    { hostEquals: "its-virtual.ceti.mx" },
  ],
});


chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  if (details.url.includes("its-virtual.ceti.mx")) {
    injectHTML();
  }
}, { url: [{ hostEquals: "its-virtual.ceti.mx" }] });