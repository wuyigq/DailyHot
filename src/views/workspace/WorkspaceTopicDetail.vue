<template>
  <div class="workspace-page">
    <n-card class="panel">
      <template #header>
        <div class="card-header">
          <span>热点详情与草稿生成</span>
          <n-space>
            <n-button secondary strong @click="router.push('/workspace/topics')">
              返回热点流
            </n-button>
            <n-button type="primary" strong :loading="generating" @click="generateDraft">
              生成并保存草稿
            </n-button>
          </n-space>
        </div>
      </template>

      <n-spin :show="loading">
      <n-empty v-if="!topic" description="没有找到该热点，请返回热点流重新选择" />

      <template v-else>
        <div class="headline">
          <div>
            <h2>{{ topic.title }}</h2>
            <n-space size="small" class="tag-row">
              <n-tag size="small" round>{{ topic.sourceTitle }}</n-tag>
              <n-tag size="small" :type="riskType(topic.riskLevel)" round>
                {{ riskLabel(topic.riskLevel) }}
              </n-tag>
              <n-tag size="small" round>行业：{{ workspace.merchantProfile.industry }}</n-tag>
              <n-tag size="small" round>城市：{{ workspace.merchantProfile.city }}</n-tag>
            </n-space>
          </div>
          <n-button text @click="openTopic(topic)">查看原始来源</n-button>
        </div>

        <n-grid cols="1 900:2" :x-gap="20" :y-gap="20">
          <n-grid-item>
            <n-card embedded title="热点摘要">
              <p class="desc">{{ topic.summary || topic.desc || "该热点暂无摘要，可直接查看来源链接。" }}</p>
              <p v-if="topic.opportunityReason" class="desc opportunity">
                {{ topic.opportunityReason }}
              </p>
              <ul class="source-list">
                <li v-for="source in topic.relatedSources || [topic]" :key="`${source.source}-${source.url}`">
                  <a :href="source.url" target="_blank" rel="noreferrer">
                    {{ source.sourceTitle || source.source }}
                  </a>
                </li>
              </ul>
            </n-card>
          </n-grid-item>

          <n-grid-item>
            <n-card embedded title="商家转化建议">
              <ul class="todo-list">
                <li>优先从 {{ merchantAngle }} 角度切入，不做泛观点评论。</li>
                <li>文案里要保留业务关键词：{{ merchantKeywords }}。</li>
                <li>如果风险等级为“需核实”或“高风险”，发布前必须先走内容检查。</li>
                <li>当前先服务 {{ merchantPlatforms }}，避免一次铺太多平台。</li>
                <li v-if="topic.applicableScenes?.length">推荐场景：{{ topic.applicableScenes.join("、") }}。</li>
              </ul>
            </n-card>
          </n-grid-item>
        </n-grid>

        <n-card class="generate-card" embedded title="生成参数">
          <n-form label-placement="top">
            <n-grid cols="1 760:2" :x-gap="16" :y-gap="8">
              <n-grid-item>
                <n-form-item label="内容模板">
                  <n-select v-model:value="draftOptions.platform" :options="draftPlatformOptions" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="内容类型">
                  <n-select v-model:value="draftOptions.contentType" :options="contentTypeOptions" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="语气">
                  <n-select v-model:value="draftOptions.tone" :options="toneOptions" />
                </n-form-item>
              </n-grid-item>
            </n-grid>
          </n-form>
        </n-card>
      </template>
      </n-spin>
    </n-card>
  </div>
</template>

<script setup>
import { generateWorkspaceDraft, getWorkspaceTopicDetail } from "@/api";
import { workspaceStore } from "@/store";
import {
  contentTypeOptions,
  draftPlatformOptions,
  getPlatformLabel,
  getRiskLabel,
  toneOptions,
} from "@/utils/workspace";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const workspace = workspaceStore();

const generating = ref(false);
const loading = ref(false);
const topic = ref(null);
const draftOptions = ref({
  platform: "xiaohongshu",
  contentType: "activity",
  tone: workspace.preferences.tone || "balanced",
});

const merchantKeywords = computed(() => workspace.merchantProfile.keywords.join("、") || "待配置");
const merchantPlatforms = computed(() =>
  (workspace.merchantProfile.platforms || []).map((item) => getPlatformLabel(item)).join(" / ") || "待配置",
);

const merchantAngle = computed(() => {
  return {
    餐饮: "门店活动、套餐推荐、到店动机",
    美业: "案例展示、体验转化、优惠咨询",
    教培: "试听引导、家长关心点、招生窗口",
    本地生活: "同城场景、福利活动、到店体验",
    房产: "板块关注、看房咨询、购房决策",
  }[workspace.merchantProfile.industry] || "门店转化";
});

const riskLabel = (level) => getRiskLabel(level);
const riskType = (level) => ({
  low: "success",
  medium: "warning",
  high: "error",
}[level] || "default");

const openTopic = (currentTopic) => {
  const url = window.innerWidth > 680 ? currentTopic.url : currentTopic.mobileUrl || currentTopic.url;
  if (url) window.open(url, "_blank");
};

const syncDraftOptionsFromTopic = () => {
  const recommendedFormats = topic.value?.recommendedFormats || [];
  if (recommendedFormats.length && !recommendedFormats.includes(draftOptions.value.contentType)) {
    draftOptions.value.contentType = recommendedFormats[0];
  }
  if (draftOptions.value.contentType === "video-script") {
    draftOptions.value.platform = "video";
  }
};

const loadTopicDetail = async (refresh = false) => {
  const topicId = String(route.params.topicId || "").trim();
  if (!topicId) {
    topic.value = null;
    return;
  }
  loading.value = true;
  try {
    const res = await getWorkspaceTopicDetail(topicId, {
      cache: !refresh,
    });
    if (res?.code === 200) {
      topic.value = res.data;
      workspace.setSelectedTopic(res.data);
      syncDraftOptionsFromTopic();
    } else {
      topic.value = null;
    }
  } finally {
    loading.value = false;
  }
};

const generateDraft = async () => {
  if (!topic.value) return;
  generating.value = true;
  try {
    const res = await generateWorkspaceDraft({
      topic: topic.value,
      ...draftOptions.value,
    });
    if (res?.code === 200) {
      $message.success("草稿已生成并保存到草稿箱");
      router.push("/workspace/drafts");
    }
  } finally {
    generating.value = false;
  }
};

onMounted(() => {
  loadTopicDetail();
});

watch(
  () => route.params.topicId,
  () => {
    loadTopicDetail();
  },
);
</script>

<style lang="scss" scoped>
.workspace-page {
  display: grid;
}

.panel {
  border-radius: 18px;
}

.card-header,
.headline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.headline {
  margin-bottom: 18px;

  h2 {
    margin: 0 0 10px;
    font-size: clamp(24px, 3vw, 34px);
    line-height: 1.25;
  }
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.desc,
.todo-list {
  margin: 0;
  color: var(--n-text-color-2);
  line-height: 1.8;
}

.opportunity {
  color: #ea444d;
}

.todo-list,
.source-list {
  padding-left: 18px;
}

.source-list {
  margin-top: 12px;
  line-height: 1.9;
}

.generate-card {
  margin-top: 20px;
}

@media (max-width: 760px) {
  .card-header,
  .headline {
    flex-direction: column;
  }
}
</style>
