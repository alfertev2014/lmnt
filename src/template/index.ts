import { dce, setAttr, type ScalarValue, txt } from "../dom/helpers.js"
import {
  type PlaceholderList,
  type Placeholder,
  type PlaceholderContext,
  type Place,
  placeAtBeginningOf,
  type PlaceholderComponent,
  createChildPlaceholderAt,
  createListAt,
  insertNodeAt,
} from "../core/index.js"

export type ElementHandler = (element: HTMLElement) => void
export type AttributeHandler = (attr: string, element: HTMLElement, context: PlaceholderContext) => void

export type TemplateElementAttrsMap = Record<string, ScalarValue | AttributeHandler>

export const el =
  (tag: string, attrs: TemplateElementAttrsMap | null = null, ...handlers: ElementHandler[]) =>
  (...children: TemplateContent[]): PlaceholderComponent =>
  (place, context) => {
    const element = dce(tag)

    renderTemplateContent(placeAtBeginningOf(element), context, children)

    if (attrs != null) {
      for (const [name, value] of Object.entries(attrs)) {
        if (typeof value === "function") {
          value(name, element, context)
        } else {
          setAttr(element, name, value)
        }
      }
    }

    insertNodeAt(place, element)

    for (const handler of handlers) {
      handler(element)
    }
    return element
  }

export const plh =
  (content: TemplateContent, handler?: (placeholder: Placeholder) => void): PlaceholderComponent =>
  (place, context) => {
    const res = createChildPlaceholderAt(place, context, fr(content))
    handler?.(res)
    return res
  }

export const list =
  (contents: TemplateContent[], handler?: (list: PlaceholderList) => void): PlaceholderComponent =>
  (place, context) => {
    const list = createListAt(place, context, contents.map(fr))
    handler?.(list)
    return list
  }

export type TemplateItem = ScalarValue | PlaceholderComponent

export type TemplateContent = TemplateContent[] | TemplateItem

const renderTemplateContent = (place: Place, context: PlaceholderContext, content: TemplateContent): Place => {
  if (typeof content === "boolean" || content == null) {
    return place
  }
  if (typeof content === "string") {
    place = insertNodeAt(place, txt(content))
  } else if (typeof content === "number") {
    place = insertNodeAt(place, txt(content.toString()))
  } else if (typeof content === "function") {
    place = content(place, context)
  } else if (Array.isArray(content)) {
    for (const item of content) {
      place = renderTemplateContent(place, context, item)
    }
  }
  return place
}

export const fr =
  (...content: TemplateContent[]): PlaceholderComponent =>
  (place, context) => {
    return renderTemplateContent(place, context, content)
  }

export const on: (...args: Parameters<HTMLElement["addEventListener"]>) => ElementHandler =
  (event, listener, options) => (element) => {
    element.addEventListener(event, listener, options)
  }

export interface TemplateRef<T> {
  current: T
  bind: () => (value: T) => void
}

export const ref = <T>(initValue: T): TemplateRef<T> => ({
  current: initValue,
  bind() {
    return (value: T) => {
      this.current = value
    }
  },
})
