export function getCursorPosition(parent) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(parent);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }
  return 0;
}

export function setCursorPosition(parent, position) {
  if (!parent || !parent.firstChild) return;

  const range = document.createRange();
  const selection = window.getSelection();
  
  const pos = Math.min((parent.firstChild.length || 0), position);

  try {
    range.setStart(parent.firstChild, pos);
    range.collapse(true);
    
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (e) {
        console.error("Failed to set cursor position:", e);
  }
}