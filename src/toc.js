
import { JsPDFMake } from './index';

JsPDFMake.prototype.initTOC = function initTOC() {
  this.docDefinition.content.filter(item => item.toc).forEach(({toc}) => {
    const options = Object.assign({}, toc); // deep clone toc
    delete options.id;
    this.tocSections[toc.id] = {
      items: [],
      options,
    };
  });
};

JsPDFMake.prototype.transformTOCToContent = function transformTOCToContent(section) {
  const { options, items } = section;
  const content = [options.title];
  items.forEach(({ title, paragraphIndex }) => {
    const tocItem = Object.assign({ text: title, isLink: true, linkParagraphIndex: paragraphIndex }, options);
    delete tocItem.title;
    content.push(tocItem);
  });
  return content;
};

JsPDFMake.prototype.updateTOCLinks =  function updateTOCLinks(paragraphs) {
  let tocParagraphsSize = 0;
  let lastPage = 0;
  
  // Loop on all paragraphs
  paragraphs.forEach((p) => {
    let paragraphSize = 0;
    if (p.isToc) {
      // If the current paragraph is a table of contents update it's page number to be after last page
      p.lines.forEach(line => {
        paragraphSize = line.pageNumber;
        line.pageNumber += lastPage;
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
  paragraphs.forEach((p) => {
    p.lines.forEach(line => {
      if (line.linkParagraphIndex) {
        line.linkPage = paragraphs[line.linkParagraphIndex].lines[0].pageNumber;
      }
    });
  });
  
  return paragraphs;
};
