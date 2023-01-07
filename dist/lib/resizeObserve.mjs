function resizeObserve(node, onResize) {
    const position = window.getComputedStyle(node).position;
    if (position !== 'relative'
        && position !== 'absolute'
        && position !== 'fixed'
        && position !== 'sticky') {
        node.style.position = 'relative';
    }
    let initialized = false;
    let iframe;
    iframe = window.document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('tabindex', '-1');
    iframe.setAttribute('src', 'about:blank');
    iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
    iframe.onload = () => {
        iframe.contentWindow.onresize = () => {
            onResize(node);
        };
        initialized = true;
        onResize(node);
    };
    node.appendChild(iframe);
    if (!initialized) {
        onResize(node);
    }
    return () => {
        if (iframe) {
            iframe === null || iframe === void 0 ? void 0 : iframe.remove();
            iframe = null;
        }
    };
}

export { resizeObserve };
