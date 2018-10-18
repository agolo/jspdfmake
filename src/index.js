
import JsPDF from 'jspdf';
import example from './example.json';
import example2 from './example2.json';
import { DEFAULT_FONT_SIZE } from './constants';

export default function JsPdfMake(title, docDefinition) {
  this.docDefinition = docDefinition;
  this.options = {
    orientation: 'p',
    unit: 'pt',
    format: 'a4',
    hotfixes: [], // an array of hotfix strings to enable
  };
  this.doc = new JsPDF(this.options).setProperties({ title });
  this.pageWidth = this.doc.internal.pageSize.getWidth();
  this.pageHeight = this.doc.internal.pageSize.getHeight();
  this.margin = 20;
  this.maxLineWidth = this.pageWidth - this.margin * 2;
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

JsPdfMake.prototype.generateFromDocDefinition = function generateFromDocDefinition() {
  const {
    doc,
    docDefinition,
    margin,
    maxLineWidth,
  } = this;
  this.clearDoc();
  let offset = margin;
  let prevTextHeight = 0;
  docDefinition.content.forEach(({ text, fontSize = DEFAULT_FONT_SIZE, align }) => {
    // splitTextToSize takes your string and turns it in to an array of strings,
    // each of which can be displayed within the specified maxLineWidth.
    const textLines = doc
      .setFontSize(fontSize)
      .splitTextToSize(text, maxLineWidth);
    offset += prevTextHeight + fontSize;

    let xMargin = margin;
    if (align === 'center') {
      xMargin = (maxLineWidth + margin) / 2.0;
    } else if (align === 'right') {
      xMargin = maxLineWidth;
    }
    const yMargin = offset;

    // doc.text can now add those lines easily; otherwise, it would have run text off the screen!
    doc.text(xMargin, yMargin, textLines, null, null, align);
    // Calculate the height of the text very simply:
    prevTextHeight = textLines.length * fontSize;
  });
};

export const test = new JsPdfMake('My PDF', example);
test.generateFromDocDefinition();
test.setDocDefinition(example2);
// test.generateFromDocDefinition();
let str = test.doc.output('datauristring');
const iframe = document.createElement('iframe');
iframe.src = str;
iframe.width = '100%';
iframe.height = '100%';
document.body.appendChild(iframe);
document.doc = test.doc;
document.refreshDoc = () => {
  str = test.doc.output('datauristring');
  iframe.src = str;
};
