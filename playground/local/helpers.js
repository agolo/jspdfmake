import moment from 'moment';
import { getClusterSummaryPoints, getArticleSnippetFromCluster, getUniqSources } from './summary';

export const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
export const randomColors = ['magenta', 'red', 'orange', 'lime', 'green', 'cyan', 'blue', 'purple'];
export const hr = {
  text: '______________________________________________________',
  align: 'center',
  fontSize: 12,
};

export const generateSources = (sources) => {
  return getUniqSources(sources)
    .map((source, index) => (`[${index + 1}] ${source}`))
    .join(',');
};

export const generateClusterArticles = (articles, outputConfig) => {
  return articles.map((article, index) => {
    const articleContent = [{
      text: `Article: ${index + 1} of ${articles.length}`,
      fontStyle: 'bold',
      fontSize: 14,
      marginBottom: 40,
      pageBreak: 'before',
      textColor: '#333',
    }];
    if (outputConfig.source_title) {
      articleContent.push({
        text: article.title,
        fontStyle: 'bold',
        fontSize: 20,
        align: 'center',
      });
    }
    if (outputConfig.source_text) {
      articleContent.push(
        {
          text: article.text,
          fontSize: 16,
          marginTop: 40,
        },
        { ...hr, marginTop: 40 },
      );
    }
    articleContent.push({
      text: `Sources: ${generateSources(article.sources)}`,
      fontStyle: 'bolditalic',
      fontSize: 14,
      align: 'center',
      textColor: '#333',
      marginTop: 40,
    });
    if (outputConfig.source_links && article.url) {
      articleContent.push({
        text: `Url: ${article.url}`,
        fontStyle: 'bold',
        fontSize: 16,
        textColor: '#2067b3',
        marginTop: 40,
      });
    }
    return articleContent;
  }).flatten();
};

export const generateClusterContent = (cluster, outputConfig, tocIds = []) => {
  const clusterContent = [{
    text: '',
    pageBreak: 'before',
  }];
  if (outputConfig.summary_title) {
    clusterContent.push({
      text: capitalize(cluster.title),
      fontStyle: 'bold',
      fontSize: 20,
      marginBottom: 40,
      align: 'center',
      tocIds,
      tocItemText: capitalize(cluster.title).substring(0, 65).concat(cluster.title.length > 65 ? '...' : ''),
    }, {
      text: `${moment(cluster.created_at).format('MMMM DD, YYYY')}`,
      fontSize: 12,
      align: 'center',
      marginBottom: 40,
    });
  }
  if (outputConfig.summary_bullets > 0) {
    const sentences = getClusterSummaryPoints(cluster, outputConfig.summary_bullets);
    clusterContent.push(
      { ...hr },
      {
        text: 'Summary',
        fontStyle: 'bold',
        fontSize: 18,
        align: 'center',
        marginTop: 40,
        marginBottom: 40,
      },
      {
        text: sentences.map(sentence => (`- ${sentence}`)).join('\n\n'),
        fontSize: 16,
        marginBottom: 40,
      },
      { ...hr, marginBottom: 40 },
    );
  }
  const firstParagraphs = getArticleSnippetFromCluster(cluster, outputConfig.source_paragraphs);
  if (firstParagraphs.length > 0) {
    clusterContent.push(
      {
        text: `First ${firstParagraphs.length} Paragraphs:`,
        fontStyle: 'bold',
        fontSize: 18,
        align: 'center',
        marginTop: 40,
        marginBottom: 40,
      },
      {
        text: firstParagraphs.map((paragraph, i) => (`${i + 1}. ${paragraph}`)).join('\n\n'),
        fontSize: 16,
        marginBottom: 40,
      },
      { ...hr, marginBottom: 40 },
    );
  }
  clusterContent.push({
    text: 'Sources: '.concat(generateSources(cluster.sources)),
    fontStyle: 'bolditalic',
    fontSize: 14,
    textColor: '#333',
    marginTop: 40,
    align: 'center',
  });
  clusterContent.push(generateClusterArticles(cluster.fetchedArticles, outputConfig));
  return clusterContent.flatten();
};
