/**
 * @file lib/threeMF/parsers/xmlHelper.ts
 * Universal, lightweight XML parser that works seamlessly in:
 * - Browser main thread (with or without DOMParser)
 * - Web Workers (where DOMParser may be unavailable)
 * - Node.js test environments
 */

export interface SimpleXmlNode {
  tagName: string;
  attributes: Record<string, string>;
  textContent: string;
  children: SimpleXmlNode[];
  querySelector(selector: string): SimpleXmlNode | null;
  querySelectorAll(selector: string): SimpleXmlNode[];
  getAttribute(name: string): string | null;
}

class SimpleXmlNodeImpl implements SimpleXmlNode {
  tagName: string;
  attributes: Record<string, string>;
  textContent: string;
  children: SimpleXmlNode[];

  constructor(tagName: string, attributes: Record<string, string> = {}, textContent: string = '') {
    this.tagName = tagName;
    this.attributes = attributes;
    this.textContent = textContent;
    this.children = [];
  }

  getAttribute(name: string): string | null {
    return this.attributes[name] ?? this.attributes[name.toLowerCase()] ?? null;
  }

  querySelector(selector: string): SimpleXmlNode | null {
    const selLower = selector.toLowerCase();
    for (const child of this.children) {
      if (child.tagName.toLowerCase() === selLower) {
        return child;
      }
      const found = child.querySelector(selector);
      if (found) return found;
    }
    return null;
  }

  querySelectorAll(selector: string): SimpleXmlNode[] {
    const results: SimpleXmlNode[] = [];
    const selLower = selector.toLowerCase();

    for (const child of this.children) {
      if (child.tagName.toLowerCase() === selLower) {
        results.push(child);
      }
      results.push(...child.querySelectorAll(selector));
    }

    return results;
  }
}

/**
 * Universal XML parser that doesn't depend on DOMParser.
 */
export function parseUniversalXml(xmlString: string): SimpleXmlNode | null {
  if (!xmlString || typeof xmlString !== 'string') return null;

  // Clean comments and XML declarations
  const cleanXml = xmlString
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .trim();

  if (!cleanXml) return null;

  const root = new SimpleXmlNodeImpl('ROOT');
  const stack: SimpleXmlNodeImpl[] = [root];

  // Regex to match XML tags
  // 1: is closing tag slash "/"
  // 2: tag name
  // 3: attributes string
  // 4: is self closing slash "/"
  const tagRegex = /<(\/)?([a-zA-Z0-9_:-]+)([\s\S]*?)(\/)?>|([^<]+)/g;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(cleanXml)) !== null) {
    const isClosing = Boolean(match[1]);
    const tagName = match[2];
    const rawAttrs = match[3];
    const isSelfClosing = Boolean(match[4]);
    const textData = match[5];

    const currentParent = stack[stack.length - 1];

    if (textData) {
      const trimmed = textData.trim();
      if (trimmed && currentParent && currentParent !== root) {
        currentParent.textContent = currentParent.textContent
          ? `${currentParent.textContent} ${trimmed}`
          : trimmed;
      }
      continue;
    }

    if (!tagName) continue;

    if (isClosing) {
      // Find matching tag in stack to pop
      for (let i = stack.length - 1; i >= 1; i--) {
        if (stack[i].tagName.toLowerCase() === tagName.toLowerCase()) {
          stack.length = i;
          break;
        }
      }
    } else {
      // Parse attributes
      const attributes: Record<string, string> = {};
      if (rawAttrs) {
        const attrRegex = /([a-zA-Z0-9_:-]+)\s*=\s*(?:["']([^"']*)["']|([^\s>]+))/g;
        let attrMatch: RegExpExecArray | null;
        while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
          const key = attrMatch[1];
          const val = attrMatch[2] !== undefined ? attrMatch[2] : attrMatch[3];
          attributes[key] = val;
        }
      }

      const newNode = new SimpleXmlNodeImpl(tagName, attributes);
      currentParent.children.push(newNode);

      if (!isSelfClosing) {
        stack.push(newNode);
      }
    }
  }

  // Return the first real top-level element
  return root.children.length > 0 ? root.children[0] : null;
}
