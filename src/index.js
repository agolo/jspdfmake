import JsPDF from 'jspdf';
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_ALIGN,
  DEFAULT_FONT_NAME,
  DEFAULT_FONT_STYLE,
  DEFAULT_TEXT_COLOR,
} from './constants';

export function JsPDFMake(title, docDefinition, options = {}) {
  this.docDefinition = docDefinition;
  this.options = {
    orientation: 'p',
    unit: 'pt',
    format: 'a4',
    hotfixes: [], // an array of hotfix strings to enable
    lineHeight: DEFAULT_LINE_HEIGHT,
  };
  this.doc = new JsPDF(this.options).setProperties({ title });
  this.pageWidth = this.doc.internal.pageSize.getWidth();
  this.pageHeight = this.doc.internal.pageSize.getHeight();
  this.pageXMargin = options.pageXMargin || 0;
  this.pageYMargin = options.pageYMargin || 0;
  this.maxLineWidth = this.pageWidth - this.pageXMargin * 2;
  this.generateFromDocDefinition();
}

JsPDFMake.prototype.clearDoc = function clearDoc() {
  const { doc } = this;
  while (doc.internal.pages.length > 1) {
    doc.deletePage(1);
  }
  doc.addPage();
};

JsPDFMake.prototype.updateDocDefinition = function updateDocDefinition(docDefinition) {
  this.docDefinition = docDefinition;
  this.generateFromDocDefinition();
};

JsPDFMake.prototype.isCursorOutOfPageVertically = function isCursorOutOfPageVertically(yOffset) {
  return yOffset > this.pageHeight - this.pageYMargin;
};

/**
 * @param {String} text The text to be inlined
 * @param {Number} xOffset The x offset for the new text
 * @param {Number} yOffset The y offset for the new text
 * @param {Number} fontSize The font size for the new text
 * @param {Number} maxFontSize The maximum font size in this line.
 * @param {String} align Either 'left', 'right' or 'center', default is 'left'
 */
JsPDFMake.prototype.drawTextInLine = function drawTextInLine(text, xOffset = 0, yOffset = 0, fontSize = DEFAULT_FONT_SIZE, maxFontSize = 0) {
  const {
    doc,
  } = this;
  const center = fontSize / 2.0 + fontSize / 4.0; // The renderer starts drawing text at the center
  doc
    .setFontSize(fontSize)
    .text(xOffset, center + Math.max(fontSize, maxFontSize) - fontSize + yOffset, text);
  return {
    nextXOffset: xOffset + doc.getTextWidth(`${text} `),
    nextYOffset: yOffset + Math.max(fontSize, maxFontSize),
  };
};

JsPDFMake.prototype.escapeCharacters = function escapeCharacters(text) {
  return text.replace(/[^A-Za-z 0-9 \n\.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
};

JsPDFMake.prototype.generateFromDocDefinition = function generateFromDocDefinition() {
  const {
    doc,
    docDefinition,
    pageXMargin,
    pageYMargin,
    maxLineWidth,
    pageWidth,
  } = this;
  this.clearDoc();
  let yOffset = pageYMargin;
  let xOffset;
  docDefinition.content.forEach(({
    text,
    fontSize = DEFAULT_FONT_SIZE,
    fontName = DEFAULT_FONT_NAME,
    fontStyle = DEFAULT_FONT_STYLE,
    textColor = DEFAULT_TEXT_COLOR,
    marginTop = 0,
    marginRight = 0,
    marginBottom = 0,
    marginLeft = 0,
    align = DEFAULT_ALIGN,
    pageBreak = 'none',
  }) => {
    if (typeof text !== 'string') {
      // TODO: HANDLE INLINE TEXT OBJECTS
      console.warn(`Text is only supported as string format, this section will not be rendered => ${text}`);
      return;
    }

    // splitTextToSize takes your string and turns it in to an array of strings,
    // each of which can be displayed within the specified maxLineWidth.
    const textLines = doc
      .setFontSize(fontSize)
      .setFont(fontName, fontStyle)
      .setTextColor(textColor)
      .splitTextToSize(this.escapeCharacters(text), maxLineWidth - marginLeft - marginRight);

    if (pageBreak === 'before') {
      yOffset = pageYMargin;
      doc.addPage();
    }

    yOffset += marginTop;

    // doc.text can now add those lines easily; otherwise, it would have run text off the screen!
    textLines.forEach((line) => {
      if (this.isCursorOutOfPageVertically(yOffset + fontSize)) {
        // if next line can't be written reset offset and add a new page
        yOffset = pageYMargin;
        doc.addPage();
      }
      xOffset = pageXMargin + marginLeft;
      if (align === 'center') {
        xOffset = pageWidth / 2.0 - doc.getTextWidth(line) / 2.0 + marginLeft - marginRight;
      } else if (align === 'right') {
        xOffset = pageWidth - doc.getTextWidth(line) - pageXMargin - marginRight;
      }
      const { nextYOffset } = this.drawTextInLine(line, xOffset, yOffset, fontSize, 0);
      yOffset = nextYOffset;
    });

    yOffset += marginBottom;

    if (pageBreak === 'after') {
      yOffset = pageYMargin;
      doc.addPage();
    }
  });
};

JsPDFMake.prototype.download = function download() {
  this.doc.save();
};
