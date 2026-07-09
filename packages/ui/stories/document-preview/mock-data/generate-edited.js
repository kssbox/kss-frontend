const fs = require('fs');

// 读取原始数据
const data = JSON.parse(fs.readFileSync('real-range.json', 'utf8'));

// 复制 parse_result 到 edited_parse_result
data.edited_parse_result = JSON.parse(JSON.stringify(data.parse_result));

const blocks = data.edited_parse_result.blocks;

// 1. 在第一页开头添加一个新块（Added）
blocks.unshift({
    id: 'NEW_BLOCK_001',
    type: 'text',
    content: '本教材已更新至2024年最新版本',
    page: 1,
    bbox: [100, 50, 400, 80]
});

// 2. 删除 "（五·四学制）" heading (找到第一页的这个块)
const deletedIdx = blocks.findIndex(b => b.content === '（五·四学制）' && b.page === 1);
if (deletedIdx !== -1) {
    console.log('🗑️  删除块:', blocks[deletedIdx].id, blocks[deletedIdx].content);
    blocks.splice(deletedIdx, 1);
}

// 3. 更新 "语文" 为 "中文"
const langBlock = blocks.find(b => b.content === '语文' && b.page === 1);
if (langBlock) {
    console.log('✏️  更新块:', langBlock.id, '语文 → 中文');
    langBlock.content = '中文';
}

// 4. 更新 "一年级下册" 为 "一年级下册（修订版）"
const gradeBlock = blocks.find(b => b.content === '一年级下册' && b.page === 1);
if (gradeBlock) {
    console.log('✏️  更新块:', gradeBlock.id, '一年级下册 → 一年级下册（修订版）');
    gradeBlock.content = '一年级下册（修订版）';
}

// 5. 移动 "人民教育出版社" 位置（调整 bbox）
const publisherBlock = blocks.find(b => b.content === '人民教育出版社' && b.page === 1);
if (publisherBlock) {
    console.log('🚚 移动块:', publisherBlock.id, publisherBlock.content);
    console.log('   原 bbox:', publisherBlock.bbox);
    publisherBlock.bbox = [150, 820, 358, 845];
    console.log('   新 bbox:', publisherBlock.bbox);
}

// 更新 char_count
data.edited_parse_result.metadata.char_count = 2850;

// 写入文件
fs.writeFileSync('real-range-edited.json', JSON.stringify(data, null, 2));

console.log('\n✅ 成功生成 real-range-edited.json');
console.log('   - 总页数:', data.parse_result.metadata.page_count);
console.log('   - 原始 blocks:', data.parse_result.blocks.length);
console.log('   - 编辑后 blocks:', data.edited_parse_result.blocks.length);
console.log('   - 变更：+1 新增, -1 删除, 2 修改, 1 移动');
