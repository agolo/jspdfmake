
# Javascript PDF maker

A lightweight wrapper built on top of [jsPdf](https://github.com/MrRio/jsPDF) that provides a fast and easy API to generate large pdf text files.
Similar to [pdfmake](https://github.com/bpampuch/pdfmake), just focus on the content and how you want to display it.

## Usage

```JS
import { JsPDFMake } from 'jspdfmake';

// Define your content paragraphs
const example = {
  content: [{
    text: 'Hello World',
    align: 'center',
  },
  {
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa obcaecati quod dicta temporibus aperiam unde debitis. Consectetur ea nobis adipisci totam laborum! Nesciunt pariatur fugiat earum repellendus eaque soluta ut.',
  }]
};

// Create an instance
const maker = new JsPDFMake('My PDF', example);

// Download your PDF file
maker.download();
```

### Below are the `keys/values` that could be passed to a paragraph

#### Alignments

- align: `String ['left', 'right', 'center']` / default = `left`

#### Fonts

- fontSize: `Number` / default = `18`
- fontName: `String ['times', 'helvitica', ...etc]` / default = `helvetica`
- fontStyle: `String ['normal', 'light', 'bold']` / default = `normal`
- textColor: `String ['red', '#111', ...etc]` / default = `black`

#### Custom fonts

- Convert your font to base64
- Export the `addMyCustomFont` function:

```JS
function addMyCustomFont(jsPDFAPI) {
  var font = 'YOUR BASE64 STRING';
  var callAddFont = function() {
    this.addFileToVFS('MyCustomFont.ttf', font);
    this.addFont('MyCustomFont.ttf', 'mycustomfont', 'normal');
  };
  jsPDFAPI.events.push(['addFonts', callAddFont]);
}

export default addMyCustomFont;
```

- Add your font using the `extendJsPDFAPI` function

```JS
import { JsPDFMake, extendJsPDFAPI } from 'jspdfmake';
import addMyCustomFont from './myCustomFont.js';

extendJsPDFAPI((API) => {
  addMyCustomFont(API);
});
```

- You can now use your custom font normally

```JS
const example = {
  content: {
    text: 'Hello World',
    fontName: 'mycustomfont',
  }
}
```

#### Margins

- marginTop: `Number` / default = `0`
- marginRight: `Number` / default = `0`
- marginBottom: `Number` / default = `0`
- marginLeft: `Number` / default = `0`

#### Page Breaks

- pageBreak: `String ['none', 'before', 'after']` / default = `none`

#### Highlighting

- highlightColor - `[Number] (RGB values of the color e.g [255, 255, 255] for white)` / default = `false`

#### Bullet points

- hasBullet - `Boolean` / default = `false`

#### Table of contents

Check the examples folder for a complete [table of contents example](https://github.com/agolo/jspdfmake/blob/master/playground/examples/example_toc.js)

#### Header/Footer

You can render a header/footer for every page of your document using the `renderStamp` function

```JS
  const docDefinition = {
    content: [
      {
        text: `Feed: ${feed.name}\n`,
        fontSize: 16,
        fontName: 'avenir',
        textColor: 'black',
        align: 'center',
        marginTop: 105,
        marginBottom: 5,
      },
    ],
    renderStamp: (doc, pageNumber, { width, height }) => {
      // doc is the jsPdf document instance
      doc.text(
        `My custom footer text ${pageNumber}`,
        20,
        height - 20,
      );
    },
  };
```

## FAQ

### Why not just use jsPDF

[jsPdf](https://github.com/MrRio/jsPDF) is awesome, however the API is very basic and you would have to go through lots of implementation details (e.g line breaks, page breaks, inline styles, font sizes, alignments...) to get a simple pdf text page.

For example this is the provided way to generate a text rendered in new lines according to [jsPdf offical docs](https://rawgit.com/MrRio/jsPDF/master/):

```JS
var pageWidth = 8.5,
  lineHeight = 1.2,
  margin = 0.5,
  maxLineWidth = pageWidth - margin * 2,
  fontSize = 24,
  ptsPerInch = 72,
  oneLineHeight = fontSize * lineHeight / ptsPerInch,
  text = 'LARGE TEXT GOES HERE',
  doc = new jsPDF({
  unit: 'in',
  lineHeight: lineHeight
}).setProperties({ title: 'String Splitting' });

// splitTextToSize takes your string and turns it in to an array of strings,
// each of which can be displayed within the specified maxLineWidth.

var textLines = doc
  .setFont('helvetica', 'neue')
  .setFontSize(fontSize)
  .splitTextToSize(text, maxLineWidth);

// doc.text can now add those lines easily; otherwise, it would have run text off the screen!
doc.text(textLines, margin, margin + 2 * oneLineHeight);
```

While here it's as simple as:

```JS
// Create your doc definetion
const example = {
  content: {
     text: "LARGE TEXT GOES HERE",
     fontSize: 24,
     fontName: 'helvetica',
     fontStyle: 'neue',
  }
}
// Create an instance and Generate the doc from the definition!
const  test  =  new  JsPDFMake('My PDF', example);
```

No need to worry about calculations or pixels computations details, just focus on the content and how you want to display it.
