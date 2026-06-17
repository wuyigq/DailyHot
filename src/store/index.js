import { defineStore } from "pinia";
import { getAllRoutes } from "@/api";

const toLabel = (name) => {
  const labelMap = {
    bilibili: "哔哩哔哩",
    weibo: "微博",
    douyin: "抖音",
    zhihu: "知乎",
    "36kr": "36氪",
    baidu: "百度",
    sspai: "少数派",
    ithome: "IT之家",
    thepaper: "澎湃新闻",
    toutiao: "今日头条",
    tieba: "百度贴吧",
    juejin: "稀土掘金",
    "qq-news": "腾讯新闻",
    "douban-movie": "豆瓣电影",
    genshin: "原神",
    starrail: "崩坏：星穹铁道",
    lol: "LOL",
    "netease-news": "网易新闻",
    weread: "微信读书",
    "douban-group": "豆瓣讨论小组",
    ngabbs: "NGA",
    hellogithub: "HelloGitHub",
    jianshu: "简书",
    "zhihu-daily": "知乎日报",
    amazon: "亚马逊",
    aliyun: "阿里云",
    "douban-read": "豆瓣阅读",
    enshan: "恩山无线论坛",
    "tencent-video": "腾讯视频",
    wildrift: "英雄联盟手游",
    gameforpeace: "和平精英",
    dnf: "地下城与勇士",
    cf: "CF穿越火线",
    wzry: "王者荣耀",
    hongguo: "红果短剧",
    xinhua: "新华网",
    wallstreetcn: "华尔街见闻",
    yicai: "第一财经",
    nobelprize: "诺贝尔奖",
    kepuchina: "科普中国网",
    seedhub: "SeedHub",
    guokr: "果壳",
    kuaishou: "快手",
    "52pojie": "吾爱破解",
    csdn: "CSDN",
    github: "GitHub",
    v2ex: "V2EX",
    linuxdo: "Linux DO",
  };
  return (
    labelMap[name] ||
    name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
};

export const mainStore = defineStore("mainData", {
  state: () => {
    return {
      // 系统主题
      siteTheme: "light",
      siteThemeAuto: true,
      // 新闻类别
      defaultNewsArr: [
        {
          label: "哔哩哔哩",
          name: "bilibili",
          order: 0,
          show: true,
        },
        {
          label: "微博",
          name: "weibo",
          order: 1,
          show: true,
        },
        {
          label: "抖音",
          name: "douyin",
          order: 2,
          show: true,
        },
        {
          label: "知乎",
          name: "zhihu",
          order: 3,
          show: true,
        },
        {
          label: "36氪",
          name: "36kr",
          order: 4,
          show: true,
        },
        {
          label: "百度",
          name: "baidu",
          order: 5,
          show: true,
        },
        {
          label: "少数派",
          name: "sspai",
          order: 6,
          show: true,
        },
        {
          label: "IT之家",
          name: "ithome",
          order: 7,
          show: true,
        },
        {
          label: "澎湃新闻",
          name: "thepaper",
          order: 8,
          show: true,
        },
        {
          label: "今日头条",
          name: "toutiao",
          order: 9,
          show: true,
        },
        {
          label: "百度贴吧",
          name: "tieba",
          order: 10,
          show: true,
        },
        {
          label: "稀土掘金",
          name: "juejin",
          order: 11,
          show: true,
        },
        {
          label: "腾讯新闻",
          name: "qq-news",
          order: 12,
          show: true,
        },
        {
          label: "豆瓣电影",
          name: "douban-movie",
          order: 13,
          show: true,
        },
        {
          label: "原神",
          name: "genshin",
          order: 14,
          show: true,
        },
        {
          label: "崩坏：星穹铁道",
          name: "starrail",
          order: 16,
          show: true,
        },
        {
          label: "LOL",
          name: "lol",
          order: 15,
          show: true,
        },
        {
          label: "网易新闻",
          name: "netease-news",
          order: 17,
          show: true,
        },
        {
          label: "微信读书",
          name: "weread",
          order: 18,
          show: true,
        },
        {
          label: "豆瓣讨论小组",
          name: "douban-group",
          order: 19,
          show: true,
        },
        {
          label: "NGA",
          name: "ngabbs",
          order: 20,
          show: true,
        },
        {
          label: "HelloGitHub",
          name: "hellogithub",
          order: 21,
          show: true,
        },
        {
          label: "简书",
          name: "jianshu",
          order: 22,
          show: true,
        },
        {
          label: "知乎日报",
          name: "zhihu-daily",
          order: 23,
          show: true,
        },
      ],
      newsArr: [],
      routePage: 0,
      routePageSize: 20,
      routeHasMore: true,
      routeLoading: false,
      routeInitialized: false,
      // 链接跳转方式
      linkOpenType: "open",
      // 页头固定
      headerFixed: true,
      // 时间数据
      timeData: null,
      // 字体大小
      listFontSize: 16,
    };
  },
  getters: {},
  actions: {
    createNewsItem(name, extra = {}) {
      const knownItem = this.defaultNewsArr.find((item) => item.name === name);

      return {
        label: knownItem?.label || toLabel(name),
        name,
        order: knownItem?.order ?? extra.order ?? 0,
        show: knownItem?.show ?? true,
        params: knownItem?.params,
        ...extra,
      };
    },
    mergeRoutes(routes = []) {
      if (!Array.isArray(routes) || routes.length === 0) return;

      const existingMap = new Map(this.newsArr.map((item) => [item.name, item]));
      const nextItems = [...this.newsArr];
      let nextOrder = nextItems.reduce(
        (result, item) => Math.max(result, Number(item.order) || 0),
        -1
      ) + 1;

      routes.forEach((route) => {
        if (!route?.name) return;
        const existing = existingMap.get(route.name);
        if (existing) {
          const knownItem = this.defaultNewsArr.find((item) => item.name === route.name);
          existing.label = existing.label || knownItem?.label || toLabel(route.name);
          if (!existing.params && knownItem?.params) {
            existing.params = knownItem.params;
          }
          return;
        }

        const nextItem = this.createNewsItem(route.name, {
          path: route.path,
          order: nextOrder++,
        });
        nextItems.push(nextItem);
        existingMap.set(route.name, nextItem);
      });

      nextItems.sort((a, b) => Number(a.order) - Number(b.order));
      this.newsArr = nextItems;
    },
    async loadNextRoutePage(force = false) {
      if (this.routeLoading) return;
      if (!this.routeHasMore && !force) return;

      this.routeLoading = true;
      try {
        const nextPage = force ? 1 : this.routePage + 1;
        const res = await getAllRoutes(nextPage, this.routePageSize);

        if (res?.code === 200) {
          this.mergeRoutes(res.routes || []);
          this.routePage = res.page || nextPage;
          this.routeHasMore = Boolean(res.hasMore);
          this.routeInitialized = true;
        }
      } finally {
        this.routeLoading = false;
      }
    },
    // 更改系统主题
    setSiteTheme(val) {
      $message.info(`已切换至${val === "dark" ? "深色模式" : "浅色模式"}`, {
        showIcon: false,
      });
      this.siteTheme = val;
      this.siteThemeAuto = false;
    },
    // 检查更新
    checkNewsUpdate() {
      const mainData = JSON.parse(localStorage.getItem("mainData"));
      let updatedNum = 0;
      if (!mainData) return false;
      // 执行比较并迁移
      if (this.newsArr.length > 0) {
        for (const newItem of this.defaultNewsArr) {
          const exists = this.newsArr.some(
            (news) => newItem.label === news.label && newItem.name === news.name
          );
          if (!exists) {
            console.log("列表有更新：", newItem);
            updatedNum++;
            this.newsArr.push(newItem);
          }
        }
        if (updatedNum) $message.success(`成功更新 ${updatedNum} 个榜单数据`);
      } else {
        this.newsArr = this.defaultNewsArr;
      }
    },
  },
  persist: [
    {
      storage: localStorage,
      paths: [
        "siteTheme",
        "siteThemeAuto",
        "newsArr",
        "routePage",
        "routeHasMore",
        "routeInitialized",
        "linkOpenType",
        "headerFixed",
        "listFontSize",
      ],
    },
  ],
});

export { workspaceStore } from "@/store/workspace";
