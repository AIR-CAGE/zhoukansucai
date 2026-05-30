/**
 * parse_spring2026.js
 * 解析 2026春季学期 周刊文本
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = 'C:\\Users\\Administrator\\.qclaw\\workspace';
const WEEKLYES_DIR = path.join(WORKSPACE_DIR, 'zhoukansucai', 'weeklies_text');
const OUTPUT_PATH = path.join(WORKSPACE_DIR, 'all_articles_parsed.json');

console.log('=== 解析 2026春季学期周刊 ===\n');

// 获取春季学期的三个文件
const files = fs.readdirSync(WEEKLYES_DIR)
  .filter(f => f.includes('2026春季学期') && f.endsWith('.txt'))
  .sort();

console.log(`找到 ${files.length} 个文件: ${files.join(', ')}\n`);

const allArticles = [];

files.forEach(file => {
  const filePath = path.join(WEEKLYES_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 提取周次
  const weekMatch = file.match(/第([一二三四五六七八九十百千万\d]+)周/);
  const weekNum = weekMatch ? weekMatch[1] : file;
  
  console.log(`\n📖 处理: ${file}`);
  
  // 找到正文开始位置（第一个真正的文章标题）
  const contentStartIdx = content.indexOf('896｜');
  
  // 找到目录结束位置（在正文之前）
  const tocEndIdx = content.indexOf('每日头条', contentStartIdx);
  const bodyContent = content.substring(tocEndIdx);
  
  // 按标题模式拆分
  // 模式1: 数字编号 + 标题 (如 "896｜当3200万人开始写网文")
  // 模式2: 信件格式 (如 "第196封信｜谈谈跨国婚姻")
  // 模式3: 分类标题 (如 "每日头条", "吴军来信", "商业参考", "科技参考")
  
  const titlePattern = /(\d{3}｜[^｜\n]{5,80}|\d{2}｜[^｜\n]{5,80}|第\d+封信｜[^｜\n]{5,30}|(?:每日头条|吴军来信|商业参考|政经参考|科技参考|商业参考|市场参考))/g;
  
  const sections = bodyContent.split(titlePattern);
  
  let currentSection = '';
  let currentTitle = '';
  let sectionType = '';
  
  sections.forEach((part, idx) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    
    // 检测这是标题还是内容
    if (/^\d{3}｜/.test(trimmed) || /^\d{2}｜/.test(trimmed) || /^第\d+封信｜/.test(trimmed)) {
      // 保存之前的文章
      if (currentTitle && currentSection.length > 200) {
        allArticles.push({
          title: currentTitle,
          section: sectionType,
          weekTitle: '第' + weekNum + '周',
          content: currentSection.trim(),
          sourceFile: file
        });
      }
      currentTitle = trimmed;
      currentSection = '';
    } else if (['每日头条', '吴军来信', '商业参考', '政经参考', '科技参考'].includes(trimmed)) {
      sectionType = trimmed;
      // 保存之前的文章
      if (currentTitle && currentSection.length > 200) {
        allArticles.push({
          title: currentTitle,
          section: sectionType,
          weekTitle: '第' + weekNum + '周',
          content: currentSection.trim(),
          sourceFile: file
        });
      }
      currentTitle = '';
      currentSection = '';
    } else {
      // 这是正文内容
      currentSection += '\n' + trimmed;
    }
  });
  
  // 保存最后一篇
  if (currentTitle && currentSection.length > 200) {
    allArticles.push({
      title: currentTitle,
      section: sectionType,
      weekTitle: '第' + weekNum + '周',
      content: currentSection.trim(),
      sourceFile: file
    });
  }
  
  console.log(`  ✅ 本周提取 ${allArticles.filter(a => a.weekTitle === '第' + weekNum + '周').length} 篇文章`);
});

console.log(`\n\n✅ 总计提取 ${allArticles.length} 篇文章\n`);

// 过滤太短的文章
const validArticles = allArticles.filter(a => a.content && a.content.length > 300);
console.log(`✅ 有效文章 (>300字符): ${validArticles.length} 篇\n`);

// 按周和分类统计
const stats = {};
validArticles.forEach(a => {
  if (!stats[a.weekTitle]) stats[a.weekTitle] = {};
  stats[a.weekTitle][a.section || '未分类'] = (stats[a.weekTitle][a.section || '未分类'] || 0) + 1;
});

console.log('📊 各周分类统计:');
Object.entries(stats).forEach(([week, sections]) => {
  console.log(`\n${week}:`);
  Object.entries(sections).forEach(([sec, count]) => {
    console.log(`  - ${sec}: ${count}篇`);
  });
});

// 保存
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(validArticles, null, 2), 'utf8');
console.log(`\n💾 已保存到: ${OUTPUT_PATH}`);

// 示例
console.log('\n📝 示例文章 (前3篇):');
validArticles.slice(0, 3).forEach((a, i) => {
  console.log(`\n${i + 1}. [${a.weekTitle}][${a.section}] ${a.title}`);
  console.log(`   正文: ${a.content.substring(0, 100)}...`);
});
