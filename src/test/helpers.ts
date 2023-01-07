export function addStylesheet() {
  const head = document.head
  const style = document.createElement('style')
  head.appendChild(style)
}

export function addStylesheetRule(
  selector: string,
  rules: string,
  index: number = 0,
) {
  if (!document.styleSheets.length) {
    addStylesheet()
  }
  const sheet = document.styleSheets[0]
  let cssRuleIndex = 'insertRule' in sheet
    ? sheet.insertRule(selector + '{' + rules + '}', index)
    : sheet.addRule(selector, rules, index)
  return document.styleSheets[0].cssRules[cssRuleIndex] as CSSStyleRule
}

