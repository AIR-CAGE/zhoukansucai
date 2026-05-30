const fs = require('fs');
const path = require('path');

const websiteDataPath = path.join(__dirname, 'website_data.json');
const rawDataPath = path.join(__dirname, 'new_articles_raw.json');

console.log('Reading files...');
const websiteData = JSON.parse(fs.readFileSync(websiteDataPath, 'utf8'));
const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

console.log(`Website data: ${websiteData.length} articles`);
console.log(`Raw data: ${rawData.length} articles`);

// 创建查找索引：用 title 作为 key（去掉前后空格）
const rawMap = new Map();
rawData.forEach(article => {
  const key = article.title.trim();
  rawMap.set(key, article);
});

// 合并 content 字段
let matched = 0;
let unmatched = 0;
const unmatchedTitles = [];

websiteData.forEach((article, idx) => {
  const key = article.title.trim();
  const rawArticle = rawMap.get(key);
  
  if (rawArticle && rawArticle.content) {
    article.content = rawArticle.content;
    matched++;
  } else {
    unmatched++;
    if (unmatchedTitles.length < 5) {
      unmatchedTitles.push(article.title);
    }
  }
});

console.log(`\nMatched: ${matched}`);
console.log(`Unmatched: ${unmatched}`);
if (unmatchedTitles.length > 0) {
  console.log('\nSample unmatched titles:');
  unmatchedTitles.forEach(t => console.log(`  - "${t}"`));
}

// 保存更新后的文件
const outputPath = path.join(__dirname, 'website_data_merged.json');
fs.writeFileSync(outputPath, JSON.stringify(websiteData, null, 2), 'utf8');
console.log(`\nSaved to: ${outputPath}`);
console.log(`Total articles with content: ${websiteData.filter(a => a.content).length}`);
