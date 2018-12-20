export function getUniqSources(sources) {
  return sources.filter(s => s.name).map(source => source.name || source.publisher);
}

export function getClusterSummaryPoints(cluster, limit) {
  const summaryWithSentences = cluster.summary.filter((summaryItem) => {
    return (summaryItem.sentences && summaryItem.sentences.length > 0);
  });

  const sentences = summaryWithSentences
    .map(section => section.sentences)
    .slice(0, limit);

  return sentences;
}

export function getArticleSnippetFromCluster(cluster, numberOfParagraphs) {
  const snippet = [];
  const article = cluster.fetchedArticles.filter(article => article.title === cluster.title)[0];
  if (article) {
    const splittedData = article.text.split('\n').filter(sentence => sentence);
    for (let i = 0; i < numberOfParagraphs && i < splittedData.length; i += 1) {
      if (splittedData[i]) {
        snippet.push(splittedData[i].trim());
      }
    }
  }
  return snippet;
}
