const fs = require('fs');
const path = require('path');

const websiteDataPath = path.join(__dirname, 'website_data.json');
const rawDataPath = path.join(__dirname, 'new_articles_raw.json');

console.log('Reading files...');
const websiteData = JSON.parse(fs.readFileSync(websiteDataPath, 'utf8'));
const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

console.log(`Website data: ${websiteData.length} articles`);
console.log(`Raw data: ${rawData.length} articles`);

// 创建查找索引：用 title + week 作为 key
const rawMap = new Map();
rawData.forEach(article => {
  const key = `${article.title}_${article.week}`;
  rawMap.set(key, article);
});

// 合并 content 字段
let matched = 0;
let unmatched = 0;

websiteData.forEach(article => {
  const key = `${article.title}_${article.week}`;
  const rawArticle = rawMap.get(key);
  
  if (rawArticle && rawArticle.content) {
    article.content = rawArticle.content;
    matched++;
  } else {
    unmatched++;
  }
});

console.log(`Matched: ${matched}`);
console.log(`Unmatched: ${unmatched}`);

// 保存更新后的文件
const outputPath = path.join(__dirname, 'website_data_merged.json');
fs.writeFileSync(outputPath, JSON.stringify(websiteData, null, 2), 'utf8');
console.log(`\nSaved to: ${outputPath}`);
console.log(`Total articles with content: ${websiteData.filter(a => a.content).length}`);
