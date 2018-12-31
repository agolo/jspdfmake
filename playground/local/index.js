import moment from 'moment';

import { generateClusterContent } from './helpers';
import logoBase64 from './agoloLogoBase64';

const logoDiameter = 40;

function renderFooter(doc, pageNumber, { width, height }, linkTOC) {
  const logoXOffset = width - logoDiameter - 50;
  const logoYOffset = height - logoDiameter - 20;
  doc.addImage(
    logoBase64,
    'JPEG',
    logoXOffset,
    logoYOffset,
    logoDiameter,
    logoDiameter - 3,
  );
  doc.setFont('avenir', 'normal');
  if (pageNumber > 1) {
    const text = `${pageNumber}`;
    const xOffset = (width / 2.0) - (doc.getTextWidth(text) / 2.0);
    const yOffset = height - 40;
    doc
      .setFontSize(11)
      .setTextColor('black')
      .text(xOffset, yOffset, text);
  }
  if (linkTOC && pageNumber > 2) {
    const xOffset = width - 215;
    const yOffset = height - 40;
    const fontSize = 9;
    const text = 'Back to Table of Contents';

    doc
      .setFontSize(fontSize)
      // .setFontStyle('light')
      .setTextColor('#7f7f7f')
      .textWithLink(text, xOffset, yOffset, { pageNumber: 2 });

    doc.setLineWidth(1);
    doc.setDrawColor(127, 127, 127);
    doc.line(
      xOffset + doc.getTextWidth('Back to '),
      yOffset + 0.7,
      xOffset + doc.getTextWidth(text),
      yOffset + 0.7,
    );
  }
}

/**
 * This function takes a feed with its clusters and output a document defination for the feed, The document defination defines how the
 * Feed is going to be rendered in either (PDF/ Clipboard...) in terms of: 1. Text to show 2. Font styles/colors/sizes 3. Margins 4. Page breaks
 * @param {Object} feed The feed object to generate the doc based on
 * @param {[Object]} clusters The clusters array of this feed
 * @param {Boolean} isFull Whether to output the whole feed or a single cluster
 * @param {Object} outputConfig The output configuration based on which the clusters will be rendered
 * @returns {Object} The document defination for this feed
 */
export const generateFeedDocDefination = (
  feed,
  clusters,
  isFull,
  outputConfig,
) => {
  const linkTOC = outputConfig.contents && clusters.length > 1;
  const tocIds = linkTOC ? ['mainToc'] : [];
  const clustersContent = clusters.reduce(
    (prev, cluster) =>
      prev.concat(generateClusterContent(cluster, outputConfig, tocIds)),
    [],
  );
  const docDefinition = {
    content: [
      {
        text: `Project: ${feed.name}\n`,
        fontSize: 16,
        fontName: 'avenir',
        textColor: 'black',
        align: 'center',
        marginTop: 105,
        marginBottom: 5,
      },
      {
        text: `${moment(feed.startDate).format('MMMM DD, YYYY')} - ${moment(feed.endDate).format('MMMM DD, YYYY')}`,
        fontSize: 12,
        fontName: 'avenir',
        // fontStyle: 'light',
        textColor: '#999999',
        align: 'center',
        marginBottom: 2,
      },
      !isFull
        ? null
        : {
          text: `${feed.feedClusterCount} Summaries`,
          fontSize: 12,
          fontName: 'avenir',
          // fontStyle: 'light',
          textColor: '#999999',
          marginBottom: 2,
          align: 'center',
        },
      !isFull
        ? null
        : {
          text: `${feed.feedArticleCount} Articles`,
          fontSize: 12,
          fontName: 'avenir',
          // fontStyle: 'light',
          textColor: '#999999',
          align: 'center',
        },
      linkTOC
        ? {
          toc: {
            id: 'mainToc',
            title: {
              text: 'Table of Contents',
              align: 'left',
              fontName: 'avenir',
              fontSize: 14,
              marginTop: 42,
              marginBottom: 20,
            },
            itemOptions: {
              fontSize: 9,
              fontName: 'avenir',
              marginBottom: 12,
            },
          },
        }
        : null,
    ]
      .filter(Boolean)
      .concat(clustersContent),
    renderFooter: (doc, pageNumber, { width, height }) => renderFooter(doc, pageNumber, { width, height }, linkTOC),
  };
  return docDefinition;
};
