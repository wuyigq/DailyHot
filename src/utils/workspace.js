export const industryOptions = [
  { label: "餐饮连锁", value: "餐饮" },
  { label: "医美 / 美业", value: "美业" },
  { label: "教培", value: "教培" },
  { label: "本地生活服务", value: "本地生活" },
  { label: "房产经纪", value: "房产" },
];

export const cityOptions = [
  { label: "上海", value: "上海" },
  { label: "北京", value: "北京" },
  { label: "深圳", value: "深圳" },
  { label: "广州", value: "广州" },
  { label: "杭州", value: "杭州" },
  { label: "成都", value: "成都" },
];

export const platformOptions = [
  { label: "抖音", value: "douyin" },
  { label: "小红书", value: "xiaohongshu" },
  { label: "视频号", value: "wechat-video" },
];

export const keywordPresets = {
  餐饮: ["团购", "探店", "门店活动", "新品上架", "午餐", "夜宵"],
  美业: ["变美", "护肤", "发型", "项目优惠", "到店体验", "案例分享"],
  教培: ["招生", "试听课", "暑假班", "学习方法", "提分", "家长关注"],
  本地生活: ["同城推荐", "到店打卡", "周末活动", "优惠福利", "本地攻略"],
  房产: ["看房", "楼市", "刚需", "改善置换", "购房政策", "板块分析"],
};

export const categoryOptions = ["本地生活", "消费", "教育", "科技", "财经", "社会", "娱乐"];

export const toneOptions = [
  { label: "克制理性", value: "balanced" },
  { label: "观点鲜明", value: "sharp" },
  { label: "轻松口语", value: "casual" },
  { label: "专业分析", value: "professional" },
];

export const reviewStatusOptions = [
  { label: "全部审核状态", value: "all" },
  { label: "草稿", value: "draft" },
  { label: "审核中", value: "reviewing" },
  { label: "已通过", value: "approved" },
  { label: "已驳回", value: "rejected" },
];

export const riskLevelOptions = [
  { label: "全部风险等级", value: "all" },
  { label: "低风险", value: "low" },
  { label: "需核实", value: "medium" },
  { label: "高风险", value: "high" },
];

export const draftPlatformOptions = [
  { label: "微博短评", value: "weibo" },
  { label: "小红书笔记", value: "xiaohongshu" },
  { label: "公众号开头", value: "article" },
  { label: "朋友圈动态", value: "moments" },
  { label: "视频口播", value: "video" },
];

export const contentTypeOptions = [
  { label: "活动宣传文案", value: "activity" },
  { label: "团购转化文案", value: "group-buy" },
  { label: "短视频口播脚本", value: "video-script" },
  { label: "海报标题文案", value: "poster-title" },
];

export const draftUseCaseLabels = {
  餐饮: "活动宣传文案",
  美业: "案例转化文案",
  教培: "招生转化文案",
  本地生活: "同城引流文案",
  房产: "看房线索文案",
};

export const defaultMerchantProfile = () => ({
  brandName: "",
  industry: "餐饮",
  city: "上海",
  target: "到店转化",
  platforms: ["douyin", "xiaohongshu"],
  keywords: keywordPresets["餐饮"],
});

export const defaultWorkspacePreferences = (profile = defaultMerchantProfile()) => ({
  keywords: profile.keywords || [],
  categories: [profile.industry, profile.city].filter(Boolean),
  excludeWords: ["政治", "军事"],
  sources: ["weibo", "douyin", "zhihu", "36kr", "thepaper", "toutiao"],
  tone: "balanced",
});

export const platformLabelMap = {
  douyin: "抖音",
  xiaohongshu: "小红书",
  "wechat-video": "视频号",
  weibo: "微博短评",
  article: "公众号开头",
  moments: "朋友圈动态",
  video: "视频口播",
};

export const reviewLabelMap = {
  draft: "草稿",
  reviewing: "审核中",
  approved: "已通过",
  rejected: "已驳回",
};

export const contentTypeLabelMap = {
  activity: "活动宣传文案",
  "group-buy": "团购转化文案",
  "video-script": "短视频口播脚本",
  "poster-title": "海报标题文案",
};

export const riskLabelMap = {
  low: "低风险",
  medium: "需核实",
  high: "高风险",
};

export const getPlatformLabel = (platform) => platformLabelMap[platform] || platform || "未指定";

export const getReviewLabel = (status) => reviewLabelMap[status] || "草稿";

export const getRiskLabel = (level) => riskLabelMap[level] || "低风险";

export const getContentTypeLabel = (value) => contentTypeLabelMap[value] || "活动宣传文案";
