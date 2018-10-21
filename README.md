# jspdfmake
A wrapper built on top of jsPdf that provides an easy API to generate pdf text files.

## FAQ

### Why not just use jsPDF?
Good question, jsPdf is awesome, however the API is very basic and you would have to go throught lots of implementation details to get a basic pdf page ready.

For example this is the provided way to generate a text and center it according to jsPdf offical docs:

While here it's as simple as:

### Why not just implement this on top of jsPdf?
jsPdf is huge! it has enough already with 50+ issues opened right now, some of them are 2013 old. So short answer is seperation of concern.  

### Why not just use pdfMake then?
Great question! pdf make provides an amazing API, it's actually a big inspiration to this library too, however when it comes to large file (500+ pages) it becomes too slow and if you go (1000+ pages) it might result in a browser crash. This is a known issue that was raised https://github.com/bpampuch/pdfmake/issues/727. 

