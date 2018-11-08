
import { JsPDFMake } from './index';

JsPDFMake.prototype.initTOC = function initTOC() {
  this.docDefinition.content.filter(item => item.toc).forEach(({toc}) => {
    const options = Object.assign({}, toc); // deep clone toc
    delete options.id;
    this.tocSections[toc.id] = {
      startingPage: 0,
      items: [],
      options,
    };
  });
};

JsPDFMake.prototype.transformTOCToContent = function transformTOCToContent() {
  const {
    tocSections,
  } = this;
  const sections = Object.values(tocSections);
  sections.forEach(section => {
    const { startingPage, items } = section;
    items.forEach(({ title, pageNumber }) => {
      sections.forEach(({ startingPage, size }) => pageNumber >= startingPage && (pageNumber += size) ); // Update item offset based on the number of pages added for the previous sections
      this.drawTextInLine({ isLink: true, text: `${title} ${pageNumber}`, pageNumber }, xOffset, yOffset, 18, 18);
      yOffset += 20;
    });
  });
  console.log(tocSections);
};