import moment from 'moment';

import { generateClusterContent } from './helpers';


/**
 * This function takes a feed with its clusters and output a document defination for the feed, The document defination defines how the
 * Feed is going to be rendered in either (PDF/ Clipboard...) in terms of: 1. Text to show 2. Font styles/colors/sizes 3. Margins 4. Page breaks
 * @param {Object} feed The feed object to generate the doc based on
 * @param {[Object]} clusters The clusters array of this feed
 * @param {Boolean} isFull Whether to output the whole feed or a single cluster
 * @param {Object} outputConfig The output configuration based on which the clusters will be rendered
 * @returns {Object} The document defination for this feed
 */
export const generateFeedDocDefination = (feed, clusters, isFull, outputConfig) => {
  const linkTOC = outputConfig.contents && clusters.length > 1;
  const tocIds = linkTOC ? ['mainToc'] : [];
  const clustersContent = clusters.reduce((prev, cluster) => prev.concat(generateClusterContent(cluster, outputConfig, tocIds)), []);
  const docDefinition = {
    content: [
      {
        text: `AGOLO\n\nProject: ${feed.name}\n\n`,
        fontSize: 35,
        fontStyle: 'bold',
        textColor: '#2067b3',
        align: 'center',
        marginTop: 60,
        marginBottom: 20,
      },
      {
        text: `${moment(feed.startDate).format('MMMM DD, YYYY')} - ${moment(feed.endDate).format('MMMM DD, YYYY')}`,
        fontSize: 18,
        fontStyle: 'bold',
        textColor: '#2067b3',
        align: 'center',
      },
      !isFull ? null : {
        text: `\n${feed.feedClusterCount} Summaries\n${feed.feedArticleCount} Articles`,
        fontSize: 18,
        fontStyle: 'bold',
        textColor: '#2067b3',
        align: 'center',
      },
      linkTOC ? {
        toc: {
          id: 'mainToc',
          title: {
            text: 'Table of Contents',
            align: 'center',
            fontSize: 24,
            marginBottom: 20,
          },
          itemOptions: {
            fontSize: 14,
            marginBottom: 10,
          },
        },
      } : null,
    ].filter(Boolean).concat(clustersContent),
  };
  return docDefinition;
};
