import JsPDF from 'jspdf';
import {
  DEFAULT_LINE_HEIGHT,
  DEFAULT_ALIGN,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_NAME,
  DEFAULT_FONT_STYLE,
  DEFAULT_TEXT_COLOR,
} from './constants';
import './toc';

export function JsPDFMake(title, docDefinition, options = {}) {
  this.docDefinition = docDefinition;
  const jsPdfOptions = {
    orientation: 'p',
    unit: 'pt',
    format: 'a4',
    hotfixes: [], // an array of hotfix strings to enable
    lineHeight: DEFAULT_LINE_HEIGHT,
  };
  this.options = {...options};
  this.doc = new JsPDF(jsPdfOptions).setProperties({ title });
  this.title = title;
  this.pageWidth = this.doc.internal.pageSize.getWidth();
  this.pageHeight = this.doc.internal.pageSize.getHeight();
  this.pageMarginLeft = options.pageMarginLeft || 0;
  this.pageMarginRight = options.pageMarginRight || 0;
  this.pageMarginTop = options.pageMarginTop || 0;
  this.pageMarginBottom = options.pageMarginBottom || 0;
  this.maxLineWidth = this.pageWidth - this.pageMarginLeft - this.pageMarginRight;
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
  return yOffset > this.pageHeight - this.pageMarginBottom;
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
  lineWidth,
  xOffset,
  yOffset,
  pageNumber,
  maxFontSize,
  isLink,
  linkPage,
  linkUrl,
  hasBullet,
  bulletSpacing,
  highlightColor,
}) {
  const {
    doc,
  } = this;
  const center = fontSize / 2.0 + fontSize / 4.0; // The renderer starts drawing text at the center
  if (highlightColor) {
    doc.setDrawColor(0);
    doc.setFillColor(highlightColor[0], highlightColor[1], highlightColor[2]);
    doc.rect(xOffset, yOffset, lineWidth, fontSize, 'F');
  }
  doc
    .setPage(pageNumber)
    .setFont(fontName, fontStyle)
    .setFontSize(fontSize)
    .setTextColor(textColor);
  if (isLink) {
    let link = { pageNumber: linkPage };
    if (linkUrl) {
      link = { url: linkUrl };
    } 
    doc.textWithLink(text, xOffset, center + Math.max(fontSize, maxFontSize) - fontSize + yOffset, link);
  } else {
    doc.text(xOffset, center + Math.max(fontSize, maxFontSize) - fontSize + yOffset, text);
  }
  if (hasBullet) {
    doc.setDrawColor(0);
    doc.setFillColor(0, 0, 0);
    doc.circle(xOffset - bulletSpacing, yOffset + (center / 1.8), fontSize / 7.0, 'FD');
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
  tocItemText,
  isLink = false,
  linkPage,
  linkUrl,
  linkParagraphIndex,
  hasBullet = false,
  bulletSpacing = fontSize,
  highlightColor = false,
}, xOffset, yOffset, pageNumber, paragraphIndex, maxLinesPerParagraph = false) {
  const {
    doc,
    maxLineWidth,
    tocSections,
    pageMarginLeft,
    pageMarginRight,
    pageMarginTop,
    pageWidth,
  } = this;

  if (typeof text !== 'string') {
    // TODO: HANDLE INLINE TEXT OBJECTS
    console.warn(`Text is only supported as string format, this section will not be rendered => ${text}`);
    return { nextXOffset: xOffset, nextYOffset: yOffset, nextPage: pageNumber, lines };
  }
  if (pageBreak === 'before' || this.isCursorOutOfPageVertically(yOffset + fontSize)) {
    // if page break before or next line can't be written reset offset and add a new page
    yOffset = pageMarginTop;
    // this.addPage();
    pageNumber += 1;
  }

  // Insert this paragraph to its toc section if any
  tocIds.forEach(tocId => {
    if (!tocSections[tocId]) {
      throw new Error(`Unknown table of contents id '${tocId}'`);
    }
    tocSections[tocId].items.push({
      title: tocItemText || text,
      paragraphIndex,
    });
  });

  if (hasBullet) {
    // give some space for the bullet point
    marginLeft += bulletSpacing;
  }
  // splitTextToSize takes your string and turns it in to an array of strings,
  // each of which can be displayed within the specified maxLineWidth.
  let textLines = doc
    .setFont(fontName, fontStyle)
    .setFontSize(fontSize)
    .setTextColor(textColor)
    .splitTextToSize(this.escapeSpecialCharacters(text), maxLineWidth - marginLeft - marginRight);

  if (maxLinesPerParagraph) {
    textLines = textLines.splice(0, maxLinesPerParagraph);
  } 

  yOffset += marginTop;

  const lines = [];

  // doc.text can now add those lines easily; otherwise, it would have run text off the screen!
  textLines.forEach((line, index) => {
    if (this.isCursorOutOfPageVertically(yOffset + fontSize)) {
      // if next line can't be written reset offset and add a new page
      yOffset = pageMarginTop;
      // this.addPage();
      pageNumber += 1;
    }
    xOffset = pageMarginLeft + marginLeft;
    if (align === 'center') {
      xOffset = pageWidth / 2.0 - doc.getTextWidth(line) / 2.0 + marginLeft - marginRight;
    } else if (align === 'right') {
      xOffset = pageWidth - doc.getTextWidth(line) - pageMarginRight - marginRight;
    }
    lines.push({
      text: line,
      fontSize,
      fontName,
      fontStyle,
      textColor,
      lineWidth: pageWidth - pageMarginRight - marginRight - pageMarginLeft - marginLeft,
      xOffset,
      yOffset,
      pageNumber,
      maxFontSize: fontSize,
      isLink,
      linkPage,
      linkUrl,
      linkParagraphIndex,
      hasBullet: index === 0 && hasBullet, // only first line should contain the bullet point
      bulletSpacing,
      highlightColor,
    });
    yOffset = yOffset + fontSize;
    // TODO USE THIS IF CURSOR IS STILL IN THE SAME LINE
    // yOffset = yOffset + Math.max(fontSize, maxFontSize);
    // xOffset = xOffset + doc.getTextWidth(`${text} `);
  });

  yOffset += marginBottom;

  if (pageBreak === 'after') {
    yOffset = pageMarginTop;
    // this.addPage();
    pageNumber += 1;
  }

  return { nextXOffset: xOffset, nextYOffset: yOffset, nextPage: pageNumber, lines };

};

JsPDFMake.prototype.transformContentToDrawableParagraphs = function transformContentToDrawableParagraphs(content, maxLinesPerParagraph) {
  let yOffset = this.pageMarginTop;
  let xOffset;
  let currentPage = 1;
  return content.map((params, index) => {
    if (params.toc) {
      if (currentPage > 1 && index < content.length - 1) {
        // if it's not the first page and it's not the last page add another page after the toc for the next content
        currentPage += 1;
        yOffset = this.pageMarginTop;
      }
      return { isToc: true, id: params.toc.id };
    }
    const { nextXOffset, nextYOffset, nextPage, lines } = this.renderParagraph(params, xOffset, yOffset, currentPage, index, maxLinesPerParagraph);
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
    const tocParagraphs = this.transformContentToDrawableParagraphs(content, 1); // transform to drawable paragraph with max 1 line per paragraph

    // Merge tocParagraphs into the current paragraphs
    paragraphs.forEach((p) => {
      if (p.isToc && p.id === tocId) {
        p.lines = tocParagraphs.map(p => p.lines).flat();
      }
    });
  });

  this.drawParagraphs(this.updateTOCLinks(paragraphs));
  this.renderFooterToPages();
};

JsPDFMake.prototype.renderFooterToPages = function renderFooterToPages() {
  const { docDefinition, doc, tocSections, pageWidth, pageHeight } = this;
  const { renderFooter }= docDefinition;
  if (renderFooter) {
    let currentPageNumber = 1;
    while (currentPageNumber <= this.size()) {
      doc.setPage(currentPageNumber);
      renderFooter(doc, currentPageNumber, { width: pageWidth, height: pageHeight }, tocSections);
      currentPageNumber += 1;
    }  
  }
};

JsPDFMake.prototype.download = function download() {
  this.doc.save(this.title);
};

export function extendJsPDFAPI(cb) {
  cb(JsPDF.API);
}
