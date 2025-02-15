// 参考 Verge Rev 示例 Script 配置
//
// Clash Verge Rev (Version ≥ 17.2) & Mihomo-Party (Version ≥ 1.5.10)
//
// 最后更新时间: 2024-12-15 08:00

// 规则集通用配置
const ruleProviderCommon = {
  "type": "http",
  "format": "text",
  "interval": 86400
};

// 策略组通用配置
const groupBaseOption = {
  "interval": 300,
  "url": "http://1.1.1.1/generate_204",
  "max-failed-times": 3,
};

// 程序入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 覆盖通用配置
  config["mixed-port"] = "7890";
  config["tcp-concurrent"] = true;
  config["allow-lan"] = true;
  config["ipv6"] = false;
  config["log-level"] = "info";
  config["unified-delay"] = "true";
  config["find-process-mode"] = "strict";
  config["global-client-fingerprint"] = "chrome";

  // 覆盖 dns 配置
  config["dns"] = {
    "enable": true,
    "listen": "0.0.0.0:1053",
    "ipv6": false,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": ["*", "+.lan", "+.local", "+.direct", "+.msftconnecttest.com", "+.msftncsi.com"],
    "nameserver": ["223.5.5.5", "119.29.29.29"]
  };

  // 覆盖 geodata 配置
  config["geodata-mode"] = true;
  config["geox-url"] = {
    "geoip": "https://ghfast.top/https://raw.githubusercontent.com/Loyalsoldier/geoip/release/geoip.dat",
    "geosite": "https://ghfast.top/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
    "mmdb": "https://ghfast.top/https://raw.githubusercontent.com/Loyalsoldier/geoip/release/Country.mmdb",
    "asn": "https://ghfast.top/https://raw.githubusercontent.com/Loyalsoldier/geoip/release/GeoLite2-ASN.mmdb"
  };

  // 覆盖 sniffer 配置
  config["sniffer"] = {
    "enable": true,
    "parse-pure-ip": true,
    "sniff": {
      "TLS": {
        "ports": ["443", "8443"]
      },
      "HTTP": {
        "ports": ["80", "8080-8880"],
        "override-destination": true
      },
      "QUIC": {
        "ports": ["443", "8443"]
      }
    }
  };

  // 覆盖 tun 配置
  config["tun"] = {
    "enable": true,
    "stack": "mixed",
    "dns-hijack": ["any:53"]
  };

  // 覆盖策略组
  config["proxy-groups"] = [
    {...groupBaseOption,"name": "国外网站","type": "select","proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],},
    {...groupBaseOption,"name": "国际媒体","type": "select","proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],},
    {...groupBaseOption,"name": "苹果服务","type": "select","proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],},
    {...groupBaseOption,"name": "微软服务","type": "select","proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],},
    {...groupBaseOption,"name": "谷歌服务","type": "select","proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],},
    {...groupBaseOption,"name": "电报消息","type": "select","proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],},
    {...groupBaseOption,"name": "推特消息","type": "select","proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],},
    {...groupBaseOption,"name": "AI","type": "select","proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],},
    {...groupBaseOption,"name": "游戏平台","type": "select","proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],},
    {...groupBaseOption,"name": "Emby","type": "select","include-all": true,"proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],},
    {...groupBaseOption,"name": "Spotify","type": "select","include-all": true,"proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],},
    {...groupBaseOption,"name": "兜底分流","type": "select","proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "台湾节点", "DIRECT"],},
    // 地区分组
    {...groupBaseOption,"name": "🚀 节点选择","type": "select","proxies": ["🔯 香港故转", "🔯 台湾故转", "🔯 美国故转", "🔯 日本故转", "🔯 新坡故转", "♻️ 香港自动", "♻️ 台湾自动", "♻️ 美国自动", "♻️ 日本自动", "♻️ 新坡自动", "♻️ 自动选择", "🇭🇰 香港节点", "🇹🇼 台湾节点", "🇺🇲 美国节点", "🇯🇵 日本节点", "🇸🇬 新坡节点", "🍃 台湾均衡", "🌐 全部节点", "🌐 其他地区", "DIRECT"],},
    {...groupBaseOption,"name": "♻️ 自动选择","type": "url-test","tolerance": 20,"include-all": true,"exclude-filter": "DIRECT",},
    {...groupBaseOption,"name": "香港节点","type": "url-test","tolerance": 0,"include-all": true,"filter": "(?i)🇭🇰|香港|(\b(HK|Hong)\b)",},
    {...groupBaseOption,"name": "美国节点","type": "url-test","tolerance": 0,"include-all": true,"filter": "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\b(US|United States)\b)",},
    {...groupBaseOption,"name": "狮城节点","type": "url-test","tolerance": 0,"include-all": true,"filter": "(?i)🇸🇬|新加坡|狮|(\b(SG|Singapore)\b)",},
    {...groupBaseOption,"name": "日本节点","type": "url-test","tolerance": 0,"include-all": true,"filter": "(?i)🇯🇵|日本|东京|(\b(JP|Japan)\b)",},
    {...groupBaseOption,"name": "台湾节点","type": "url-test","tolerance": 0,"include-all": true,"filter": "(?i)🇨🇳|🇹🇼|台湾|(\b(TW|Tai|Taiwan)\b)",}
  ];

  // 覆盖规则集
  config["rule-providers"] = {
    "AD": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Reject.list","path": "./rules/AD.list"},
    "Apple": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Apple.list","path": "./rules/Apple.list"},
    "Google": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Google.list","path": "./rules/Google.list"},
    "YouTube": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/YouTube.list","path": "./rules/YouTube.list"},
    "Telegram": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Telegram.list","path": "./rules/Telegram.list"},
    "Twitter": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Twitter.list","path": "./rules/Twitter.list"},
    "Steam": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Steam.list","path": "./rules/Steam.list"},
    "Epic": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Epic.list","path": "./rules/Epic.list"},
    "AI": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/AI.list","path": "./rules/AI.list"},
    "Emby": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Emby.list","path": "./rules/Emby.list"},
    "Spotify": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Spotify.list","path": "./rules/Spotify.list"},
    "Bahamut": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Bahamut.list","path": "./rules/Bahamut.list"},
    "Netflix": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Netflix.list","path": "./rules/Netflix.list"},
    "Disney": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Disney.list","path": "./rules/Disney.list"},
    "PrimeVideo": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/PrimeVideo.list","path": "./rules/PrimeVideo.list"},
    "HBO": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/HBO.list","path": "./rules/HBO.list"},
    "OneDrive": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/OneDrive.list", "path": "./rules/OneDrive.list"},
    "Github": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Github.list","path": "./rules/Github.list"},
    "Microsoft": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Microsoft.list","path": "./rules/Microsoft.list"},
    "Lan": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Lan.list","path": "./rules/Lan.list"},
    "ProxyGFW": {...ruleProviderCommon,"behavior": "classical","url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/ProxyGFW.list","path": "./rules/ProxyGFW.list"}
  };

  // 覆盖规则
  config["rules"] = [
    "RULE-SET,AD,REJECT",
    "RULE-SET,AI,AI",
    "RULE-SET,Apple,苹果服务",
    "RULE-SET,YouTube,谷歌服务",
    "RULE-SET,Google,谷歌服务",
    "RULE-SET,Telegram,电报消息",
    "RULE-SET,Twitter,推特消息",
    "RULE-SET,Steam,游戏平台",
    "RULE-SET,Epic,游戏平台",
    "RULE-SET,Emby,Emby",
    "RULE-SET,Spotify,Spotify",
    "RULE-SET,Bahamut,国际媒体",
    "RULE-SET,Netflix,国际媒体",
    "RULE-SET,Disney,国际媒体",
    "RULE-SET,PrimeVideo,国际媒体",
    "RULE-SET,HBO,国际媒体",
    "GEOSITE,onedrive,微软服务",
    "GEOSITE,github,微软服务",
    "GEOSITE,microsoft,微软服务",
    "GEOSITE,gfw,国外网站",
    "GEOIP,private,DIRECT",
    "GEOIP,cn,DIRECT",
    "MATCH,兜底分流"
  ];

  // 返回修改后的配置
  return config;
}
