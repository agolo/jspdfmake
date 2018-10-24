
# jspdfmake
A wrapper built on top of [jsPdf](https://github.com/MrRio/jsPDF) that provides a fast and easy API to generate large pdf text files.
You don't have to worry about math equations or other complex details, just focus on the content and how you want to display it!

## FAQ

### Why not just use jsPDF?
[jsPdf](https://github.com/MrRio/jsPDF) is awesome, however the API is very basic and you would have to go through lots of implementation details (e.g line breaks, page breaks, inline styles, font sizes, alignments...) to get a basic pdf page ready.

For example this is the provided way to generate a text rendered in newlines according to [jsPdf offical docs](https://rawgit.com/MrRio/jsPDF/master/):
```
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
```
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
No need to worry about math equations or other complex details, just focus on the content and how you want to display it!
