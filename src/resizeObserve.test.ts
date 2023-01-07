import {addStylesheetRule} from 'src/test/helpers'

if (typeof window !== 'undefined') {
  describe('resizeObserve', function () {
    class ResizeObservedDiv {
      div: HTMLElement
      class: string
      cssRule: CSSStyleRule

      constructor({
        container,
        width,
        height,
      }: {
        container: HTMLElement
        width: number,
        height: number,
      }) {
        this.class = 'class-' + Math.random().toString(36).replace(/./g, '')
        this.div = document.createElement('div')
        this.div.classList.add(this.class)
        this.cssRule = addStylesheetRule(
          `.${this.class}`,
          `width: ${width}px; height: ${height}px;`,
        )
        container.appendChild(this.div)
      }

      get width() {
        return this.div.offsetWidth
      }
      set width(value: number) {
        this.cssRule.style.width = value + 'px'
      }

      get height() {
        return this.div.offsetHeight
      }
      set height(value: number) {
        this.cssRule.style.height = value + 'px'
      }
    }

    it('base', function () {
      const resizeObservedDiv = new ResizeObservedDiv({
        container: document.body,
        width    : 123,
        height   : 234,
      })
      assert.strictEqual(resizeObservedDiv.width, 123)
      assert.strictEqual(resizeObservedDiv.height, 234)

      resizeObservedDiv.width = 23
      assert.strictEqual(resizeObservedDiv.width, 23)

      resizeObservedDiv.height = 34
      assert.strictEqual(resizeObservedDiv.height, 34)

      resizeObservedDiv.width = 0
      assert.strictEqual(resizeObservedDiv.width, 0)

      resizeObservedDiv.height = 0
      assert.strictEqual(resizeObservedDiv.height, 0)
    })
  })
}
