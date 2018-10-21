
import JsPDF from 'jspdf';
import { DEFAULT_FONT_SIZE, DEFAULT_LINE_HEIGHT, DEFAULT_ALIGN } from './constants';

export default function JsPdfMake(title, docDefinition) {
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
  this.pageXMargin = 0;
  this.pageYMargin = 0;
  this.maxLineWidth = this.pageWidth - this.pageXMargin * 2;
  // const oneLineHeight = fontSize * lineHeight / ptsPerInch;
}

JsPdfMake.prototype.setDocDefinition = function setDocDefinition(docDefinition) {
  this.docDefinition = docDefinition;
};

JsPdfMake.prototype.clearDoc = function clearDoc() {
  const { doc } = this;
  while (doc.internal.pages.length > 1) {
    doc.deletePage(1);
  }
  doc.addPage();
};


/**
 * @param {String} text The text to be inlined
 * @param {Number} xOffset The x offset for the new text
 * @param {Number} yOffset The y offset for the new text
 * @param {Number} fontSize The font size for the new text
 * @param {Number} maxFontSize The maximum font size in this line.
 * @param {String} align Either 'left', 'right' or 'center', default is 'left'
 */
JsPdfMake.prototype.drawTextInLine = function drawTextInLine(
  text,
  xOffset = 0,
  yOffset = 0,
  fontSize = DEFAULT_FONT_SIZE,
  maxFontSize = 0,
  align = DEFAULT_ALIGN,
) {
  const {
    doc,
  } = this;
  const center = fontSize / 2.0 + fontSize / 4.0; // The renderer starts drawing text at the center
  doc
    .setFontSize(fontSize)
    .text(
      xOffset,
      center + Math.max(fontSize, maxFontSize) - fontSize + yOffset,
      text,
      null,
      null,
      align,
    );
  return {
    nextXOffset: xOffset + doc.getTextWidth(`${text} `),
    nextYOffset: yOffset + fontSize,
  };
};

JsPdfMake.prototype.generateFromDocDefinition = function generateFromDocDefinition() {
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
  // let xOffset = pageXMargin;
  docDefinition.content.forEach(({ text, fontSize = DEFAULT_FONT_SIZE, align = DEFAULT_ALIGN }) => {
    if (typeof text === 'object') {
      // TODO: HANDLE INLINE TEXT OBJECTS
      console.warn('Objects are not yet supported as text, this section will not be rendered');
      return;
    }

    // splitTextToSize takes your string and turns it in to an array of strings,
    // each of which can be displayed within the specified maxLineWidth.
    const textLines = doc
      .setFontSize(fontSize)
      .splitTextToSize(text, maxLineWidth);

    let xMargin = pageXMargin;
    if (align === 'center') {
      xMargin = pageWidth / 2.0;
    } else if (align === 'right') {
      xMargin = maxLineWidth;
    }
    // doc.text can now add those lines easily; otherwise, it would have run text off the screen!
    textLines.forEach((line) => {
      const { nextYOffset } = this.drawTextInLine(line, xMargin, yOffset, fontSize, 0, align);
      yOffset = nextYOffset;
    });
  });
};

JsPdfMake.prototype.generateFromDocDefinitionOld = function generateFromDocDefinitionOld() {
  const {
    doc,
    docDefinition,
    pageXMargin,
    maxLineWidth,
  } = this;
  this.clearDoc();
  let offset = pageXMargin;
  let prevTextHeight = 0;
  docDefinition.content.forEach(({ text, fontSize = DEFAULT_FONT_SIZE, align = 'left' }) => {
    // splitTextToSize takes your string and turns it in to an array of strings,
    // each of which can be displayed within the specified maxLineWidth.
    const textLines = doc
      .setFontSize(fontSize)
      .splitTextToSize(text, maxLineWidth);
    offset += prevTextHeight;

    let xMargin = pageXMargin;
    if (align === 'center') {
      xMargin = (maxLineWidth + pageXMargin) / 2.0;
    } else if (align === 'right') {
      xMargin = maxLineWidth;
    }
    const yMargin = offset;

    // doc.text can now add those lines easily; otherwise, it would have run text off the screen!
    doc.text(xMargin, yMargin, textLines, null, null, align);
    // Calculate the height of the text very simply:
    prevTextHeight = textLines.length * doc.getLineHeight();
    doc.line(0, yMargin, 1000, yMargin);
  });
};
