import moment from 'moment';
import { getClusterSummaryPoints, getArticleSnippetFromCluster, getUniqSources } from './summary';

export const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
export const randomColors = ['magenta', 'red', 'orange', 'lime', 'green', 'cyan', 'blue', 'purple'];
export const hr = {
  text: '--------------------------',
  align: 'center',
  fontSize: 8,
  textColor: '#555555',
};

export const generateSources = (sources) => {
  return getUniqSources(sources)
    .join(',');
};

export const generateClusterArticles = (articles, outputConfig) => {
  const result = articles.map((article) => {
    const articleContent = [];
    if (outputConfig.source_title) {
      articleContent.push({
        text: article.title,
        fontStyle: 'light',
        fontSize: 9,
        align: 'left',
        marginBottom: 3,
      });
    }
    if (outputConfig.source_links && article.url) {
      articleContent.push({
        text: article.url,
        isLink: true,
        linkUrl: article.url,
        fontStyle: 'light',
        fontSize: 8,
        textColor: '#4a86e8',
        marginLeft: 40,
        marginBottom: 3,
      });
    }
    articleContent.push({
      text: `${moment(article.published_at).format('MMMM DD, YYYY')} | ${generateSources(article.sources)}`,
      fontStyle: 'light',
      fontSize: 8,
      align: 'left',
      marginLeft: 40,
      marginBottom: 3,
    });

    if (outputConfig.source_text) {
      articleContent.push(
        {
          text: article.text,
          fontSize: 8,
          fontStyle: 'light',
          marginLeft: 40,
          marginTop: 10,
        },
        { ...hr, marginTop: 5, marginBottom: 15 },
      );
    }
    return articleContent;
  });
  const merged = [].concat.apply([], result);
  return merged;
};

export const generateClusterContent = (cluster, outputConfig, tocIds = []) => {
  let clusterContent = [{
    text: '',
    pageBreak: 'before',
  }];
  if (outputConfig.summary_title) {
    clusterContent.push({
      text: capitalize(cluster.title),
      fontStyle: 'normal',
      fontSize: 14,
      marginTop: 2,
      marginBottom: 10,
      marginLeft: 60,
      marginRight: 60,
      align: 'center',
      tocIds,
      tocItemText: capitalize(cluster.title).substring(0, 65).concat(cluster.title.length > 65 ? '...' : ''),
    }, {
      text: moment(cluster.created_at).format('MMMM DD, YYYY'),
      fontSize: 11,
      fontStyle: 'light',
      align: 'center',
      marginBottom: 20,
    });
  }
  const firstParagraphs = getArticleSnippetFromCluster(cluster, outputConfig.source_paragraphs);
  if (firstParagraphs.length > 0) {
    clusterContent.push(
      {
        text: 'Source Excerpt',// `First ${firstParagraphs.length} Paragraphs:`,
        fontStyle: 'bold',
        fontSize: 11,
        align: 'left',
        marginBottom: 10,
        highlightColor: [219, 229, 242],
      },
      {
        text: firstParagraphs.join('\n\n'),
        fontStyle: 'light',
        fontSize: 10,
        marginBottom: 20,
      },
    );
  }

  if (outputConfig.summary_bullets > 0) {
    const sentences = getClusterSummaryPoints(cluster, outputConfig.summary_bullets);
    clusterContent.push(
      {
        text: 'Summary',
        fontStyle: 'bold',
        fontSize: 11,
        align: 'left',
        marginBottom: 10,
        highlightColor: [219, 229, 242],
      },
    );
    clusterContent = clusterContent.concat(sentences.map(sentence => ({
      text: sentence,
      fontStyle: 'light',
      fontSize: 10,
      marginLeft: 25,
      marginBottom: 5,
      hasBullet: true,
      bulletSpacing: 15,
    })));
  }
  const numOfArticles = cluster.fetchedArticles.length; 
  clusterContent.push({
    text: `Sources (${numOfArticles} article${numOfArticles > 1 ? 's' : ''})`,
    fontStyle: 'bold',
    fontSize: 11,
    marginTop: 20,
    marginBottom: 10,
    align: 'left',
    highlightColor: [219, 229, 242],
  });
  clusterContent.push(generateClusterArticles(cluster.fetchedArticles, outputConfig));
  const merged = [].concat.apply([], clusterContent);
  return merged;
};
