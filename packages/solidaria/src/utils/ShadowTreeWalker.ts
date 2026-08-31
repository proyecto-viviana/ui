/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/shadowdom/ShadowTreeWalker.ts
// Adobe's source is based on:
// https://github.com/microsoft/tabster/blob/a89fc5d7e332d48f68d03b1ca6e344489d1c3898/src/Shadowdomize/ShadowTreeWalker.ts

import { shadowDOM } from "@proyecto-viviana/solid-stately/private/flags/flags";
import { nodeContains } from "./dom";

export class ShadowTreeWalker implements TreeWalker {
  public readonly filter: NodeFilter | null;
  public readonly root: Node;
  public readonly whatToShow: number;

  private readonly doc: Document;
  private walkerStack: TreeWalker[] = [];
  private current: Node;
  private currentSetFor = new Set<TreeWalker>();

  constructor(doc: Document, root: Node, whatToShow?: number, filter?: NodeFilter | null) {
    this.doc = doc;
    this.root = root;
    this.filter = filter ?? null;
    this.whatToShow = whatToShow ?? NodeFilter.SHOW_ALL;
    this.current = root;

    this.walkerStack.unshift(doc.createTreeWalker(root, whatToShow, this.acceptNode));

    const shadowRoot = (root as Element).shadowRoot;
    if (shadowRoot) {
      this.walkerStack.unshift(
        this.doc.createTreeWalker(shadowRoot, this.whatToShow, {
          acceptNode: this.acceptNode,
        }),
      );
    }
  }

  private acceptNode = (node: Node): number => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const shadowRoot = (node as Element).shadowRoot;
      if (shadowRoot) {
        this.walkerStack.unshift(
          this.doc.createTreeWalker(shadowRoot, this.whatToShow, {
            acceptNode: this.acceptNode,
          }),
        );
        return NodeFilter.FILTER_ACCEPT;
      }

      if (typeof this.filter === "function") {
        return this.filter(node);
      }
      if (this.filter?.acceptNode) {
        return this.filter.acceptNode(node);
      }
      if (this.filter === null) {
        return NodeFilter.FILTER_ACCEPT;
      }
    }

    return NodeFilter.FILTER_SKIP;
  };

  public get currentNode(): Node {
    return this.current;
  }

  public set currentNode(node: Node) {
    if (!nodeContains(this.root, node)) {
      throw new Error("Cannot set currentNode to a node that is not contained by the root node.");
    }

    const walkers: TreeWalker[] = [];
    let currentNode: Node | null | undefined = node;
    let walkerCurrentNode = node;
    this.current = node;

    while (currentNode && currentNode !== this.root) {
      if (currentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        const shadowRoot = currentNode as ShadowRoot;
        const walker = this.doc.createTreeWalker(shadowRoot, this.whatToShow, {
          acceptNode: this.acceptNode,
        });
        walkers.push(walker);
        walker.currentNode = walkerCurrentNode;
        this.currentSetFor.add(walker);
        currentNode = walkerCurrentNode = shadowRoot.host;
      } else {
        currentNode = currentNode.parentNode;
      }
    }

    const walker = this.doc.createTreeWalker(this.root, this.whatToShow, {
      acceptNode: this.acceptNode,
    });
    walkers.push(walker);
    walker.currentNode = walkerCurrentNode;
    this.currentSetFor.add(walker);
    this.walkerStack = walkers;
  }

  public firstChild(): Node | null {
    const currentNode = this.currentNode;
    const newNode = this.nextNode();
    if (!nodeContains(currentNode, newNode)) {
      this.currentNode = currentNode;
      return null;
    }
    if (newNode) {
      this.currentNode = newNode;
    }
    return newNode;
  }

  public lastChild(): Node | null {
    const walker = this.walkerStack[0];
    const newNode = walker.lastChild();
    if (newNode) {
      this.currentNode = newNode;
    }
    return newNode;
  }

  public nextNode(): Node | null {
    const nextNode = this.walkerStack[0].nextNode();
    if (nextNode) {
      const shadowRoot = (nextNode as Element).shadowRoot;
      if (shadowRoot) {
        let nodeResult: number | undefined;
        if (typeof this.filter === "function") {
          nodeResult = this.filter(nextNode);
        } else if (this.filter?.acceptNode) {
          nodeResult = this.filter.acceptNode(nextNode);
        }

        if (nodeResult === NodeFilter.FILTER_ACCEPT) {
          this.currentNode = nextNode;
          return nextNode;
        }

        const childNode = this.nextNode();
        if (childNode) {
          this.currentNode = childNode;
        }
        return childNode;
      }

      this.currentNode = nextNode;
      return nextNode;
    }

    if (this.walkerStack.length > 1) {
      this.walkerStack.shift();
      const parentNode = this.nextNode();
      if (parentNode) {
        this.currentNode = parentNode;
      }
      return parentNode;
    }
    return null;
  }

  public previousNode(): Node | null {
    const currentWalker = this.walkerStack[0];
    if (currentWalker.currentNode === currentWalker.root) {
      if (this.currentSetFor.has(currentWalker)) {
        this.currentSetFor.delete(currentWalker);
        if (this.walkerStack.length > 1) {
          this.walkerStack.shift();
          const parentNode = this.previousNode();
          if (parentNode) {
            this.currentNode = parentNode;
          }
          return parentNode;
        }
      }
      return null;
    }

    const previousNode = currentWalker.previousNode();
    if (previousNode) {
      const shadowRoot = (previousNode as Element).shadowRoot;
      if (shadowRoot) {
        let nodeResult: number | undefined;
        if (typeof this.filter === "function") {
          nodeResult = this.filter(previousNode);
        } else if (this.filter?.acceptNode) {
          nodeResult = this.filter.acceptNode(previousNode);
        }

        if (nodeResult === NodeFilter.FILTER_ACCEPT) {
          this.currentNode = previousNode;
          return previousNode;
        }

        const childNode = this.lastChild();
        if (childNode) {
          this.currentNode = childNode;
        }
        return childNode;
      }

      this.currentNode = previousNode;
      return previousNode;
    }

    if (this.walkerStack.length > 1) {
      this.walkerStack.shift();
      const parentNode = this.previousNode();
      if (parentNode) {
        this.currentNode = parentNode;
      }
      return parentNode;
    }
    return null;
  }

  /** @deprecated */
  public nextSibling(): Node | null {
    return null;
  }

  /** @deprecated */
  public previousSibling(): Node | null {
    return null;
  }

  /** @deprecated */
  public parentNode(): Node | null {
    return null;
  }
}

/** Shadow DOM-safe version of `Document.createTreeWalker`. */
export function createShadowTreeWalker(
  doc: Document,
  root: Node,
  whatToShow?: number,
  filter?: NodeFilter | null,
): TreeWalker {
  if (shadowDOM()) {
    return new ShadowTreeWalker(doc, root, whatToShow, filter);
  }
  return doc.createTreeWalker(root, whatToShow, filter);
}
