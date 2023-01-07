!function(e){"use strict"
;e.resizeObserve=function(e,t){
var i=window.getComputedStyle(e).position
;"relative"!==i&&"absolute"!==i&&"fixed"!==i&&"sticky"!==i&&(e.style.position="relative")
;var n,o=!1
;return(n=window.document.createElement("iframe")).setAttribute("aria-hidden","true"),
n.setAttribute("tabindex","-1"),
n.setAttribute("src","about:blank"),n.setAttribute("style","display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;"),
n.onload=function(){
n.contentWindow.onresize=function(){t(e)
},o=!0,t(e)},e.appendChild(n),o||t(e),function(){
n&&(null==n||n.remove(),n=null)}
},Object.defineProperty(e,"__esModule",{value:!0})
}({});
