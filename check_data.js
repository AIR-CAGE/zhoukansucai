var d = require('./website_data.json');
var keys = Object.keys(d);
console.log('Total articles:', keys.length);
// Find the article
for (var i = 0; i < keys.length; i++) {
  var a = d[keys[i]];
  if (a.title && a.title.indexOf('普通人不要奢谈战略') >= 0) {
    console.log('Found:', a.title);
    console.log('Has content:', !!a.content);
    console.log('Content length:', a.content ? a.content.length : 0);
    console.log('All keys:', Object.keys(a));
    break;
  }
}
// Check how many have content
var withContent = 0;
var withoutContent = 0;
for (var j = 0; j < keys.length; j++) {
  var b = d[keys[j]];
  if (b.content && b.content.length > 0) withContent++;
  else withoutContent++;
}
console.log('With content:', withContent, 'Without content:', withoutContent);
