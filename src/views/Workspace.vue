<template>
  <div class="workspace-page">
    <section class="workspace-hero">
      <div class="hero-copy">
        <n-tag round type="error" size="small">ToB Web/PWA MVP</n-tag>
        <h1>行业热点工作台</h1>
        <p>
          先跑通商家内容闭环：筛行业热点、看来源和风险、生成草稿、做发布前检查。
        </p>
      </div>
      <div class="hero-actions">
        <n-button secondary strong :loading="feedLoading" @click="loadFeed(true)">
          拉取最新热点
        </n-button>
        <n-button type="primary" strong :loading="savingSetup" @click="saveSetup">
          保存行业配置
        </n-button>
      </div>
    </section>

    <n-grid cols="1 760:4" :x-gap="14" :y-gap="14" class="metric-grid">
      <n-grid-item v-for="item in metricCards" :key="item.label">
        <n-card class="metric-card" size="small">
          <n-statistic :label="item.label" :value="item.value" />
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid cols="1 980:3" :x-gap="20" :y-gap="20">
      <n-grid-item>
        <n-card class="setup-panel">
          <template #header>
            <div class="panel-header">
              <span>商家配置</span>
              <n-text :depth="3">{{ currentUser.name || currentUser.id || "本地默认用户" }}</n-text>
            </div>
          </template>

          <n-form label-placement="top" class="setup-form">
            <n-form-item label="工作台身份">
              <n-grid cols="1 560:2" :x-gap="10" :y-gap="10">
                <n-grid-item>
                  <n-input v-model:value="loginForm.email" placeholder="merchant@example.com" />
                </n-grid-item>
                <n-grid-item>
                  <n-input v-model:value="loginForm.name" placeholder="商家 / 运营名称" />
                </n-grid-item>
              </n-grid>
              <n-space class="identity-actions">
                <n-button size="small" secondary :loading="loginLoading" @click="login">
                  切换身份
                </n-button>
                <n-button size="small" quaternary @click="useDefaultUser">
                  使用本地默认用户
                </n-button>
              </n-space>
            </n-form-item>

            <n-form-item label="行业预设">
              <n-radio-group v-model:value="selectedPresetId">
                <n-space vertical>
                  <n-radio
                    v-for="preset in industryPresets"
                    :key="preset.id"
                    :value="preset.id"
                    :label="preset.label"
                  />
                </n-space>
              </n-radio-group>
              <n-button size="small" secondary class="preset-action" @click="applyIndustryPreset">
                应用到当前配置
              </n-button>
            </n-form-item>

            <n-form-item label="门店城市 / 商圈关键词">
              <n-input v-model:value="localFocus.city" placeholder="例如：上海 徐汇 美罗城" />
            </n-form-item>

            <n-form-item label="本期活动 / 转化目标">
              <n-input
                v-model:value="localFocus.goal"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4 }"
                placeholder="例如：暑期团购、周末到店、暑期课程招生"
              />
            </n-form-item>

            <n-form-item label="热点关键词">
              <n-dynamic-tags v-model:value="preferences.keywords" />
            </n-form-item>

            <n-form-item label="关注维度">
              <n-checkbox-group v-model:value="preferences.categories">
                <n-space wrap>
                  <n-checkbox
                    v-for="item in categoryOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </n-space>
              </n-checkbox-group>
            </n-form-item>

            <n-form-item label="排除词">
              <n-dynamic-tags v-model:value="preferences.excludeWords" />
            </n-form-item>

            <n-form-item label="热点来源">
              <n-checkbox-group v-model:value="preferences.sources">
                <n-space wrap>
                  <n-checkbox
                    v-for="source in sourceOptions"
                    :key="source.value"
                    :label="source.label"
                    :value="source.value"
                  />
                </n-space>
              </n-checkbox-group>
            </n-form-item>

            <n-form-item label="品牌表达">
              <n-radio-group v-model:value="draftOptions.tone">
                <n-space wrap>
                  <n-radio-button value="balanced">克制理性</n-radio-button>
                  <n-radio-button value="professional">专业可信</n-radio-button>
                  <n-radio-button value="casual">轻松好懂</n-radio-button>
                  <n-radio-button value="sharp">观点鲜明</n-radio-button>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item label="发布身份说明">
              <n-input
                v-model:value="persona.identity"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4 }"
                placeholder="例如：本地连锁餐饮运营，关注门店到店转化和城市生活方式"
              />
            </n-form-item>

            <n-form-item label="表达边界">
              <n-dynamic-tags v-model:value="persona.boundaries" />
            </n-form-item>
          </n-form>
        </n-card>
      </n-grid-item>

      <n-grid-item :span="2">
        <n-grid cols="1 1200:2" :x-gap="20" :y-gap="20">
          <n-grid-item>
            <IndustryHotspotList
              :topics="feed"
              :selected-topic-id="selectedTopic?.id"
              :loading="feedLoading"
              :updated-at="feedUpdatedAt"
              @refresh="loadFeed(true)"
              @select="selectTopic"
              @open-source="openTopic"
            />
          </n-grid-item>

          <n-grid-item>
            <HotspotGeneratePanel
              :topic="selectedTopic"
              :persona="persona"
              :goal="localFocus.goal"
              :platform="draftOptions.platform"
              :tone="draftOptions.tone"
              :generating="generating"
              @update:platform="draftOptions.platform = $event"
              @update:tone="draftOptions.tone = $event"
              @generate="generateDraft"
              @open-source="openTopic"
            />
          </n-grid-item>
        </n-grid>
      </n-grid-item>
    </n-grid>

    <DraftBox
      class="draft-section"
      :drafts="filteredDrafts"
      :active-draft-id="activeDraftId"
      :check-results="checkResults"
      :publish-packages="publishPackages"
      :loading="draftLoading"
      :filters="draftFilters"
      @update:filters="updateDraftFilters"
      @select="setActiveDraft"
      @update-content="updateDraftContent"
      @save="saveDraftContent"
      @review="updateReview"
      @check="checkDraft"
      @publish-package="loadPublishPackage"
      @copy="copyDraft"
      @archive="archiveDraft"
      @open-deeplink="openPublishTarget"
    />
  </div>
</template>

<script setup>
import {
  archiveWorkspaceDraft,
  checkWorkspaceDraft,
  generateWorkspaceDraft,
  getWorkspaceDrafts,
  getWorkspaceFeed,
  getWorkspaceMe,
  getWorkspaceOverview,
  getWorkspacePersona,
  getWorkspacePreferences,
  getWorkspacePublishPackage,
  loginWorkspace,
  saveWorkspaceDraftContent,
  saveWorkspacePersona,
  saveWorkspacePreferences,
  updateWorkspaceDraftReview,
} from "@/api";
import DraftBox from "@/components/workspace/DraftBox.vue";
import HotspotGeneratePanel from "@/components/workspace/HotspotGeneratePanel.vue";
import IndustryHotspotList from "@/components/workspace/IndustryHotspotList.vue";

const industryPresets = [
  {
    id: "catering",
    label: "餐饮门店",
    keywords: ["餐饮", "门店", "团购", "探店", "到店"],
    categories: ["社会", "财经", "娱乐"],
    identity: "本地餐饮商家运营，关注到店转化、套餐活动和城市生活热点",
    goal: "周末到店、团购成交、节日活动预热",
  },
  {
    id: "travel",
    label: "本地文旅",
    keywords: ["文旅", "景区", "出游", "演出", "周末"],
    categories: ["社会", "娱乐", "财经"],
    identity: "本地文旅品牌运营，关注节假日出游、城市活动和线下消费热度",
    goal: "周末客流、活动预约、节庆营销",
  },
  {
    id: "education",
    label: "教育培训",
    keywords: ["招生", "课程", "培训", "家长", "暑期班"],
    categories: ["社会", "财经", "科技"],
    identity: "教育培训机构内容运营，关注家长决策、课程报名和口碑传播",
    goal: "暑期班招生、试听转化、家长咨询",
  },
  {
    id: "wellness",
    label: "美业健身",
    keywords: ["健身", "美业", "会员", "门店", "优惠"],
    categories: ["社会", "财经", "娱乐"],
    identity: "本地美业健身门店运营，关注会员增长、到店复购和季节性活动",
    goal: "拉新办卡、活动预约、老客复购",
  },
];

const categoryOptions = ["社会", "财经", "科技", "娱乐", "体育"];
const sourceOptions = [
  { label: "微博", value: "weibo" },
  { label: "知乎", value: "zhihu" },
  { label: "B 站", value: "bilibili" },
  { label: "抖音", value: "douyin" },
  { label: "头条", value: "toutiao" },
  { label: "IT之家", value: "ithome" },
  { label: "百度", value: "baidu" },
  { label: "腾讯新闻", value: "qq-news" },
  { label: "新浪新闻", value: "sina-news" },
  { label: "澎湃", value: "thepaper" },
];

const currentUser = ref({});
const loginForm = ref({
  email: "merchant@example.com",
  name: "本地商家工作台",
});
const selectedPresetId = ref(industryPresets[0].id);
const localFocus = ref({
  city: "",
  goal: "",
});
const preferences = ref({
  keywords: [],
  categories: [],
  excludeWords: [],
  sources: [],
  tone: "balanced",
});
const persona = ref({
  displayName: "",
  identity: "",
  boundaries: [],
});
const draftOptions = ref({
  platform: "xiaohongshu",
  tone: "balanced",
});
const draftFilters = ref({
  platform: "all",
  risk: "all",
  reviewStatus: "all",
});
const overview = ref({
  draftCount: 0,
  publishCount: 0,
  pendingScheduleCount: 0,
  totals: {
    views: 0,
    leads: 0,
  },
});
const feed = ref([]);
const drafts = ref([]);
const checkResults = ref({});
const publishPackages = ref({});
const selectedTopic = ref(null);
const activeDraftId = ref("");
const feedUpdatedAt = ref("");
const feedLoading = ref(false);
const draftLoading = ref(false);
const generating = ref(false);
const savingSetup = ref(false);
const loginLoading = ref(false);

const metricCards = computed(() => [
  { label: "热点候选", value: feed.value.length },
  { label: "草稿数", value: overview.value.draftCount || 0 },
  { label: "待发布", value: overview.value.pendingScheduleCount || 0 },
  { label: "累计线索", value: overview.value.totals?.leads || 0 },
]);

const filteredDrafts = computed(() =>
  drafts.value.filter((draft) => {
    const platformMatched =
      draftFilters.value.platform === "all" || draft.platform === draftFilters.value.platform;
    const riskMatched =
      draftFilters.value.risk === "all" || draft.topic?.riskLevel === draftFilters.value.risk;
    const reviewMatched =
      draftFilters.value.reviewStatus === "all" ||
      (draft.reviewStatus || "draft") === draftFilters.value.reviewStatus;
    return platformMatched && riskMatched && reviewMatched;
  })
);

const applyIndustryPreset = () => {
  const preset = industryPresets.find((item) => item.id === selectedPresetId.value);
  if (!preset) return;
  preferences.value.keywords = [...preset.keywords];
  preferences.value.categories = [...preset.categories];
  persona.value.identity = preset.identity;
  localFocus.value.goal = preset.goal;
  draftOptions.value.tone = "professional";
};

const hydrateLocalFocus = () => {
  const keywordText = preferences.value.keywords.join(" ");
  if (!localFocus.value.city) {
    const cityMatch = keywordText.match(/北京|上海|广州|深圳|杭州|成都|重庆|苏州|南京|武汉|西安/);
    if (cityMatch) localFocus.value.city = cityMatch[0];
  }
};

const loadMe = async () => {
  const res = await getWorkspaceMe();
  if (res.code === 200) {
    currentUser.value = res.data;
    if (!loginForm.value.email && res.data.email) loginForm.value.email = res.data.email;
    if (!loginForm.value.name && res.data.name) loginForm.value.name = res.data.name;
  }
};

const loadPreferences = async () => {
  const res = await getWorkspacePreferences();
  if (res.code === 200) {
    preferences.value = res.data;
    draftOptions.value.tone = res.data.tone || draftOptions.value.tone;
    hydrateLocalFocus();
  }
};

const loadPersona = async () => {
  const res = await getWorkspacePersona();
  if (res.code === 200) {
    persona.value = {
      displayName: res.data.displayName || "",
      identity: res.data.identity || "",
      boundaries: res.data.boundaries || [],
    };
  }
};

const loadOverview = async () => {
  const res = await getWorkspaceOverview();
  if (res.code === 200) overview.value = res.data;
};

const loadFeed = async (isNew = false) => {
  feedLoading.value = true;
  try {
    const res = await getWorkspaceFeed({
      cache: !isNew,
      limit: 24,
    });
    if (res.code === 200) {
      feed.value = res.data;
      feedUpdatedAt.value = res.updateTime;
      if (!selectedTopic.value && res.data[0]) {
        selectedTopic.value = res.data[0];
      } else if (selectedTopic.value) {
        selectedTopic.value =
          res.data.find((item) => item.id === selectedTopic.value.id) || res.data[0] || null;
      }
    }
  } finally {
    feedLoading.value = false;
  }
};

const loadDrafts = async () => {
  draftLoading.value = true;
  try {
    const res = await getWorkspaceDrafts();
    if (res.code === 200) {
      drafts.value = res.data;
      if (!activeDraftId.value && res.data[0]) {
        activeDraftId.value = res.data[0].id;
      }
    }
  } finally {
    draftLoading.value = false;
  }
};

const reloadWorkspace = async () => {
  await Promise.all([loadMe(), loadPreferences(), loadPersona()]);
  if (!preferences.value.keywords.length) applyIndustryPreset();
  await Promise.all([loadOverview(), loadFeed(), loadDrafts()]);
};

const saveSetup = async () => {
  savingSetup.value = true;
  try {
    const mergedKeywords = [
      ...preferences.value.keywords,
      ...localFocus.value.city.split(/\s+/),
      ...localFocus.value.goal.split(/[、,，\s]+/),
    ]
      .map((item) => String(item).trim())
      .filter(Boolean);

    const nextPreferences = {
      ...preferences.value,
      keywords: [...new Set(mergedKeywords)],
      tone: draftOptions.value.tone,
    };

    const nextPersona = {
      ...persona.value,
      displayName: persona.value.displayName || currentUser.value.name || "本地商家",
      identity:
        persona.value.identity ||
        "本地商家内容运营，默认保留来源，优先服务线索转化与门店增长",
      voice: draftOptions.value.tone,
      viewpoints: [],
      forbiddenWords: [],
      boundaries: persona.value.boundaries || [],
    };

    const [prefRes, personaRes] = await Promise.all([
      saveWorkspacePreferences(nextPreferences),
      saveWorkspacePersona(nextPersona),
    ]);

    if (prefRes.code === 200) preferences.value = prefRes.data;
    if (personaRes.code === 200) {
      persona.value = {
        displayName: personaRes.data.displayName || "",
        identity: personaRes.data.identity || "",
        boundaries: personaRes.data.boundaries || [],
      };
    }
    $message.success("行业配置已保存");
    await loadFeed(true);
  } finally {
    savingSetup.value = false;
  }
};

const login = async () => {
  if (!loginForm.value.email) {
    $message.warning("请先填写工作台邮箱");
    return;
  }
  loginLoading.value = true;
  try {
    const res = await loginWorkspace(loginForm.value);
    if (res.code === 200) {
      localStorage.setItem("workspaceUserId", res.data.id);
      currentUser.value = res.data;
      $message.success("工作台身份已切换");
      await reloadWorkspace();
    }
  } finally {
    loginLoading.value = false;
  }
};

const useDefaultUser = async () => {
  localStorage.removeItem("workspaceUserId");
  currentUser.value = {};
  $message.info("已切换为本地默认用户");
  await reloadWorkspace();
};

const selectTopic = (topic) => {
  selectedTopic.value = topic;
};

const openTopic = (topic) => {
  const url = window.innerWidth > 680 ? topic.url : topic.mobileUrl || topic.url;
  if (url) window.open(url, "_blank");
};

const generateDraft = async () => {
  if (!selectedTopic.value) {
    $message.warning("请先选择一个热点");
    return;
  }
  generating.value = true;
  try {
    const res = await generateWorkspaceDraft({
      topic: selectedTopic.value,
      platform: draftOptions.value.platform,
      tone: draftOptions.value.tone,
    });
    if (res.code === 200) {
      drafts.value = [res.data, ...drafts.value];
      activeDraftId.value = res.data.id;
      $message.success("草稿已生成并加入草稿箱");
      await loadOverview();
    }
  } finally {
    generating.value = false;
  }
};

const setActiveDraft = (draftId) => {
  activeDraftId.value = draftId;
};

const updateDraftFilters = (patch) => {
  draftFilters.value = {
    ...draftFilters.value,
    ...patch,
  };
};

const updateDraftContent = ({ draftId, content }) => {
  const draft = drafts.value.find((item) => item.id === draftId);
  if (draft) draft.content = content;
};

const saveDraftContent = async (draft) => {
  const res = await saveWorkspaceDraftContent(draft.id, {
    content: draft.content,
    note: "工作台手动保存",
  });
  if (res.code === 200) {
    Object.assign(draft, res.data.draft);
    $message.success("草稿内容已保存");
  }
};

const updateReview = async ({ draft, reviewStatus }) => {
  const res = await updateWorkspaceDraftReview(draft.id, { reviewStatus });
  if (res.code === 200) {
    Object.assign(draft, res.data);
    $message.success(`审核状态已更新为${reviewLabel(reviewStatus)}`);
  }
};

const checkDraft = async (draft) => {
  const res = await checkWorkspaceDraft(draft.id, { content: draft.content });
  if (res.code === 200) {
    checkResults.value = {
      ...checkResults.value,
      [draft.id]: res.data,
    };
    $message[res.data.passed ? "success" : "warning"](
      res.data.passed ? "发布检查通过" : "发布前仍有待处理项"
    );
  }
};

const loadPublishPackage = async (draft) => {
  try {
    const res = await getWorkspacePublishPackage(draft.id);
    if (res.code === 200) {
      publishPackages.value = {
        ...publishPackages.value,
        [draft.id]: res.data,
      };
      $message.success("发布包已生成");
    }
  } catch (error) {
    // Interceptor already surfaces the server reason.
  }
};

const copyDraft = async (content) => {
  try {
    await navigator.clipboard.writeText(content);
    $message.success("已复制到剪贴板");
  } catch (error) {
    $message.error("当前浏览器不支持剪贴板复制");
  }
};

const archiveDraft = async (draft) => {
  const res = await archiveWorkspaceDraft(draft.id);
  if (res.code === 200) {
    drafts.value = drafts.value.filter((item) => item.id !== draft.id);
    delete checkResults.value[draft.id];
    delete publishPackages.value[draft.id];
    if (activeDraftId.value === draft.id) {
      activeDraftId.value = drafts.value[0]?.id || "";
    }
    $message.success("草稿已归档");
    await loadOverview();
  }
};

const openPublishTarget = (payload) => {
  const target = payload?.deeplinks?.[0];
  if (!target?.url) {
    $message.warning("当前平台没有可用的跳转入口");
    return;
  }
  const url = window.innerWidth <= 680 && target.mobileUrl ? target.mobileUrl : target.url;
  window.open(url, "_blank");
};

const reviewLabel = (status) =>
  (
    {
      draft: "草稿",
      reviewing: "审核中",
      approved: "已通过",
      rejected: "已驳回",
    }[status] || "草稿"
  );

onMounted(async () => {
  await reloadWorkspace();
});
</script>

<style lang="scss" scoped>
.workspace-page {
  display: grid;
  gap: 20px;
  padding-bottom: 28px;

  .workspace-hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    padding: 28px;
    border: 1px solid rgba(234, 68, 77, 0.14);
    border-radius: 24px;
    background:
      radial-gradient(circle at top left, rgba(234, 68, 77, 0.18), transparent 30%),
      linear-gradient(135deg, rgba(255, 244, 230, 0.96), rgba(247, 251, 255, 0.98));

    h1 {
      margin: 12px 0 8px;
      font-size: clamp(34px, 5vw, 58px);
      line-height: 0.96;
      letter-spacing: -0.08em;
    }

    p {
      max-width: 760px;
      margin: 0;
      color: var(--n-text-color-2);
      font-size: 15px;
      line-height: 1.8;
    }
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
  }

  .metric-card,
  .setup-panel {
    border-radius: 18px;
  }

  .metric-grid {
    margin-top: -2px;
  }

  .setup-form {
    .identity-actions {
      margin-top: 10px;
    }

    .preset-action {
      margin-top: 12px;
    }
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .draft-section {
    margin-top: 6px;
  }

  @media (max-width: 900px) {
    .workspace-hero {
      flex-direction: column;
      align-items: stretch;
      padding: 22px;
    }

    .hero-actions {
      justify-content: flex-start;
    }
  }
}
</style>
