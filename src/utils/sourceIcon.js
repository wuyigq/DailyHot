const LOCAL_LOGO_NAMES = new Set([
  "36kr",
  "acfun",
  "baidu",
  "bilibili",
  "douban-group",
  "douban-movie",
  "douyin",
  "genshin",
  "github",
  "hellogithub",
  "honkai",
  "ithome",
  "jianshu",
  "juejin",
  "kuaishou",
  "lol",
  "netease-news",
  "ngabbs",
  "qq-news",
  "sspai",
  "starrail",
  "thepaper",
  "tieba",
  "toutiao",
  "v2ex",
  "weibo",
  "weread",
  "zhihu",
  "zhihu-daily",
]);

const SOURCE_LINKS = {
  amazon: "https://www.amazon.com/",
  aliyun: "https://www.aliyun.com/",
  "51cto": "https://www.51cto.com/",
  coolapk: "https://www.coolapk.com/",
  dgtle: "https://www.dgtle.com/",
  "douban-read": "https://read.douban.com/",
  earthquake: "https://www.ceic.ac.cn/",
  enshan: "https://www.right.com.cn/forum/",
  cf: "https://cf.qq.com/",
  gameforpeace: "https://gp.qq.com/",
  gameres: "https://www.gameres.com/",
  geekpark: "https://www.geekpark.net/",
  guokr: "https://www.guokr.com/",
  hackernews: "https://news.ycombinator.com/",
  history: "https://baike.baidu.com/",
  hongguo: "https://novelquickapp.com/",
  hostloc: "https://hostloc.com/",
  hupu: "https://www.hupu.com/",
  huxiu: "https://www.huxiu.com/",
  ifanr: "https://www.ifanr.com/",
  "ithome-xijiayi": "https://www.ithome.com/",
  kepuchina: "https://www.kepuchina.cn/",
  linuxdo: "https://linux.do/",
  miyoushe: "https://www.miyoushe.com/",
  newsmth: "https://www.newsmth.net/",
  nobelprize: "https://www.nobelprize.org/",
  nodeseek: "https://www.nodeseek.com/",
  nytimes: "https://www.nytimes.com/",
  producthunt: "https://www.producthunt.com/",
  "52pojie": "https://www.52pojie.cn/",
  csdn: "https://www.csdn.net/",
  seedhub: "https://www.seedhub.cc/",
  sina: "https://sinanews.sina.cn/",
  "sina-news": "https://sinanews.sina.cn/",
  smzdm: "https://www.smzdm.com/",
  "tencent-video": "https://v.qq.com/",
  v2ex: "https://www.v2ex.com/",
  wallstreetcn: "https://wallstreetcn.com/",
  weatheralarm: "http://nmc.cn/publish/alarm.html",
  wildrift: "https://lolm.qq.com/",
  wzry: "https://pvp.qq.com/",
  xinhua: "https://www.news.cn/",
  yicai: "https://www.yicai.com/",
  yystv: "https://www.yystv.cn/",
  dnf: "https://dnf.qq.com/",
};

const ICON_OVERRIDES = {
  earthquake: "/logo/earthquake.svg",
  baidu: "https://www.baidu.com/favicon.ico",
  "douban-group": "https://www.douban.com/favicon.ico",
  sspai: "https://cdn.sspai.com/favicon.ico",
  "52pojie": "https://www.52pojie.cn/favicon.ico",
  geekpark: "/logo/geekpark.svg",
  hostloc: "https://hostloc.com/favicon.ico",
  hupu: "https://www.hupu.com/favicon.ico",
  linuxdo: "https://linux.do/favicon.ico",
  nodeseek: "https://nodeseek.com/favicon.ico",
  weatheralarm: "/logo/weatheralarm.svg",
  yystv: "/logo/yystv.svg",
};

const ERROR_ICON_URL = "/ico/icon_error.png";

const toFaviconUrl = (value) => {
  if (!value) return "";

  try {
    const url = new URL(value);
    return `${url.protocol}//${url.hostname}/favicon.ico`;
  } catch {
    return "";
  }
};

const toDuckIconUrl = (value) => {
  if (!value) return "";

  try {
    const url = new URL(value);
    return `https://icons.duckduckgo.com/ip3/${url.hostname}.ico`;
  } catch {
    return "";
  }
};

const uniq = (values) => [...new Set(values.filter(Boolean))];

export const getSourceIconCandidates = (name, link = "") => {
  if (LOCAL_LOGO_NAMES.has(name)) {
    return [`/logo/${name}.png`];
  }

  const sourceLink = link || SOURCE_LINKS[name] || "";
  return uniq([
    ICON_OVERRIDES[name],
    toFaviconUrl(sourceLink),
    toDuckIconUrl(sourceLink),
    toFaviconUrl(SOURCE_LINKS[name]),
    toDuckIconUrl(SOURCE_LINKS[name]),
  ]);
};

export const getSourceIconUrl = (name, link = "") => {
  return getSourceIconCandidates(name, link)[0] || ERROR_ICON_URL;
};

export const getSourceIconCandidatesAttr = (name, link = "") =>
  getSourceIconCandidates(name, link).join("|");

export const onSourceIconError = (event) => {
  const target = event?.target;
  if (!target) return;

  const candidates = (target.dataset.iconCandidates || "")
    .split("|")
    .filter(Boolean);
  const nextIndex = Number(target.dataset.iconIndex || "0") + 1;

  if (candidates[nextIndex]) {
    target.dataset.iconIndex = String(nextIndex);
    target.src = candidates[nextIndex];
    return;
  }

  if (!target.src.endsWith(ERROR_ICON_URL)) {
    target.src = ERROR_ICON_URL;
  }
};
