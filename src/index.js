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
  this.title = title;
  this.pageWidth = this.doc.internal.pageSize.getWidth();
  this.pageHeight = this.doc.internal.pageSize.getHeight();
  this.pageXMargin = options.pageXMargin || 0;
  this.pageYMargin = options.pageYMargin || 0;
  this.maxLineWidth = this.pageWidth - this.pageXMargin * 2;
  this.tocSections = {};
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
JsPDFMake.prototype.drawTextInLine = function drawTextInLine(line, xOffset = 0, yOffset = 0, fontSize = DEFAULT_FONT_SIZE, maxFontSize = 0) {
  const text = typeof line === 'object' ? line.text : line;
  const {
    doc,
  } = this;
  const center = fontSize / 2.0 + fontSize / 4.0; // The renderer starts drawing text at the center
  doc.setFontSize(fontSize);
  if (line.isLink) {
    doc.textWithLink(text, xOffset, center + Math.max(fontSize, maxFontSize) - fontSize + yOffset, line.linkOptions);
  } else {
    doc.text(xOffset, center + Math.max(fontSize, maxFontSize) - fontSize + yOffset, text);
  }
  return {
    nextXOffset: xOffset + doc.getTextWidth(`${text} `),
    nextYOffset: yOffset + Math.max(fontSize, maxFontSize),
  };
};


/**
 * Removes any special characters from the given text
 * @param {String} text The text to be transformed
 */
JsPDFMake.prototype.escapeSpecialCharacters = function escapeSpecialCharacters(text) {
  return text.replace(/[^A-Za-z 0-9 \n\t\.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
};

JsPDFMake.prototype.renderParagraphLines = function renderParagraphLines(textLines, xOffset, yOffset, {
  fontSize = DEFAULT_FONT_SIZE,
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
  align = DEFAULT_ALIGN,
}) {
  const {
    doc,
    pageXMargin,
    pageYMargin,
    pageWidth,
  } = this;



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


  return { nextXOffset: xOffset, nextYOffset: yOffset };
};

JsPDFMake.prototype.renderParagraph = function renderParagraph(params, xOffset, yOffset) {
  const {
    text,
    pageBreak = 'none',
    fontSize = DEFAULT_FONT_SIZE,
    fontName = DEFAULT_FONT_NAME,
    fontStyle = DEFAULT_FONT_STYLE,
    textColor = DEFAULT_TEXT_COLOR,
    marginRight = 0,
    marginLeft = 0,
    tocIds = [],
    tocTitle,
  } = params;
  const {
    doc,
    maxLineWidth,
    pageYMargin,
    tocSections,
  } = this;

  if (typeof text !== 'string') {
    // TODO: HANDLE INLINE TEXT OBJECTS
    console.warn(`Text is only supported as string format, this section will not be rendered => ${text}`);
    return;
  }
  if (pageBreak === 'before' || this.isCursorOutOfPageVertically(yOffset + fontSize)) {
    // if page break before or next line can't be written reset offset and add a new page
    yOffset = pageYMargin;
    doc.addPage();
  }

  // Insert this paragraph to its toc sections if any
  tocIds.forEach(tocId => {
    const section = tocSections[tocId];
    section.items.push({
      title: tocTitle || text,
      pageNumber: this.getCurrentPageNumber(),
    });
  });

  // splitTextToSize takes your string and turns it in to an array of strings,
  // each of which can be displayed within the specified maxLineWidth.
  const textLines = doc
    .setFontSize(fontSize)
    .setFont(fontName, fontStyle)
    .setTextColor(textColor)
    .splitTextToSize(this.escapeSpecialCharacters(text), maxLineWidth - marginLeft - marginRight);

  if (pageBreak === 'after') {
    yOffset = pageYMargin;
    doc.addPage();
  }

  return this.renderParagraphLines(textLines, xOffset, yOffset, params);

};

JsPDFMake.prototype.initTOC = function initTOC() {
  this.docDefinition.content.filter(item => item.toc).forEach(({toc}) => {
    const options = Object.assign({}, toc); // deep clone toc
    delete options.id;
    this.tocSections[toc.id] = {
      beforePage: 0,
      items: [],
      options,
    };
  });
};

JsPDFMake.prototype.renderTOC = function renderTOC() {
  console.log(this.tocSections);
};

JsPDFMake.prototype.generateFromDocDefinition = function generateFromDocDefinition() {
  const {
    tocSections,
    docDefinition,
    pageYMargin,
  } = this;
  this.clearDoc();
  this.initTOC();
  let yOffset = pageYMargin;
  let xOffset;
  docDefinition.content.forEach((params) => {
    if (params.toc) {
      const tocSection = tocSections[params.toc.id];
      tocSection.beforePage = this.getCurrentPageNumber() + 1;
      if (yOffset === pageYMargin) {
        // yOffset is still at the top, so nothing has been written to this page yet => use it as TOC
        tocSection.beforePage -= 1;
      }
    } else if (params.text) {
      const { nextXOffset, nextYOffset } = this.renderParagraph(params, xOffset, yOffset);
      yOffset = nextYOffset;
      xOffset = nextXOffset;
    }
  });
  this.renderTOC(xOffset, yOffset);
  // this.doc.insertPage(2);
  // this.doc.setPage(2);
  // this.doc.textWithLink('Page 1', 10, 20, { pageNumber: 1 });
};

JsPDFMake.prototype.download = function download() {
  this.doc.save(this.title);
};
