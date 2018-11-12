import formatJson from 'format-json';
import example from './examples/example_toc1';
// import fontInBase64 from './fonts/font';
import { JsPDFMake } from '../src';

const test = new JsPDFMake('My PDF', example, {
  pageXMargin: 40,
  pageYMargin: 40,
});
const { doc } = test;
// test.generateFromDocDefinition();
// doc.addFileToVFS('newfont.ttf', fontInBase64);
// doc.addFont('newfont.ttf', 'newfont', 'normal');

// const vals = test.drawTextInLine('|________|', 0, 0, 20, 35);
// const newVals = test.drawTextInLine('|________|', vals.nextXOffset, 0, 25, 35);
// test.drawTextInLine('|________|', newVals.nextXOffset, 0, 35);

// Render to iframe
let str = doc.output('datauristring');
const iframe = document.createElement('iframe');
iframe.src = str;
iframe.width = '100%';
iframe.height = '100%';
document.getElementById('canvas').appendChild(iframe);
const refreshDoc = () => {
  str = doc.output('datauristring');
  iframe.src = str;
};

// Ace
const { editor } = document;
editor.getSession().setValue(formatJson.plain(example));
editor.getSession().on('change', () => {
  try {
    const json = JSON.parse(editor.getSession().getValue());
    test.updateDocDefinition(json);
    test.generateFromDocDefinition();
    refreshDoc();
  } catch (error) {
    console.error(error);
  }
});


// For debugging
document.doc = doc;
document.test = test;
document.refreshDoc = refreshDoc;
