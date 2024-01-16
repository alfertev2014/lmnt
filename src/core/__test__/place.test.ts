import { describe, expect, test } from "@jest/globals"
import { lastPlaceNode, placeAtBeginningOf, type Place, insertNodeAt } from "../impl/place.js"
import { PlaceholderImpl, createRootPlaceholderAt } from "../impl/placeholder.js"

describe("Place", () => {
  describe("lastPlaceNode", () => {
    test("of DOM Node should be itself", () => {
      const node: Place = document.createElement("div")

      const domPlace = lastPlaceNode(node)

      expect(domPlace).toBe(node)
    })

    test("of ParentPlaceNode should be itself", () => {
      const node: Place = placeAtBeginningOf(document.createElement("div"))

      const domPlace = lastPlaceNode(node)

      expect(domPlace).toBe(node)
    })

    test("of empty placeholder after DOM Node should be that node", () => {
      const parent = document.createElement("div")
      const node = parent.appendChild(document.createElement("a"))

      const placeholder = new PlaceholderImpl(node, null)

      expect(lastPlaceNode(placeholder)).toBe(node)
    })

    test("of empty placeholder at beginning of DOM Node should be ParentNodePlace of that node", () => {
      const parent = document.createElement("div")
      parent.appendChild(document.createElement("a"))

      const beginning = placeAtBeginningOf(parent)
      const placeholder = new PlaceholderImpl(beginning, null)

      expect(lastPlaceNode(placeholder)).toBe(beginning)
    })
  })

  describe("Inserting DOM Nodes into place", () => {
    test("should insert DOM Node after Node place", () => {
      const parentNode = document.createElement("div")
      const beforeNode = document.createElement("div")
      parentNode.appendChild(beforeNode)
      const node = document.createElement("div")

      const insertedNode = insertNodeAt(beforeNode, node)

      expect(beforeNode.nextSibling).toBe(node)
      expect(node.previousSibling).toBe(beforeNode)
      expect(node.parentNode).toBe(parentNode)
      expect(insertedNode).toBe(node)
    })

    test("should throw error when inserting after Node without parent", () => {
      expect(() => {
        const beforeNode = document.createElement("div")
        const node = document.createElement("div")

        insertNodeAt(beforeNode, node)
      }).toThrowError()
    })

    test("should insert DOM Node inside parentNode at beginning", () => {
      const parentNode = document.createElement("div")
      const node = document.createElement("div")

      const insertedNode = insertNodeAt(placeAtBeginningOf(parentNode), node)

      expect(node.previousSibling).toBeNull()
      expect(node.parentNode).toBe(parentNode)
      expect(insertedNode).toBe(node)
    })

    test("should insert DOM Node inside parentNode at beginning before other child nodes", () => {
      const parentNode = document.createElement("div")
      const nextNode = document.createElement("div")
      parentNode.appendChild(nextNode)
      const node = document.createElement("div")

      const insertedNode = insertNodeAt(placeAtBeginningOf(parentNode), node)

      expect(nextNode.previousSibling).toBe(node)
      expect(node.previousSibling).toBeNull()
      expect(node.parentNode).toBe(parentNode)
      expect(insertedNode).toBe(node)
    })
  })

  describe("Inserting nodes after placeholder", () => {
    test("if placeholder is empty it should insert nodes at place of placeholder", () => {
      const parentNode = document.createElement("div")
      const beforeNode = parentNode.appendChild(document.createElement("div"))
      const placeholder = createRootPlaceholderAt(beforeNode, null)
      const node = document.createElement("div")

      insertNodeAt(placeholder, node)

      expect(node.previousSibling).toBe(beforeNode)
      expect(placeholder.lastPlaceNode()).toBe(beforeNode)
    })

    test("if placeholder contains nodes it should insert nodes after content of placeholder", () => {
      const parentNode = document.createElement("div")
      const beforeNode = parentNode.appendChild(document.createElement("div"))
      const innerNode = document.createElement("div")
      const placeholder = createRootPlaceholderAt(beforeNode, (place) => {
        return insertNodeAt(place, innerNode)
      })
      const node = document.createElement("div")

      insertNodeAt(placeholder, node)

      expect(node.previousSibling).toBe(innerNode)
      expect(placeholder.lastPlaceNode()).toBe(innerNode)
    })
  })
})