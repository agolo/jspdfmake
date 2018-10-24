import formatJson from 'format-json';
import example from './examples/example';
import JsPdfMake from '../src';

const test = new JsPdfMake('My PDF', example, {
  pageXMargin: 10,
  pageYMargin: 20,
});
const { doc } = test;
test.generateFromDocDefinition();

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
