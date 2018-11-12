import JsPDF from 'jspdf';
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_ALIGN,
  DEFAULT_FONT_NAME,
  DEFAULT_FONT_STYLE,
  DEFAULT_TEXT_COLOR,
} from './constants';
import './toc';

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
  this.title = title;
  this.pageWidth = this.doc.internal.pageSize.getWidth();
  this.pageHeight = this.doc.internal.pageSize.getHeight();
  this.pageXMargin = options.pageXMargin || 0;
  this.pageYMargin = options.pageYMargin || 0;
  this.maxLineWidth = this.pageWidth - this.pageXMargin * 2;
  this.tocSections = {};
  this.generateFromDocDefinition();
}

JsPDFMake.prototype.size = function size() {
  return this.doc.internal.pages.length - 1;
};

JsPDFMake.prototype.addPage = function addPage() {
  const {
    doc,
  } = this;
  const currentPage = this.getCurrentPageNumber();
  if (currentPage === this.size()) {
    doc.addPage();
  } else {
    doc.insertPage(currentPage);
  }
};

JsPDFMake.prototype.clearDoc = function clearDoc() {
  const { doc } = this;
  while (doc.internal.pages.length > 1) {
    doc.deletePage(1);
  }
  this.addPage();
};

JsPDFMake.prototype.updateDocDefinition = function updateDocDefinition(docDefinition) {
  this.docDefinition = docDefinition;
  this.generateFromDocDefinition();
};

JsPDFMake.prototype.getCurrentPageNumber = function getCurrentPageNumber() {
  return this.doc.internal.getCurrentPageInfo().pageNumber;
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
JsPDFMake.prototype.drawTextInLine = function drawTextInLine({
  text,
  fontSize,
  fontName,
  fontStyle,
  textColor,
  xOffset,
  yOffset,
  pageNumber,
  maxFontSize,
  isLink,
  linkPage,
}) {
  const {
    doc,
  } = this;
  const center = fontSize / 2.0 + fontSize / 4.0; // The renderer starts drawing text at the center
  doc
    .setPage(pageNumber)
    .setFont(fontName, fontStyle)
    .setFontSize(fontSize)
    .setTextColor(textColor);
  if (isLink) {
    doc.textWithLink(text, xOffset, center + Math.max(fontSize, maxFontSize) - fontSize + yOffset, { pageNumber: linkPage });
  } else {
    doc.text(xOffset, center + Math.max(fontSize, maxFontSize) - fontSize + yOffset, text);
  }
  return true;
};

JsPDFMake.prototype.drawParagraphs = function drawParagraphs(paragraphs) {
  paragraphs.forEach(({ lines = [] }) => lines.forEach(line => {
    while (line.pageNumber > this.size()) {
      this.addPage();
    }
    this.drawTextInLine(line);
  }));
};

/**
 * Removes any special characters from the given text
 * @param {String} text The text to be transformed
 */
JsPDFMake.prototype.escapeSpecialCharacters = function escapeSpecialCharacters(text) {
  return text.replace(/[^A-Za-z 0-9 \n\t\.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
};

JsPDFMake.prototype.renderParagraph = function renderParagraph({
  text,
  pageBreak = 'none',
  fontSize = DEFAULT_FONT_SIZE,
  fontName = DEFAULT_FONT_NAME,
  fontStyle = DEFAULT_FONT_STYLE,
  textColor = DEFAULT_TEXT_COLOR,
  align = DEFAULT_ALIGN,
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
  tocIds = [],
  tocTitle,
  isLink = false,
  linkPage,
  linkParagraphIndex,
}, xOffset, yOffset, pageNumber, index) {
  const {
    doc,
    maxLineWidth,
    tocSections,
    pageXMargin,
    pageYMargin,
    pageWidth,
  } = this;

  if (typeof text !== 'string') {
    // TODO: HANDLE INLINE TEXT OBJECTS
    console.warn(`Text is only supported as string format, this section will not be rendered => ${text}`);
    return { nextXOffset: xOffset, nextYOffset: yOffset, nextPage: pageNumber, lines };
  }
  if (pageBreak === 'before' || this.isCursorOutOfPageVertically(yOffset + fontSize)) {
    // if page break before or next line can't be written reset offset and add a new page
    yOffset = pageYMargin;
    // this.addPage();
    pageNumber += 1;
  }

  // Insert this paragraph to its toc section if any
  tocIds.forEach(tocId => {
    if (!tocSections[tocId]) {
      throw new Error(`Unknown table of contents id '${tocId}'`);
    }
    tocSections[tocId].items.push({
      title: tocTitle || text,
      paragraphIndex: index,
    });
  });

  // splitTextToSize takes your string and turns it in to an array of strings,
  // each of which can be displayed within the specified maxLineWidth.
  const textLines = doc
    .setFont(fontName, fontStyle)
    .setFontSize(fontSize)
    .setTextColor(textColor)
    .splitTextToSize(this.escapeSpecialCharacters(text), maxLineWidth - marginLeft - marginRight);

  yOffset += marginTop;

  const lines = [];

  // doc.text can now add those lines easily; otherwise, it would have run text off the screen!
  textLines.forEach((line) => {
    if (this.isCursorOutOfPageVertically(yOffset + fontSize)) {
      // if next line can't be written reset offset and add a new page
      yOffset = pageYMargin;
      // this.addPage();
      pageNumber += 1;
    }
    xOffset = pageXMargin + marginLeft;
    if (align === 'center') {
      xOffset = pageWidth / 2.0 - doc.getTextWidth(line) / 2.0 + marginLeft - marginRight;
    } else if (align === 'right') {
      xOffset = pageWidth - doc.getTextWidth(line) - pageXMargin - marginRight;
    }
    lines.push({
      text: line,
      fontSize,
      fontName,
      fontStyle,
      textColor,
      xOffset,
      yOffset,
      pageNumber,
      maxFontSize: fontSize,
      isLink,
      linkPage,
      linkParagraphIndex,
    });
    yOffset = yOffset + fontSize;
    // TODO USE THIS IF CURSOR IS STILL IN THE SAME LINE
    // yOffset = yOffset + Math.max(fontSize, maxFontSize);
    // xOffset = xOffset + doc.getTextWidth(`${text} `);
  });

  yOffset += marginBottom;

  if (pageBreak === 'after') {
    yOffset = pageYMargin;
    // this.addPage();
    pageNumber += 1;
  }

  return { nextXOffset: xOffset, nextYOffset: yOffset, nextPage: pageNumber, lines };

};

JsPDFMake.prototype.transformContentToDrawableParagraphs = function transformContentToDrawableParagraphs(content) {
  let yOffset = this.pageYMargin;
  let xOffset;
  let currentPage = 1;
  return content.map((params, index) => {
    if (params.toc) {
      return { isToc: true, id: params.toc.id };
    }
    const { nextXOffset, nextYOffset, nextPage, lines } = this.renderParagraph(params, xOffset, yOffset, currentPage, index);
    yOffset = nextYOffset;
    xOffset = nextXOffset;
    currentPage = nextPage;
    return { lines };
  }).filter(a => a);
};

JsPDFMake.prototype.generateFromDocDefinition = function generateFromDocDefinition() {
  const {
    docDefinition,
  } = this;
  this.clearDoc();
  this.initTOC();
  const paragraphs = this.transformContentToDrawableParagraphs(docDefinition.content); // Array of Paragraph where a Paragaph is an Array of Lines
  const {
    tocSections,
  } = this;
  Object.entries(tocSections).forEach(([tocId, tocSection]) => {
    const content = this.transformTOCToContent(tocSection);
    const tocParagraphs = this.transformContentToDrawableParagraphs(content);

    // Merge tocParagraphs into the current paragraphs
    paragraphs.forEach((p) => {
      if (p.isToc && p.id === tocId) {
        p.lines = tocParagraphs.map(p => p.lines).flat();
      }
    });
  });

  this.drawParagraphs(this.updateTOCLinks(paragraphs));
};

JsPDFMake.prototype.download = function download() {
  this.doc.save(this.title);
};
