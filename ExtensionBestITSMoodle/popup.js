function setConfig(data) {
    chrome.storage.local.set(data);
}

function initUI(data) {
    if (typeof data.config === 'undefined') {
        data.config = {
            url: 'http://127.0.0.1:8000/hello.js',
            enabled: false
        };
    }

    let cfg = data.config;
    let elEnable = document.getElementById('enabled');

    function updateUrlState() {
        toDisable = !elEnable.checked;
    }

    elEnable.checked = cfg.enabled;
    updateUrlState();

    elEnable.addEventListener('change', function () {
        data.config.enabled = elEnable.checked;
        setConfig(data);
        updateUrlState();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get('config', function (data) {
        initUI(data);
    });
    document.getElementById('clearCacheButton').addEventListener('click', function () {
        const newLocalstamp = Math.floor(Date.now() / 1000); // Tiempo local en segundos

        // Actualizar el valor de localstamp en la configuración de chrome.storage.local
        chrome.storage.local.get('config', function (data) {
            const config = data.config || {};
            config.localstamp = newLocalstamp;

            // Guardar la configuración actualizada en chrome.storage.local
            chrome.storage.local.set({ config: config }, function () {
                console.log('localstamp actualizado en la configuración:', newLocalstamp);
            });
            // Recargar la página actual
            chrome.tabs.reload();
        });
    });
});