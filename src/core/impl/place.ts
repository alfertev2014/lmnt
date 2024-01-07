import { type PlaceholderImpl } from "./placeholder.js"

export class ParentNodePlace {
  parent: ParentNode
  constructor(parent: ParentNode) {
    this.parent = parent
  }
}

export type DOMPlace = Node | ParentNodePlace

export abstract class PlaceholderNode {
  abstract lastPlaceNode(): DOMPlace
}

export class ParentPlaceholderPlace extends PlaceholderNode {
  parent: PlaceholderImpl
  constructor(parent: PlaceholderImpl) {
    super()
    this.parent = parent
  }

  lastPlaceNode(): DOMPlace {
    return lastPlaceNode(this.parent._place)
  }
}

export type Place = DOMPlace | PlaceholderNode

export const lastPlaceNode = (place: Place): DOMPlace => {
  if (place instanceof PlaceholderNode) {
    return place.lastPlaceNode()
  } else {
    return place
  }
}

export const renderNode = <T extends Node>(place: Place, node: T): T => {
  const domPlace = lastPlaceNode(place)
  if (domPlace instanceof Node) {
    if (domPlace.parentNode != null) {
      return domPlace.parentNode.insertBefore(node, domPlace.nextSibling)
    } else {
      throw new Error("Place DOM node has no parent")
    }
  } else {
    return domPlace.parent.insertBefore(node, domPlace.parent.firstChild)
  }
}

export const unrenderNodes = (place: Place, lastPlace: Place): void => {
  const lastDomPlace: DOMPlace | null = lastPlaceNode(lastPlace)
  if (lastDomPlace != null && lastDomPlace instanceof Node) {
    let lastDomNode: Node | null = lastDomPlace
    const firstDomPlace = place != null ? lastPlaceNode(place) : null
    const firstDomNode = firstDomPlace instanceof Node ? firstDomPlace : null
    while (lastDomNode != null && lastDomNode !== firstDomNode) {
      const toRemove = lastDomNode
      lastDomNode = lastDomNode.previousSibling
      toRemove.parentNode?.removeChild(toRemove)
    }
  }
}

export const takeNodes = (place: Place, lastPlace: Place): DocumentFragment => {
  const lastDomPlace: DOMPlace | null = lastPlaceNode(lastPlace)
  const fragment = document.createDocumentFragment()
  if (lastDomPlace != null && lastDomPlace instanceof Node) {
    let lastDomNode: Node | null = lastDomPlace
    const firstDomPlace = place != null ? lastPlaceNode(place) : null
    const firstDomNode = firstDomPlace instanceof Node ? firstDomPlace : null
    while (lastDomNode != null && lastDomNode !== firstDomNode) {
      const toRemove = lastDomNode
      lastDomNode = lastDomNode.previousSibling
      if (toRemove.parentNode != null) {
        fragment.prepend(toRemove.parentNode.removeChild(toRemove))
      }
    }
  }
  return fragment
}
