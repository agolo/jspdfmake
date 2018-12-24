const example = {
  content: [
    {
      toc: {
        id: 'mainToc', // default is mainToc
        title: {
          text: 'Table of content',
          align: 'center',
          fontStyle: 'bold',
          fontSize: 23
        },
        itemOptions: {
          fontSize: 18
        }
      }
    }
  ]
};

example.content = example.content.concat(
  Array(5000)
    .fill()
    .map((a, i) => ({
      text: `Paragraph ${i +
        1} \n Start Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, Very large text that takes more than 1 page, `,
      fontSize: 20,
      align: 'center',
      tocIds: ['mainToc', 'endToc'],
      tocItemText: `Paragraph ${i + 1}`,
      pageBreak: 'after'
    }))
);

example.content.push({
  toc: {
    id: 'endToc', // default is mainToc
    title: {
      text: 'Table of content',
      align: 'center',
      fontStyle: 'bold',
      fontSize: 23
    },
    itemOptions: {
      fontSize: 18
    }
  }
});

export default example;
