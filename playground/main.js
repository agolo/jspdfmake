import formatJson from 'format-json';
import example from './examples/example_toc';
import { JsPDFMake } from '../src';

const test = new JsPDFMake('My PDF', example, {
  pageMarginLeft: 70,
  pageMarginRight: 70,
  pageMarginTop: 40,
  pageMarginBottom: 80
});
const { doc } = test;

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
