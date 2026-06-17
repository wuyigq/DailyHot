<template>
  <div class="workspace-page">
    <n-card class="panel">
      <template #header>
        <div class="card-header">
          <span>行业热点流</span>
          <n-space>
            <n-button secondary strong :loading="loading" @click="loadFeed(true)">
              拉取最新
            </n-button>
            <n-button strong @click="router.push('/workspace/setup')">
              调整筛选条件
            </n-button>
          </n-space>
        </div>
      </template>

      <n-grid cols="1 760:4" :x-gap="12" :y-gap="12" class="summary-grid">
        <n-grid-item>
          <n-statistic label="当前行业" :value="workspace.merchantProfile.industry" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="当前城市" :value="workspace.merchantProfile.city" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="业务关键词数" :value="workspace.merchantProfile.keywords.length" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="匹配热点数" :value="feed.length" />
        </n-grid-item>
      </n-grid>

      <n-alert class="summary-alert" type="info" :show-icon="false">
        当前热点会按「{{ workspace.merchantProfile.industry }} + {{ workspace.merchantProfile.city }} + 业务关键词」做筛选，优先保留可转成商家内容的热点。
      </n-alert>

      <n-spin :show="loading">
        <n-empty v-if="!feed.length" description="暂无匹配热点，建议先完善关键词或刷新数据" />
        <div v-else class="topic-list">
          <article
            v-for="topic in feed"
            :key="`${topic.source}-${topic.id}-${topic.title}`"
            class="topic"
          >
            <div class="topic-main">
              <div class="topic-title">{{ topic.title }}</div>
              <div class="topic-meta">
                <n-tag size="small" round>{{ topic.sourceTitle }}</n-tag>
                <n-tag size="small" :type="riskType(topic.riskLevel)" round>
                  {{ riskLabel(topic.riskLevel) }}
                </n-tag>
                <n-text :depth="3">匹配分 {{ topic.score }}</n-text>
                <n-text :depth="3">来源 {{ topic.sourceCount || topic.relatedSources?.length || 1 }}</n-text>
              </div>
              <p v-if="topic.summary || topic.desc" class="topic-desc">{{ topic.summary || topic.desc }}</p>
              <p v-if="topic.opportunityReason" class="topic-opportunity">{{ topic.opportunityReason }}</p>
              <n-space size="small" class="tag-row">
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
            <div class="topic-actions">
              <n-button text @click="openTopic(topic)">来源</n-button>
              <n-button type="primary" strong @click="viewDetail(topic)">
                详情与生成
              </n-button>
            </div>
          </article>
        </div>
      </n-spin>
    </n-card>
  </div>
</template>

<script setup>
import { getWorkspaceFeed } from "@/api";
import { workspaceStore } from "@/store";
import { getRiskLabel } from "@/utils/workspace";
import { useRouter } from "vue-router";

const router = useRouter();
const workspace = workspaceStore();

const loading = ref(false);
const feed = ref([]);

const riskLabel = (level) => getRiskLabel(level);
const riskType = (level) => ({
  low: "success",
  medium: "warning",
  high: "error",
}[level] || "default");

const loadFeed = async (refresh = false) => {
  loading.value = true;
  try {
    const res = await getWorkspaceFeed({
      cache: !refresh,
      limit: 40,
    });
    if (res?.code === 200) {
      feed.value = res.data || [];
    }
  } finally {
    loading.value = false;
  }
};

const openTopic = (topic) => {
  const url = window.innerWidth > 680 ? topic.url : topic.mobileUrl || topic.url;
  if (url) window.open(url, "_blank");
};

const viewDetail = (topic) => {
  workspace.setSelectedTopic(topic);
  router.push(`/workspace/topics/${topic.topicId || topic.id}`);
};

onMounted(async () => {
  await workspace.bootstrap();
  await loadFeed();
});
</script>

<style lang="scss" scoped>
.workspace-page {
  display: grid;
}

.panel {
  border-radius: 18px;
}

.summary-grid {
  margin-bottom: 12px;
}

.summary-alert {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.topic-list {
  display: grid;
  gap: 14px;
}

.topic {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
  border: 1px solid var(--n-border-color);
  border-radius: 16px;

  .topic-main {
    min-width: 0;
  }

  .topic-title {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.5;
  }

  .topic-meta,
  .tag-row,
  .topic-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .topic-desc {
    margin: 10px 0;
    color: var(--n-text-color-2);
    line-height: 1.75;
  }

  .topic-opportunity {
    margin: 0 0 10px;
    color: #ea444d;
    line-height: 1.7;
  }

  .topic-actions {
    justify-content: flex-end;
    min-width: 140px;
  }
}

@media (max-width: 760px) {
  .topic {
    flex-direction: column;

    .topic-actions {
      justify-content: flex-start;
      min-width: 0;
    }
  }
}
</style>
