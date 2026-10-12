// Sub-Store sing-box template.js 兼容修正版
// 兼容处理模板中的 filter 和 "{all}" 占位符

log(`🚀 开始`);

let { type, name, outbound, includeUnsupportedProxy, url } = $arguments;

log(`传入参数 type: ${type}, name: ${name}, outbound: ${outbound}`);

type = /^1$|col|组合/i.test(type || '')
  ? 'collection'
  : 'subscription';

const parser = ProxyUtils.JSON5 || JSON;

log(`① 使用 ${ProxyUtils.JSON5 ? 'JSON5' : 'JSON'} 解析配置文件`);

let config;

try {
  config = parser.parse($content ?? $files[0]);
} catch (e) {
  log(`${e.message ?? e}`);
  throw new Error(
    `配置文件不是合法的 ${ProxyUtils.JSON5 ? 'JSON5' : 'JSON'} 格式`
  );
}
log(`② 获取订阅`);

let proxies = [];
let outbounds = [];
let endpoints = [];
let data = {};

if (url) {
  log(`直接从 URL ${url} 读取订阅`);

  data = await produceArtifact({
    name,
    type,
    platform: 'sing-box',
    produceOpts: {
      'include-unsupported-proxy': includeUnsupportedProxy
    },
    subscription: {
      name,
      url,
      source: 'remote'
    }
  });
} else {
  log(`将读取名称为 ${name} 的 ${type === 'collection' ? '组合' : ''}订阅`);

  data = await produceArtifact({
    name,
    type,
    platform: 'sing-box',
    produceOpts: {
      'include-unsupported-proxy': includeUnsupportedProxy
    }
  });
}

data = JSON.parse(data);

outbounds = data.outbounds ?? [];
endpoints = data.endpoints ?? [];

proxies = [...outbounds, ...endpoints];

log(`获取到 ${outbounds.length} 个节点, ${endpoints.length} 个端点`);
log(`③ outbound 规则解析`);

const outboundRules = (outbound || '')
  .split('🕳')
  .map(i => i.trim())
  .filter(Boolean)
  .map(i => {
    const [outboundPattern, tagPattern = '.*'] = i.split('🏷');

    const tagRegex = createTagRegExp(tagPattern);

    log(
      `匹配 🏷 ${tagRegex} 的节点将插入匹配 🕳 ${createOutboundRegExp(outboundPattern)} 的 outbound 中`
    );

    return [outboundPattern, tagRegex];
  });

if (!Array.isArray(config.outbounds)) {
  config.outbounds = [];
}
log(`④ outbound 插入节点`);

for (const group of config.outbounds) {
  for (const [outboundPattern, tagRegex] of outboundRules) {
    const outboundRegex = createOutboundRegExp(outboundPattern);

    if (!outboundRegex.test(group.tag || '')) {
      continue;
    }

    if (!Array.isArray(group.outbounds)) {
      group.outbounds = [];
    }

    const tags = getTags(proxies, tagRegex);

    group.outbounds.push(...tags);
    group.outbounds = unique(group.outbounds);

    log(
      `🕳 ${group.tag} 匹配 ${outboundRegex}, 插入 ${tags.length} 个 🏷 匹配 ${tagRegex} 的节点`
    );
  }
}
/*
 * 兼容模板扩展字段：
 * 1. "{all}" 代表所有实际节点。
 * 2. 如果 outbound 中存在 filter，则按照 filter 规则筛选节点。
 * 3. 处理完成后删除 filter，避免 sing-box 内核报错。
 */

log(`⑤ 处理模板 filter 与 {all}`);

for (const group of config.outbounds) {
  const hasAllPlaceholder =
    Array.isArray(group.outbounds) &&
    group.outbounds.includes('{all}');

  const filters = Array.isArray(group.filter)
    ? group.filter
    : [];

  if (hasAllPlaceholder) {
    const filteredTags = proxies
      .filter(proxy =>
        matchesFilters(proxy.tag || '', filters)
      )
      .map(proxy => proxy.tag);

    const expanded = [];

    for (const tag of group.outbounds) {
      if (tag === '{all}') {
        expanded.push(...filteredTags);
      } else {
        expanded.push(tag);
      }
    }

    group.outbounds = unique(expanded);

    log(
      `🧩 ${group.tag}: {all} 展开为 ${filteredTags.length} 个节点`
    );
  }
  if (Object.prototype.hasOwnProperty.call(group, 'filter')) {
    delete group.filter;
  }

  if (Array.isArray(group.outbounds)) {
    group.outbounds = unique(
      group.outbounds.filter(tag => tag !== '{all}')
    );
  }
}

const compatibleOutbound = {
  tag: 'COMPATIBLE',
  type: 'direct'
};

let compatibleAdded = false;

log(`⑥ 空 outbounds 检查`);
for (const group of config.outbounds) {
  const isMatchedGroup = outboundRules.some(([pattern]) =>
    createOutboundRegExp(pattern).test(group.tag || '')
  );

  if (
    isMatchedGroup &&
    Array.isArray(group.outbounds) &&
    group.outbounds.length === 0
  ) {
    if (!compatibleAdded) {
      config.outbounds.push(compatibleOutbound);
      compatibleAdded = true;
    }

    group.outbounds.push(compatibleOutbound.tag);

    log(
      `🕳 ${group.tag} 的 outbounds 为空，自动插入 COMPATIBLE(direct)`
    );
  }
}

config.outbounds.push(...outbounds);
if (!Array.isArray(config.endpoints)) {
  config.endpoints = [];
}

config.endpoints.push(...endpoints);

// 清除可能残留的模板占位符和扩展字段
for (const group of config.outbounds) {
  if (Array.isArray(group.outbounds)) {
    group.outbounds = unique(
      group.outbounds.filter(tag => tag !== '{all}')
    );
  }

  delete group.filter;
}

$content = JSON.stringify(config, null, 2);
function matchesFilters(tag, filters) {
  let includedByIncludeRule = false;

  const includeRules = filters.filter(
    rule => rule && rule.action === 'include'
  );

  if (includeRules.length > 0) {
    includedByIncludeRule = includeRules.some(
      rule => keywordMatch(tag, rule.keywords)
    );

    if (!includedByIncludeRule) {
      return false;
    }
  }

  for (const rule of filters) {
    if (!rule || rule.action !== 'exclude') {
      continue;
    }

    if (keywordMatch(tag, rule.keywords)) {
      return false;
    }
  }

  return true;
}
function keywordMatch(tag, keywords) {
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return false;
  }

  return keywords.some(keyword => {
    try {
      return new RegExp(String(keyword), 'i').test(tag);
    } catch (e) {
      log(`⚠️ 忽略无效 filter 正则：${keyword}`);
      return false;
    }
  });
}

function unique(values) {
  return [
    ...new Set(
      (values || []).filter(
        v => typeof v === 'string' && v.length > 0
      )
    )
  ];
}

function getTags(items, regex) {
  return (
    regex
      ? items.filter(p => regex.test(p.tag || ''))
      : items
  )
    .map(p => p.tag)
    .filter(Boolean);
}

function log(value) {
  console.log(`[📦 sing-box 模板脚本兼容修正版] ${value}`);
}

function createTagRegExp(tagPattern) {
  return new RegExp(
    String(tagPattern || '.*').replace('ℹ️', ''),
    String(tagPattern || '').includes('ℹ️') ? 'i' : undefined
  );
}

function createOutboundRegExp(outboundPattern) {
  return new RegExp(
    String(outboundPattern || '.*').replace('ℹ️', ''),
    String(outboundPattern || '').includes('ℹ️') ? 'i' : undefined
  );
}

log(`🔚 结束`);