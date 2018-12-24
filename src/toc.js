import { JsPDFMake } from './index';
import { connectWithDotsToFitLine } from './utils';

JsPDFMake.prototype.initTOC = function initTOC() {
  this.tocSections = {};
  this.docDefinition.content
    .filter(item => item.toc)
    .forEach(({ toc }) => {
      if (this.tocSections[toc.id]) {
        throw new Error(
          `Duplicate table of contents id '${
            toc.id
          }', please make sure all table of contents have a uniq id`
        );
      }
      const options = Object.assign({}, toc); // deep clone toc
      delete options.id;
      this.tocSections[toc.id] = {
        items: [],
        options
      };
    });
};

JsPDFMake.prototype.transformTOCToContent = function transformTOCToContent(
  section
) {
  const { options, items } = section;
  const content = [options.title];
  items.forEach(({ title, paragraphIndex }) => {
    const tocItem = Object.assign(
      { text: title, isLink: true, linkParagraphIndex: paragraphIndex },
      options.itemOptions
    );
    content.push(tocItem);
  });
  return content;
};

JsPDFMake.prototype.updateTOCLinks = function updateTOCLinks(paragraphs) {
  let tocParagraphsSize = 0;
  let lastPage = 0;

  // Loop on all paragraphs
  paragraphs.forEach(p => {
    let paragraphSize = 0;
    if (p.isToc) {
      // If the current paragraph is a table of contents update it's page number to be after last page
      p.lines.forEach((line, index) => {
        paragraphSize = line.pageNumber;
        line.pageNumber += lastPage;
        if (index === 0) {
          // assign the page number of the toc section to it's first line page number
          this.tocSections[p.id].pageNumber = line.pageNumber;
        }
      });
      // Increase the size of the table of contents paragraph by this toc size
      tocParagraphsSize += paragraphSize;
    } else {
      // If it's a normal paragraph then increase it's page number with the tocParagraphSize to shift it down
      p.lines.forEach(line => {
        line.pageNumber += tocParagraphsSize;
        // Update the last page
        lastPage = line.pageNumber;
      });
    }
  });

  // Link all linked lines to the correct paragraph's first line
  paragraphs.forEach(p => {
    p.lines = p.lines.reduce((nLines, line) => {
      if (line.linkParagraphIndex >= 0) {
        // 2 lines connnected with dots the first line is the link, the second is the page number
        const dotConnectLines = connectWithDotsToFitLine(
          {
            ...line,
            linkPage: paragraphs[line.linkParagraphIndex].lines[0].pageNumber
          },
          text => {
            return this.doc
              .setFont(line.fontName, line.fontStyle)
              .setFontSize(line.fontSize)
              .getTextWidth(text);
          } // send the get text width function according to the current line's font specs
        );
        return nLines.concat(dotConnectLines);
      }
      return nLines.concat(line);
    }, []);
  });

  return paragraphs;
};
