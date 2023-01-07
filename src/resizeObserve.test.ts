import {addStylesheetRule} from 'src/test/helpers'
import {resizeObserve} from 'src/resizeObserve'
import {delay} from '@flemist/async-utils'

if (typeof window !== 'undefined') {
  describe('resizeObserve', function () {
    this.timeout(60000)

    let nextClassId = 0
    class ResizeObservedDiv {
      div: HTMLElement
      class: string
      cssRule: CSSStyleRule

      constructor({
        container,
        width,
        height,
        onResize,
      }: {
        container: HTMLElement
        width: number,
        height: number,
        onResize: () => void
      }) {
        this.class = 'class-' + nextClassId++
        this.div = document.createElement('div')
        this.div.classList.add(this.class)
        this.cssRule = addStylesheetRule(
          `.${this.class}`,
          `width: ${width}px; height: ${height}px;`,
        )
        container.appendChild(this.div)
        resizeObserve(this.div, onResize)
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

    async function _delay() {
      await delay(0)
      await delay(0)
      await delay(0)
      await delay(0)
    }

    it('base', async function () {
      for (let i = 0; i < 10; i++) {
        let onResizeCount = 0
        const resizeObservedDiv = new ResizeObservedDiv({
          container: document.body,
          width    : 100 + i,
          height   : 200 + i,
          onResize() {
            onResizeCount++
          },
        })
        assert.strictEqual(onResizeCount, 1)
        onResizeCount = 0
        assert.strictEqual(resizeObservedDiv.width, 100 + i)
        assert.strictEqual(resizeObservedDiv.height, 200 + i)

        resizeObservedDiv.width = 20 + i
        assert.strictEqual(onResizeCount, 0)
        assert.strictEqual(resizeObservedDiv.width, 20 + i)
        assert.strictEqual(resizeObservedDiv.height, 200 + i)

        resizeObservedDiv.height = 30 + i
        assert.strictEqual(onResizeCount, 0)
        assert.strictEqual(resizeObservedDiv.width, 20 + i)
        assert.strictEqual(resizeObservedDiv.height, 30 + i)

        resizeObservedDiv.width = 0
        assert.strictEqual(onResizeCount, 0)
        assert.strictEqual(resizeObservedDiv.width, 0)
        assert.strictEqual(resizeObservedDiv.height, 30 + i)

        resizeObservedDiv.height = 0
        assert.strictEqual(onResizeCount, 0)
        assert.strictEqual(resizeObservedDiv.width, 0)
        assert.strictEqual(resizeObservedDiv.height, 0)

        assert.strictEqual(onResizeCount, 0)

        await _delay()
      }
    })

    it('onResize', async function () {
      for (let i = 0; i < 100; i++) {
        let onResizeCount = 0
        const resizeObservedDiv = new ResizeObservedDiv({
          container: document.body,
          width    : 100,
          height   : 200,
          onResize() {
            onResizeCount++
          },
        })
        assert.strictEqual(onResizeCount, 1)
        onResizeCount = 0
        assert.strictEqual(resizeObservedDiv.width, 100)
        assert.strictEqual(resizeObservedDiv.height, 200)
        await _delay()
        assert.strictEqual(onResizeCount, 1)
        onResizeCount = 0
        assert.strictEqual(resizeObservedDiv.width, 100)
        assert.strictEqual(resizeObservedDiv.height, 200)

        resizeObservedDiv.width = 20
        assert.strictEqual(resizeObservedDiv.width, 20)
        assert.strictEqual(resizeObservedDiv.height, 200)
        await _delay()
        assert.strictEqual(onResizeCount, 1)
        onResizeCount = 0
        assert.strictEqual(resizeObservedDiv.width, 20)
        assert.strictEqual(resizeObservedDiv.height, 200)

        resizeObservedDiv.height = 30
        assert.strictEqual(resizeObservedDiv.width, 20)
        assert.strictEqual(resizeObservedDiv.height, 30)
        await _delay()
        assert.strictEqual(onResizeCount, 1)
        onResizeCount = 0
        assert.strictEqual(resizeObservedDiv.width, 20)
        assert.strictEqual(resizeObservedDiv.height, 30)

        resizeObservedDiv.width = 0
        assert.strictEqual(resizeObservedDiv.width, 0)
        assert.strictEqual(resizeObservedDiv.height, 30)
        await _delay()
        assert.strictEqual(onResizeCount, 1)
        onResizeCount = 0
        assert.strictEqual(resizeObservedDiv.width, 0)
        assert.strictEqual(resizeObservedDiv.height, 30)

        resizeObservedDiv.height = 0
        assert.strictEqual(resizeObservedDiv.width, 0)
        assert.strictEqual(resizeObservedDiv.height, 0)
        await _delay()
        assert.strictEqual(onResizeCount, 1)
        onResizeCount = 0
        assert.strictEqual(resizeObservedDiv.width, 0)
        assert.strictEqual(resizeObservedDiv.height, 0)

        resizeObservedDiv.width = 1
        resizeObservedDiv.height = 1
        assert.strictEqual(resizeObservedDiv.width, 1)
        assert.strictEqual(resizeObservedDiv.height, 1)
        await _delay()
        assert.strictEqual(onResizeCount, 1)
        onResizeCount = 0
        assert.strictEqual(resizeObservedDiv.width, 1)
        assert.strictEqual(resizeObservedDiv.height, 1)
      }
    })
  })
}
