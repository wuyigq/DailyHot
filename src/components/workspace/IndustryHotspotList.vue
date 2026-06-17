<template>
  <n-card class="hotspot-panel">
    <template #header>
      <div class="panel-header">
        <div>
          <div class="panel-title">行业热点流</div>
          <n-text :depth="3">
            {{ topics.length }} 条候选
            <template v-if="updatedAt"> · {{ formatDate(updatedAt) }} 更新 </template>
          </n-text>
        </div>
        <n-button size="small" secondary :loading="loading" @click="$emit('refresh')">
          刷新
        </n-button>
      </div>
    </template>

    <n-spin :show="loading">
      <div v-if="topics.length" class="topic-list">
        <article
          v-for="topic in topics"
          :key="topic.id"
          class="topic-card"
          :class="{ active: selectedTopicId === topic.id }"
          @click="$emit('select', topic)"
        >
          <div class="topic-topline">
            <n-tag size="small" round :type="riskType(topic.riskLevel)">
              {{ riskLabel(topic.riskLevel) }}
            </n-tag>
            <n-text :depth="3">匹配分 {{ topic.score }}</n-text>
          </div>

          <h3>{{ topic.title }}</h3>
          <p v-if="topic.desc">{{ topic.desc }}</p>

          <div class="meta-row">
            <n-tag size="small" round>{{ topic.sourceTitle }}</n-tag>
            <n-tag size="small" round type="info">
              {{ topic.relatedSources?.length || 1 }} 个来源
            </n-tag>
          </div>

          <div class="keyword-row">
            <n-tag
              v-for="keyword in topicKeywords(topic)"
              :key="keyword"
              size="small"
              type="warning"
              round
            >
              {{ keyword }}
            </n-tag>
          </div>

          <div class="topic-actions">
            <n-button size="tiny" quaternary @click.stop="$emit('open-source', topic)">
              查看来源
            </n-button>
          </div>
        </article>
      </div>
      <n-empty v-else description="暂无行业热点，先调整配置或刷新热榜源" />
    </n-spin>
  </n-card>
</template>

<script setup>
const props = defineProps({
  topics: {
    type: Array,
    default: () => [],
  },
  selectedTopicId: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: String,
    default: "",
  },
});

defineEmits(["refresh", "select", "open-source"]);

const topicKeywords = (topic) =>
  [...new Set([...(topic.matchedKeywords || []), ...(topic.matchedCategories || [])])].slice(0, 5);

const riskLabel = (risk) =>
  (
    {
      low: "低风险",
      medium: "需核实",
      high: "高风险",
    }[risk] || "需核实"
  );

const riskType = (risk) =>
  (
    {
      low: "success",
      medium: "warning",
      high: "error",
    }[risk] || "warning"
  );

const formatDate = (date) => new Date(date).toLocaleString();
</script>

<style lang="scss" scoped>
.hotspot-panel {
  height: 100%;
  border-radius: 18px;

  .panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .panel-title {
    margin-bottom: 4px;
    font-size: 18px;
    font-weight: 700;
  }

  .topic-list {
    display: grid;
    gap: 12px;
  }

  .topic-card {
    display: grid;
    gap: 10px;
    padding: 16px;
    border: 1px solid var(--n-border-color);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.68);
    cursor: pointer;
    transition: 0.2s ease;

    &:hover,
    &.active {
      border-color: rgba(234, 68, 77, 0.52);
      box-shadow: 0 12px 30px rgba(234, 68, 77, 0.08);
      transform: translateY(-1px);
    }

    h3 {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
    }

    p {
      margin: 0;
      color: var(--n-text-color-2);
      line-height: 1.7;
    }
  }

  .topic-topline,
  .meta-row,
  .keyword-row,
  .topic-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .topic-topline {
    justify-content: space-between;
  }
}
</style>
