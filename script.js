const callbackRegister = {};
const searchInput = document.getElementById('searchInput');
const searchBtn = document.querySelector('.btn--search');
const resetBtn = document.querySelector('.btn--reset');
const container = document.querySelector('.articles');

searchBtn.addEventListener('click', clickHandler);
resetBtn.addEventListener('click', clearContainer);

function clickHandler() {
    if (!searchInput.value) return;
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${searchInput.value}&format=json`;

    scriptRequest(url, render, ifError);
    searchInput.value = '';
}

function scriptRequest(url, onSuccess, onError) {
    let scriptOk = false;
    let callbackName = 'cb' + String(Math.random()).slice(-6);

    url += ~url.indexOf('?') ? '&' : '?';
    url += `callback=callbackRegister.${callbackName}`;

    const script = document.createElement('script');

    callbackRegister[callbackName] = function (data) {
        scriptOk = true;
        delete callbackRegister[callbackName];
        script.parentNode.removeChild(script);
        onSuccess(data);
    };

    function checkCallback() {
        if (scriptOk) return;
        delete callbackRegister[callbackName];
        script.parentNode.removeChild(script);
        onError(url);
    }

    script.onreadystatechange = function () {
        if (this.readyState === 'complete' || this.readyState === 'loaded') {
            this.onreadystatechange = null;
            setTimeout(checkCallback, 0);
        }
    };

    script.onload = script.onerror = checkCallback;
    script.src = url;

    document.body.appendChild(script);
}

function render(data) {
    clearContainer();

    const fragment = document.createDocumentFragment();

    for (let i = 1; i < data[1].length; i++) {
        const item = makeItem(data[1][i], data[2][i], data[3][i]);
        fragment.appendChild(item);
    }
    container.appendChild(fragment);
}

function makeItem(elemTitle, description, linkToWiki) {
    const container = document.createElement('div');
    const title = document.createElement('h4');
    const desc = document.createElement('p');
    const link = document.createElement('a');

    title.innerText = elemTitle;
    desc.innerText = description;
    link.innerText = 'Read on Wiki';
    link.setAttribute('href', linkToWiki);
    link.setAttribute('target', '_blank');

    container.appendChild(title);
    container.appendChild(desc);
    container.appendChild(link);

    return container;
}

function clearContainer() {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

function ifError(error) {
    console.log(error);
}
