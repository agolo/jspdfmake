import JsPdfMake from './index';
import example from './example3.json';

const test = new JsPdfMake('My PDF', example);
const { doc } = test;
// test.generateFromDocDefinition();

const vals = test.drawTextInLine('|________|', 0, 0, 20, 35);
const newVals = test.drawTextInLine('|________|', vals.nextXOffset, 0, 25, 35);
test.drawTextInLine('|________|', newVals.nextXOffset, 0, 35);

// For debugging
document.doc = doc;
document.test = test;

// Render to iframe
let str = doc.output('datauristring');
const iframe = document.createElement('iframe');
iframe.src = str;
iframe.width = '100%';
iframe.height = '100%';
document.body.appendChild(iframe);
document.refreshDoc = () => {
  str = doc.output('datauristring');
  iframe.src = str;
};
