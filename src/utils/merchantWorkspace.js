export const INDUSTRY_OPTIONS = [
  { label: "餐饮连锁", value: "food" },
  { label: "医美 / 美业", value: "beauty" },
  { label: "教培", value: "education" },
  { label: "本地生活服务", value: "local-service" },
];

export const PLATFORM_OPTIONS = [
  { label: "抖音", value: "douyin" },
  { label: "小红书", value: "xiaohongshu" },
  { label: "视频号", value: "video" },
  { label: "公众号", value: "article" },
  { label: "朋友圈", value: "moments" },
];

export const CITY_OPTIONS = [
  { label: "北京", value: "北京" },
  { label: "上海", value: "上海" },
  { label: "广州", value: "广州" },
  { label: "深圳", value: "深圳" },
  { label: "杭州", value: "杭州" },
  { label: "成都", value: "成都" },
  { label: "武汉", value: "武汉" },
  { label: "西安", value: "西安" },
];

export const CATEGORY_OPTIONS = [
  "体育",
  "娱乐",
  "科技",
  "财经",
  "社会",
  "本地生活",
  "探店",
  "消费趋势",
];

export const SOURCE_OPTIONS = [
  { label: "微博", value: "weibo" },
  { label: "知乎", value: "zhihu" },
  { label: "哔哩哔哩", value: "bilibili" },
  { label: "抖音", value: "douyin" },
  { label: "今日头条", value: "toutiao" },
  { label: "IT之家", value: "ithome" },
  { label: "百度", value: "baidu" },
  { label: "腾讯新闻", value: "qq-news" },
  { label: "澎湃新闻", value: "thepaper" },
];

export const TONE_OPTIONS = [
  { label: "克制理性", value: "balanced" },
  { label: "观点鲜明", value: "sharp" },
  { label: "轻松口语", value: "casual" },
  { label: "专业分析", value: "professional" },
];

const profileKey = (userId) => `merchant-workspace-profile:${userId || "anonymous"}`;

const suggestionMap = {
  food: {
    categories: ["本地生活", "消费趋势", "探店"],
    keywords: ["团购", "到店", "上新", "门店活动"],
  },
  beauty: {
    categories: ["本地生活", "消费趋势"],
    keywords: ["项目上新", "预约咨询", "案例对比", "节日促销"],
  },
  education: {
    categories: ["社会", "消费趋势"],
    keywords: ["招生", "试听", "家长关注", "课程活动"],
  },
  "local-service": {
    categories: ["本地生活", "社会"],
    keywords: ["同城", "服务案例", "门店口碑", "节日活动"],
  },
};

export const createEmptyMerchantProfile = () => ({
  merchantName: "",
  brandName: "",
  industry: "",
  city: "",
  businessType: "",
  businessGoal: "",
  teamSize: "",
  preferredPlatforms: [],
  contactName: "",
  contactPhone: "",
  completedAt: "",
});

export const readMerchantProfile = (userId) => {
  if (!userId) return createEmptyMerchantProfile();

  try {
    const raw = localStorage.getItem(profileKey(userId));
    if (!raw) return createEmptyMerchantProfile();
    return {
      ...createEmptyMerchantProfile(),
      ...JSON.parse(raw),
    };
  } catch (error) {
    console.warn("Failed to read merchant profile", error);
    return createEmptyMerchantProfile();
  }
};

export const saveMerchantProfile = (userId, profile) => {
  if (!userId) return createEmptyMerchantProfile();

  const nextProfile = {
    ...createEmptyMerchantProfile(),
    ...profile,
  };
  localStorage.setItem(profileKey(userId), JSON.stringify(nextProfile));
  return nextProfile;
};

export const isMerchantProfileComplete = (profile) =>
  Boolean(
    profile?.merchantName &&
      profile?.industry &&
      profile?.city &&
      Array.isArray(profile?.preferredPlatforms) &&
      profile.preferredPlatforms.length
  );

export const getIndustryLabel = (value) =>
  INDUSTRY_OPTIONS.find((item) => item.value === value)?.label || value || "未设置";

export const getPlatformLabel = (value) =>
  PLATFORM_OPTIONS.find((item) => item.value === value)?.label || value;

export const getIndustrySuggestions = (industry) =>
  suggestionMap[industry] || { categories: [], keywords: [] };
