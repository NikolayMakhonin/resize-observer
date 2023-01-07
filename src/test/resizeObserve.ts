import {resizeSensorFactory} from './resizeSensor'

export function resizeObserve(element: HTMLElement, onResize: () => void): () => void {
  let observer = resizeSensorFactory.create(element, onResize)
  return () => {
    if (observer) {
      observer.destroy()
      observer = null
    }
  }
}
