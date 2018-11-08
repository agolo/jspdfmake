
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
    const tocItem = Object.assign({ text: title, isLink: true, linkParagrphIndex: paragraphIndex }, options);
    delete tocItem.title;
    content.push(tocItem);
  });
  return content;
};