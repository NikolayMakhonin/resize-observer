/* eslint-disable func-names */
const css = typeof window === 'undefined' ? null : (function (global) {
  'use strict'

  /** @var {null|Object} */
  let animationPropertiesForBrowser = null
  /** @var {null|boolean} */
  let isCssAnimationSupported = null

  /**
   * Determines which style convention (properties) to follow
   * @see https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Using_CSS_animations/Detecting_CSS_animation_support
   * @returns {{keyframesRule: string, styleDeclaration: string, animationStartEvent: string, animationName: string}}
   */
  function getAnimationPropertiesForBrowser() {
    if (animationPropertiesForBrowser !== null) {
      return animationPropertiesForBrowser
    }

    const testElement = global.document.createElement('div')
    const supportsUnprefixedAnimationProperties = ('animationName' in testElement.style)

    // Unprefixed animation properties
    let animationStartEvent = 'animationstart'
    const animationName = 'resizeanim'

    if (supportsUnprefixedAnimationProperties) {
      return {
        keyframesRule      : '@keyframes ' + animationName + ' {from { opacity: 0; } to { opacity: 0; }}',
        styleDeclaration   : 'animation: 1ms ' + animationName + ';',
        animationStartEvent: animationStartEvent,
        animationName      : animationName,
      }
    }

    // Browser specific animation properties
    let keyframePrefix = ''
    const browserPrefixes = ['Webkit', 'Moz', 'O', 'ms']
    const startEvents = ['webkitAnimationStart', 'animationstart', 'oAnimationStart', 'MSAnimationStart']

    let i
    const l = browserPrefixes.length

    for (i = 0; i < l; i++) {
      if ((browserPrefixes[i] + 'AnimationName') in testElement.style) {
        keyframePrefix = '-' + browserPrefixes[i].toLowerCase() + '-'
        animationStartEvent = startEvents[i]
        break
      }
    }

    animationPropertiesForBrowser = {
      keyframesRule      : '@' + keyframePrefix + 'keyframes ' + animationName + ' {from { opacity: 0; } to { opacity: 0; }}',
      styleDeclaration   : keyframePrefix + 'animation: 1ms ' + animationName + ';',
      animationStartEvent: animationStartEvent,
      animationName      : animationName,
    }
    return animationPropertiesForBrowser
  }

  /**
   * @returns {boolean}
   */
  function isCSSAnimationSupported() {
    if (isCssAnimationSupported !== null) {
      return isCssAnimationSupported
    }

    const testElement = global.document.createElement('div')
    const isAnimationSupported = ('animationName' in testElement.style)

    if (isAnimationSupported) {
      isCssAnimationSupported = true
      return isCssAnimationSupported
    }

    const browserPrefixes = 'Webkit Moz O ms'.split(' ')
    let i = 0
    const l = browserPrefixes.length

    for (; i < l; i++) {
      if ((browserPrefixes[i] + 'AnimationName') in testElement.style) {
        isCssAnimationSupported = true
        return isCssAnimationSupported
      }
    }

    isCssAnimationSupported = false
    return isCssAnimationSupported
  }

  /**
   * Adds a style block that contains CSS essential for detecting resize events
   */
  function insertResizeSensorStyles() {
    let cssRules = [
      (getAnimationPropertiesForBrowser().keyframesRule) ? getAnimationPropertiesForBrowser().keyframesRule : '',
      '.ResizeSensor__resizeTriggers { ' + ((getAnimationPropertiesForBrowser().styleDeclaration) ? getAnimationPropertiesForBrowser().styleDeclaration : '') + ' visibility: hidden; opacity: 0; }',
      '.ResizeSensor__resizeTriggers, .ResizeSensor__resizeTriggers > div, .ResizeSensor__contractTrigger:before { content: \' \'; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .ResizeSensor__resizeTriggers > div { background: #eee; overflow: auto; } .ResizeSensor__contractTrigger:before { width: 200%; height: 200%; }',
    ]
    cssRules = cssRules.join(' ')

    const headElem = global.document.head || global.document.getElementsByTagName('head')[0]

    const styleElem = global.document.createElement('style')
    styleElem.type = 'text/css'

    if (styleElem.styleSheet) {
      styleElem.styleSheet.cssText = cssRules
    }
    else {
      styleElem.appendChild(global.document.createTextNode(cssRules))
    }

    headElem.appendChild(styleElem)
  }

  return {
    insertResizeSensorStyles        : insertResizeSensorStyles,
    isAnimationSupported            : isCSSAnimationSupported,
    getAnimationPropertiesForBrowser: getAnimationPropertiesForBrowser,
  }
})(window)
const getStyle = typeof window === 'undefined' ? null : (function (global) {
  'use strict'

  /**
   * @param {HTMLElement} element
   * @param {string} property
   * @returns {null|string}
   */
  return function (element, property) {
    if (!('currentStyle' in element) && !('getComputedStyle' in global)) {
      return null
    }

    if (element.currentStyle) {
      return element.currentStyle[property]
    }

    return global.document.defaultView.getComputedStyle(element, null).getPropertyValue(property)
  }
})(window)
const polyfill = typeof window === 'undefined' ? null : (function (global) {
  'use strict'

  /**
   * @see https://gist.github.com/mrdoob/838785
   */
  function polyfillRequestAnimationFrame() {
    if (!global.requestAnimationFrame) {
      global.requestAnimationFrame = (function () {
        return global.webkitRequestAnimationFrame
          || global.mozRequestAnimationFrame
          || global.oRequestAnimationFrame
          || global.msRequestAnimationFrame
          || function (callback) {
            global.setTimeout(callback, 1000 / 60)
          }
      })()
    }

    if (!global.cancelAnimationFrame) {
      global.cancelAnimationFrame = (function () {
        return global.webkitCancelAnimationFrame
          || global.mozCancelAnimationFrame
          || global.oCancelAnimationFrame
          || global.msCancelAnimationFrame
          || global.clearTimeout
      })()
    }
  }

  return {
    requestAnimationFrame: polyfillRequestAnimationFrame,
  }
})(window)
export const resizeSensorFactory = typeof window === 'undefined' ? null : (function (global) {
  'use strict'

  /**
   * @param {HTMLElement} targetElement
   * @param {Function} callback
   * @constructor
   */
  const resizeSensor = function (targetElement, callback) {
    /** @var {HTMLElement} */
    this.targetElement = targetElement
    /** @var {Function} */
    this.callback = callback
    /** @var {{width: int, height: int}} */
    this.dimensions = {
      width : 0,
      height: 0,
    }
    if ('attachEvent' in global.document) {
      this.boundOnResizeHandler = this.onElementResize.bind(this)
      this.targetElement.attachEvent('onresize', this.boundOnResizeHandler)
      return
    }

    /** @var {{container: HTMLElement, expand: HTMLElement, expandChild: HTMLElement, contract: HTMLElement}} */
    this.triggerElements = {}
    /** @var {int} */
    this.resizeRAF = 0

    this.setup()
  }

  resizeSensor.prototype.setup = function () {
    // Make sure the target element is "positioned"
    if (getStyle(this.targetElement, 'position') === 'static') {
      this.targetElement.style.position = 'relative'
    }

    // Create and append resize trigger elements
    this.insertResizeTriggerElements()

    // Start listening to events
    this.boundScrollListener = this.handleElementScroll.bind(this)
    this.targetElement.addEventListener('scroll', this.boundScrollListener, true)

    if (css.isAnimationSupported()) {
      this.boundAnimationStartListener = this.resetTriggersOnAnimationStart.bind(this)
      this.triggerElements.container.addEventListener(
        css.getAnimationPropertiesForBrowser().animationStartEvent,
        this.boundAnimationStartListener,
      )
    }

    // Initial value reset of all triggers
    this.resetTriggers()
  }

  resizeSensor.prototype.insertResizeTriggerElements = function () {
    const resizeTrigger = global.document.createElement('div')
    const expandTrigger = global.document.createElement('div')
    const expandTriggerChild = global.document.createElement('div')
    const contractTrigger = global.document.createElement('div')

    resizeTrigger.className = 'ResizeSensor ResizeSensor__resizeTriggers'
    expandTrigger.className = 'ResizeSensor__expandTrigger'
    contractTrigger.className = 'ResizeSensor__contractTrigger'

    expandTrigger.appendChild(expandTriggerChild)
    resizeTrigger.appendChild(expandTrigger)
    resizeTrigger.appendChild(contractTrigger)

    this.triggerElements.container = resizeTrigger
    this.triggerElements.expand = expandTrigger
    this.triggerElements.expandChild = expandTriggerChild
    this.triggerElements.contract = contractTrigger

    this.targetElement.appendChild(resizeTrigger)
  }

  resizeSensor.prototype.onElementResize = function () {
    const currentDimensions = this.getDimensions()

    if (this.isResized(currentDimensions)) {
      this.dimensions.width = currentDimensions.width
      this.dimensions.height = currentDimensions.height
      this.elementResized()
    }
  }

  resizeSensor.prototype.handleElementScroll = function () {
    const _this = this

    this.resetTriggers()

    if (this.resizeRAF) {
      global.cancelAnimationFrame(this.resizeRAF)
    }

    this.resizeRAF = global.requestAnimationFrame(function () {
      const currentDimensions = _this.getDimensions()
      if (_this.isResized(currentDimensions)) {
        _this.dimensions.width = currentDimensions.width
        _this.dimensions.height = currentDimensions.height
        _this.elementResized()
      }
    })
  }

  /**
   * @param {{width: number, height: number}} currentDimensions
   * @returns {boolean}
   */
  resizeSensor.prototype.isResized = function (currentDimensions) {
    return (currentDimensions.width !== this.dimensions.width || currentDimensions.height !== this.dimensions.height)
  }

  /**
   * @returns {{width: number, height: number}}
   */
  resizeSensor.prototype.getDimensions = function () {
    return {
      width : this.targetElement.offsetWidth,
      height: this.targetElement.offsetHeight,
    }
  }

  /**
   * @param {Event} event
   */
  resizeSensor.prototype.resetTriggersOnAnimationStart = function (event) {
    if (event.animationName === css.getAnimationPropertiesForBrowser().animationName) {
      this.resetTriggers()
    }
  }

  resizeSensor.prototype.resetTriggers = function () {
    this.triggerElements.contract.scrollLeft = this.triggerElements.contract.scrollWidth
    this.triggerElements.contract.scrollTop = this.triggerElements.contract.scrollHeight
    this.triggerElements.expandChild.style.width = this.triggerElements.expand.offsetWidth + 1 + 'px'
    this.triggerElements.expandChild.style.height = this.triggerElements.expand.offsetHeight + 1 + 'px'
    this.triggerElements.expand.scrollLeft = this.triggerElements.expand.scrollWidth
    this.triggerElements.expand.scrollTop = this.triggerElements.expand.scrollHeight
  }

  resizeSensor.prototype.elementResized = function () {
    this.callback(this.dimensions)
  }

  resizeSensor.prototype.destroy = function () {
    this.removeEventListeners()
    this.targetElement.removeChild(this.triggerElements.container)
    delete this.boundAnimationStartListener
    delete this.boundScrollListener
    delete this.callback
    delete this.targetElement
  }

  resizeSensor.prototype.removeEventListeners = function () {
    if ('attachEvent' in global.document) {
      this.targetElement.detachEvent('onresize', this.boundOnResizeHandler)
      return
    }

    this.triggerElements.container.removeEventListener(
      css.getAnimationPropertiesForBrowser().animationStartEvent,
      this.boundAnimationStartListener,
    )
    this.targetElement.removeEventListener('scroll', this.boundScrollListener, true)
  }

  return {
    /**
     * @param {Element} targetElement
     * @param {Function} callback
     * @returns {resizeSensor}
     */
    create: function (targetElement, callback) {
      return new resizeSensor(targetElement, callback)
    },
  }
})(window)
const sensors = typeof window === 'undefined' ? null : (function (global) {
  'use strict'

  /** {array} */
  const unsuitableElements = ['IMG', 'COL', 'TR', 'THEAD', 'TFOOT']
  /** {boolean} */
  const supportsAttachEvent = ('attachEvent' in global.document)

  /** {{}} Map of all resize sensors (id => ResizeSensor) */
  const allResizeSensors = {}

  if (!supportsAttachEvent) {
    css.insertResizeSensorStyles()

    if (!('requestAnimationFrame' in global) || !('cancelAnimationFrame' in global)) {
      polyfill.requestAnimationFrame()
    }
  }

  /**
   * @param {Element} targetElement
   * @param {Function} callback
   * @returns {resizeSensor}
   */
  function create(targetElement, callback) {
    if (isUnsuitableElement(targetElement)) {
      console && console.error("Given element isn't suitable to act as a resize sensor. Try wrapping it with one that is. Unsuitable elements are:", unsuitableElements)
      return null
    }

    const sensorId = getSensorId(targetElement)

    if (allResizeSensors[sensorId]) {
      return allResizeSensors[sensorId]
    }

    const sensor = resizeSensorFactory.create(targetElement, callback)
    allResizeSensors[sensorId] = sensor
    return sensor
  }

  /**
   * @param {Element} targetElement
   */
  function destroy(targetElement) {
    const sensorId = getSensorId(targetElement)
    const sensor = allResizeSensors[sensorId]

    if (!sensor) {
      console && console.error("Can't destroy ResizeSensor (404 not found).", targetElement)
    }

    sensor.destroy()
    delete allResizeSensors[sensorId]
  }

  /**
   * @param {Element} targetElement
   * @returns {string}
   */
  function getSensorId(targetElement) {
    return targetElement.id
  }

  /**
   * @param {HTMLElement} targetElement
   * @returns {boolean}
   */
  function isUnsuitableElement(targetElement) {
    const tagName = targetElement.tagName.toUpperCase()
    return (unsuitableElements.indexOf(tagName) > -1)
  }

  return {
    create : create,
    destroy: destroy,
  }
})(window)
