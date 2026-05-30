/**
 * merge_spring2026.js
 * 合并春季学期周刊文章到 website_data.json
 */

const fs = require('fs');

const WEBSITE_DATA = 'C:\\Users\\Administrator\\.qclaw\\workspace\\zhoukansucai\\website_data.json';
const PARSED_DATA = 'C:\\Users\\Administrator\\.qclaw\\workspace\\all_articles_parsed.json';
const OUTPUT = 'C:\\Users\\Administrator\\.qclaw\\workspace\\zhoukansucai\\website_data_merged.json';

console.log('=== 合并春季学期文章 ===\n');

const websiteData = JSON.parse(fs.readFileSync(WEBSITE_DATA, 'utf8'));
const parsedData = JSON.parse(fs.readFileSync(PARSED_DATA, 'utf8'));

console.log(`网站现有: ${websiteData.length} 篇`);
console.log(`新增文章: ${parsedData.length} 篇\n`);

// 创建标题到文章的映射
const titleMap = new Map();
websiteData.forEach(a => {
  titleMap.set(a.title.trim(), a);
});

// 添加新文章
let added = 0;
parsedData.forEach(article => {
  // 去掉文章编号前缀
  let cleanTitle = article.title
    .replace(/^\d{2,3}｜/, '')  // 去掉 896｜ 或 89｜ 前缀
    .replace(/^第\d+封信｜/, (match) => match)  // 信件标题保留完整
    .trim();
  
  const key = cleanTitle.trim();
  
  if (!titleMap.has(key)) {
    websiteData.push({
      id: 'spring_' + article.title.match(/\d+/)?.[0] || Date.now(),
      title: key,
      section: article.section,
      weekTitle: article.weekTitle,
      content: article.content,
      sourceFile: article.sourceFile
    });
    added++;
    console.log(`✅ 新增: ${key.substring(0, 40)}...`);
  } else {
    // 更新已有文章的内容
    const existing = titleMap.get(key);
    if (!existing.content || existing.content.length < article.content.length) {
      existing.content = article.content;
      console.log(`📝 更新: ${key.substring(0, 40)}...`);
    }
  }
});

console.log(`\n✅ 共添加 ${added} 篇新文章`);
console.log(`💾 保存到: ${OUTPUT}`);

fs.writeFileSync(OUTPUT, JSON.stringify(websiteData, null, 2), 'utf8');
