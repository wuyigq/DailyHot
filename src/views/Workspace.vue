<template>
  <div class="workspace">
    <section class="hero">
      <div>
        <n-tag type="success" round>Phase 1 MVP</n-tag>
        <h1>个人热点雷达</h1>
        <p>
          按关键词和类型筛选全网热点，选择一条话题后生成可编辑的发布草稿。
          当前阶段优先跑通“看热点 → 生成 → 复制/分享”的手机可用闭环。
        </p>
      </div>
      <n-space>
        <n-button secondary strong @click="loadFeed(true)" :loading="feedLoading">
          拉取最新
        </n-button>
        <n-button type="primary" strong @click="savePreferences" :loading="saving">
          保存设置
        </n-button>
      </n-space>
    </section>

    <n-grid cols="1 980:3" :x-gap="20" :y-gap="20">
      <n-grid-item>
        <n-card title="订阅设置" class="panel">
          <n-form label-placement="top">
            <n-form-item label="关键词">
              <n-dynamic-tags v-model:value="preferences.keywords" />
            </n-form-item>
            <n-form-item label="类型">
              <n-checkbox-group v-model:value="preferences.categories">
                <n-space>
                  <n-checkbox
                    v-for="item in categoryOptions"
                    :key="item"
                    :value="item"
                    :label="item"
                  />
                </n-space>
              </n-checkbox-group>
            </n-form-item>
            <n-form-item label="排除词">
              <n-dynamic-tags v-model:value="preferences.excludeWords" />
            </n-form-item>
            <n-form-item label="热点来源">
              <n-checkbox-group v-model:value="preferences.sources">
                <n-space>
                  <n-checkbox
                    v-for="item in sourceOptions"
                    :key="item.name"
                    :value="item.name"
                    :label="item.label"
                  />
                </n-space>
              </n-checkbox-group>
            </n-form-item>
            <n-form-item label="默认语气">
              <n-radio-group v-model:value="preferences.tone">
                <n-space>
                  <n-radio-button value="balanced">克制理性</n-radio-button>
                  <n-radio-button value="sharp">观点鲜明</n-radio-button>
                  <n-radio-button value="casual">轻松口语</n-radio-button>
                  <n-radio-button value="professional">专业分析</n-radio-button>
                </n-space>
              </n-radio-group>
            </n-form-item>
          </n-form>
        </n-card>
      </n-grid-item>

      <n-grid-item :span="2">
        <n-card class="panel">
          <template #header>
            <div class="card-header">
              <span>我的热点流</span>
              <n-text :depth="3">{{ feed.length }} 条匹配</n-text>
            </div>
          </template>
          <n-alert v-if="feedError" type="warning" :show-icon="false">
            {{ feedError }}
          </n-alert>
          <n-spin :show="feedLoading">
            <div v-if="feed.length" class="topic-list">
              <article
                v-for="topic in feed"
                :key="`${topic.source}-${topic.id}-${topic.title}`"
                class="topic"
                :class="{ active: selectedTopic?.title === topic.title }"
                @click="selectTopic(topic)"
              >
                <div class="topic-main">
                  <div class="topic-title">{{ topic.title }}</div>
                  <div class="topic-meta">
                    <n-tag size="small" round>{{ topic.sourceTitle }}</n-tag>
                    <n-tag size="small" :type="riskType(topic.riskLevel)" round>
                      {{ riskLabel(topic.riskLevel) }}
                    </n-tag>
                    <n-text :depth="3">匹配分 {{ topic.score }}</n-text>
                  </div>
                  <p v-if="topic.desc" class="topic-desc">{{ topic.desc }}</p>
                  <n-space size="small" class="matches">
                    <n-tag
                      v-for="word in [...topic.matchedKeywords, ...topic.matchedCategories]"
                      :key="word"
                      size="small"
                      type="info"
                      round
                    >
                      {{ word }}
                    </n-tag>
                  </n-space>
                </div>
                <n-button text type="primary" @click.stop="openTopic(topic)">
                  来源
                </n-button>
              </article>
            </div>
            <n-empty v-else description="暂无匹配热点，调整关键词或点击拉取最新" />
          </n-spin>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid cols="1 900:2" :x-gap="20" :y-gap="20" class="bottom-grid">
      <n-grid-item>
        <n-card title="生成草稿" class="panel">
          <n-empty v-if="!selectedTopic" description="先从热点流选择一条话题" />
          <template v-else>
            <n-alert type="info" :show-icon="false">
              已选择：{{ selectedTopic.title }}
            </n-alert>
            <n-form label-placement="top" class="generate-form">
              <n-form-item label="平台模板">
                <n-radio-group v-model:value="draftOptions.platform">
                  <n-space>
                    <n-radio-button value="weibo">微博短评</n-radio-button>
                    <n-radio-button value="xiaohongshu">小红书笔记</n-radio-button>
                    <n-radio-button value="video">视频口播</n-radio-button>
                  </n-space>
                </n-radio-group>
              </n-form-item>
              <n-form-item label="语气">
                <n-radio-group v-model:value="draftOptions.tone">
                  <n-space>
                    <n-radio-button value="balanced">克制理性</n-radio-button>
                    <n-radio-button value="sharp">观点鲜明</n-radio-button>
                    <n-radio-button value="casual">轻松口语</n-radio-button>
                    <n-radio-button value="professional">专业分析</n-radio-button>
                  </n-space>
                </n-radio-group>
              </n-form-item>
            </n-form>
            <n-button
              type="primary"
              strong
              block
              :loading="generating"
              @click="generateDraft"
            >
              生成并保存草稿
            </n-button>
          </template>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card class="panel">
          <template #header>
            <div class="card-header">
              <span>草稿箱</span>
              <n-button size="small" secondary @click="loadDrafts">刷新</n-button>
            </div>
          </template>
          <div v-if="drafts.length" class="draft-list">
            <article v-for="draft in drafts" :key="draft.id" class="draft">
              <div class="draft-meta">
                <n-tag size="small" round>{{ platformLabel(draft.platform) }}</n-tag>
                <n-text :depth="3">{{ formatDate(draft.createdAt) }}</n-text>
              </div>
              <h3>{{ draft.topic.title }}</h3>
              <n-input
                v-model:value="draft.content"
                type="textarea"
                :autosize="{ minRows: 5, maxRows: 12 }"
              />
              <n-space justify="end" class="draft-actions">
                <n-button size="small" secondary @click="copyDraft(draft.content)">
                  复制
                </n-button>
                <n-button size="small" type="primary" secondary @click="shareDraft(draft.content)">
                  手机分享
                </n-button>
              </n-space>
            </article>
          </div>
          <n-empty v-else description="还没有草稿" />
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup>
import {
  generateWorkspaceDraft,
  getWorkspaceDrafts,
  getWorkspaceFeed,
  getWorkspacePreferences,
  saveWorkspacePreferences,
} from "@/api";

const categoryOptions = ["体育", "娱乐", "科技", "财经", "政治", "军事", "游戏", "社会"];
const sourceOptions = [
  { label: "微博", name: "weibo" },
  { label: "知乎", name: "zhihu" },
  { label: "哔哩哔哩", name: "bilibili" },
  { label: "抖音", name: "douyin" },
  { label: "今日头条", name: "toutiao" },
  { label: "IT之家", name: "ithome" },
];

const preferences = ref({
  keywords: [],
  categories: [],
  excludeWords: [],
  sources: [],
  tone: "balanced",
});
const draftOptions = ref({
  platform: "weibo",
  tone: "balanced",
});
const feed = ref([]);
const drafts = ref([]);
const selectedTopic = ref(null);
const saving = ref(false);
const feedLoading = ref(false);
const generating = ref(false);
const feedError = ref("");

const loadPreferences = async () => {
  const res = await getWorkspacePreferences();
  if (res.code === 200) {
    preferences.value = res.data;
    draftOptions.value.tone = res.data.tone;
  }
};

const savePreferences = async () => {
  saving.value = true;
  try {
    const res = await saveWorkspacePreferences(preferences.value);
    if (res.code === 200) {
      $message.success("订阅设置已保存");
      await loadFeed(false);
    }
  } finally {
    saving.value = false;
  }
};

const loadFeed = async (isNew = false) => {
  feedLoading.value = true;
  feedError.value = "";
  try {
    const res = await getWorkspaceFeed({ cache: !isNew, limit: 80 });
    if (res.code === 200) {
      feed.value = res.data;
      selectedTopic.value = res.data[0] || null;
    } else {
      feedError.value = res.message || "热点流加载失败";
    }
  } catch (error) {
    feedError.value = "热点流加载失败，请检查后端服务";
  } finally {
    feedLoading.value = false;
  }
};

const loadDrafts = async () => {
  const res = await getWorkspaceDrafts();
  if (res.code === 200) drafts.value = res.data;
};

const selectTopic = (topic) => {
  selectedTopic.value = topic;
};

const openTopic = (topic) => {
  const url = window.innerWidth > 680 ? topic.url : topic.mobileUrl || topic.url;
  if (url) window.open(url, "_blank");
};

const generateDraft = async () => {
  if (!selectedTopic.value) return;
  generating.value = true;
  try {
    const res = await generateWorkspaceDraft({
      topic: selectedTopic.value,
      ...draftOptions.value,
    });
    if (res.code === 200) {
      $message.success("草稿已生成");
      drafts.value = [res.data, ...drafts.value];
    }
  } finally {
    generating.value = false;
  }
};

const copyDraft = async (content) => {
  await navigator.clipboard.writeText(content);
  $message.success("已复制到剪贴板");
};

const shareDraft = async (content) => {
  if (navigator.share) {
    await navigator.share({ text: content });
  } else {
    await copyDraft(content);
    $message.info("当前浏览器不支持系统分享，已复制文案");
  }
};

const riskLabel = (risk) => {
  return {
    low: "低风险",
    medium: "需核实",
    high: "高风险",
  }[risk];
};

const riskType = (risk) => {
  return {
    low: "success",
    medium: "warning",
    high: "error",
  }[risk];
};

const platformLabel = (platform) => {
  return {
    weibo: "微博短评",
    xiaohongshu: "小红书笔记",
    video: "视频口播",
  }[platform] || platform;
};

const formatDate = (date) => new Date(date).toLocaleString();

onMounted(async () => {
  await loadPreferences();
  await Promise.all([loadFeed(false), loadDrafts()]);
});
</script>

<style lang="scss" scoped>
.workspace {
  .hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;
    padding: 28px;
    border-radius: 20px;
    background:
      radial-gradient(circle at 12% 20%, rgba(234, 68, 77, 0.18), transparent 26%),
      linear-gradient(135deg, rgba(45, 112, 237, 0.12), rgba(238, 173, 63, 0.12));

    h1 {
      margin: 14px 0 10px;
      font-size: clamp(30px, 5vw, 56px);
      line-height: 1;
      letter-spacing: -0.08em;
    }

    p {
      max-width: 780px;
      margin: 0;
      font-size: 16px;
      line-height: 1.8;
    }
  }

  .panel {
    height: 100%;
    border-radius: 16px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .topic-list,
  .draft-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .topic {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    padding: 16px;
    border: 1px solid var(--n-border-color);
    border-radius: 14px;
    cursor: pointer;
    transition: 0.2s ease;

    &:hover,
    &.active {
      border-color: #ea444d;
      transform: translateY(-1px);
    }

    .topic-main {
      min-width: 0;
    }

    .topic-title {
      font-size: 17px;
      font-weight: 700;
      line-height: 1.5;
    }

    .topic-meta,
    .matches {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }

    .topic-desc {
      margin: 10px 0 0;
      color: var(--n-text-color-3);
      line-height: 1.7;
    }
  }

  .bottom-grid {
    margin-top: 20px;
  }

  .generate-form {
    margin-top: 18px;
  }

  .draft {
    padding: 16px;
    border: 1px solid var(--n-border-color);
    border-radius: 14px;

    h3 {
      margin: 10px 0;
      font-size: 16px;
    }

    .draft-meta,
    .draft-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .draft-actions {
      margin-top: 12px;
    }
  }

  @media (max-width: 760px) {
    .hero {
      align-items: stretch;
      flex-direction: column;
      padding: 20px;
    }

    .topic {
      flex-direction: column;
    }
  }
}
</style>
