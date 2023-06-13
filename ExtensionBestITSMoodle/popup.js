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

    elEnable.addEventListener('change', function() {
        data.config.enabled = elEnable.checked;
        setConfig(data);
        updateUrlState();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('config', function(data) {
        initUI(data);
    });
});