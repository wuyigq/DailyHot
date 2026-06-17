<template>
  <n-card class="generate-panel">
    <template #header>
      <div class="panel-header">
        <div>
          <div class="panel-title">热点详情与生成</div>
          <n-text :depth="3">来源、风险、适用场景、草稿生成</n-text>
        </div>
      </div>
    </template>

    <n-empty v-if="!topic" description="先从左侧选择一条行业热点" />

    <div v-else class="content">
      <div class="topic-summary">
        <div class="summary-topline">
          <n-tag round :type="riskType(topic.riskLevel)">
            {{ riskLabel(topic.riskLevel) }}
          </n-tag>
          <n-tag round type="info">
            {{ platformGuide[platform].label }}
          </n-tag>
        </div>
        <h2>{{ topic.title }}</h2>
        <p v-if="topic.desc">{{ topic.desc }}</p>
        <div class="meta-row">
          <n-text :depth="3">来源：{{ topic.sourceTitle }}</n-text>
          <n-text v-if="topic.firstSeenAt" :depth="3">
            首见：{{ formatDate(topic.firstSeenAt) }}
          </n-text>
          <n-text v-if="topic.latestSeenAt" :depth="3">
            最新：{{ formatDate(topic.latestSeenAt) }}
          </n-text>
        </div>
      </div>

      <div class="insight-grid">
        <div class="insight-card">
          <strong>适用场景</strong>
          <p>{{ sceneSummary(topic) }}</p>
        </div>
        <div class="insight-card">
          <strong>表达提醒</strong>
          <p>{{ riskSummary(topic) }}</p>
        </div>
        <div class="insight-card persona-card">
          <strong>品牌身份</strong>
          <p>{{ persona.identity || "建议先在左侧补充商家身份说明，再生成草稿。" }}</p>
        </div>
      </div>

      <div class="source-list">
        <n-button
          v-for="source in topic.relatedSources || [topic]"
          :key="`${source.source}-${source.url}`"
          size="tiny"
          secondary
          @click="$emit('open-source', source)"
        >
          {{ source.sourceTitle || source.source }}
        </n-button>
      </div>

      <n-form label-placement="top" class="generate-form">
        <n-form-item label="生成模板">
          <n-radio-group :value="platform" @update:value="$emit('update:platform', $event)">
            <n-space wrap>
              <n-radio-button
                v-for="item in platformOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </n-radio-button>
            </n-space>
          </n-radio-group>
          <n-alert class="platform-tip" type="info" :show-icon="false">
            {{ platformGuide[platform].tip }}
          </n-alert>
        </n-form-item>

        <n-form-item label="表达语气">
          <n-radio-group :value="tone" @update:value="$emit('update:tone', $event)">
            <n-space wrap>
              <n-radio-button value="balanced">克制理性</n-radio-button>
              <n-radio-button value="professional">专业可信</n-radio-button>
              <n-radio-button value="casual">轻松口语</n-radio-button>
              <n-radio-button value="sharp">观点鲜明</n-radio-button>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="本期转化目标">
          <n-input :value="goal" readonly placeholder="左侧填写后会作为生成语境参考" />
        </n-form-item>
      </n-form>

      <n-button type="primary" strong block :loading="generating" @click="$emit('generate')">
        基于该热点生成草稿
      </n-button>
    </div>
  </n-card>
</template>

<script setup>
defineProps({
  topic: {
    type: Object,
    default: null,
  },
  persona: {
    type: Object,
    default: () => ({}),
  },
  goal: {
    type: String,
    default: "",
  },
  platform: {
    type: String,
    default: "xiaohongshu",
  },
  tone: {
    type: String,
    default: "balanced",
  },
  generating: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:platform", "update:tone", "generate", "open-source"]);

const platformOptions = [
  { label: "小红书笔记", value: "xiaohongshu" },
  { label: "朋友圈动态", value: "moments" },
  { label: "公众号开头", value: "article" },
  { label: "视频口播", value: "video" },
  { label: "微博短评", value: "weibo" },
];

const platformGuide = {
  xiaohongshu: {
    label: "种草笔记",
    tip: "适合门店活动、节日趋势、城市生活角度，强调场景和转化动作。",
  },
  moments: {
    label: "私域触达",
    tip: "适合朋友圈或社群同步，内容要短、稳、带来源和活动信息。",
  },
  article: {
    label: "公众号引子",
    tip: "适合长文开头，先交代热点，再落到行业判断和门店动作。",
  },
  video: {
    label: "口播脚本",
    tip: "适合短视频口播，结构要清楚，前 3 秒先点明热点和关键信息。",
  },
  weibo: {
    label: "短评快发",
    tip: "适合轻量快发，优先简洁结论和来源，不要做重判断。",
  },
};

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

const sceneSummary = (topic) => {
  const matched = [...(topic.matchedKeywords || []), ...(topic.matchedCategories || [])].slice(0, 4);
  if (!matched.length) return "适合作为当天选题备用池，先观察热度是否继续上升。";
  return `当前热点和 ${matched.join("、")} 相关，适合转成门店活动、行业观察或平台借势内容。`;
};

const riskSummary = (topic) => {
  if (topic.riskLevel === "high") {
    return "高风险话题必须保留来源，不建议直接下结论，生成后先走审核。";
  }
  if (topic.riskLevel === "medium") {
    return "内容可生成，但发布前建议再核一次事实和引用来源。";
  }
  return "风险较低，适合快速生成后进入发布检查。";
};

const formatDate = (date) => new Date(date).toLocaleString();
</script>

<style lang="scss" scoped>
.generate-panel {
  height: 100%;
  border-radius: 18px;

  .panel-title {
    margin-bottom: 4px;
    font-size: 18px;
    font-weight: 700;
  }

  .content {
    display: grid;
    gap: 16px;
  }

  .topic-summary {
    display: grid;
    gap: 10px;
    padding: 18px;
    border-radius: 18px;
    background:
      linear-gradient(135deg, rgba(255, 244, 230, 0.82), rgba(255, 255, 255, 0.84));
    border: 1px solid rgba(234, 68, 77, 0.12);

    h2 {
      margin: 0;
      font-size: 24px;
      line-height: 1.25;
    }

    p {
      margin: 0;
      color: var(--n-text-color-2);
      line-height: 1.8;
    }
  }

  .summary-topline,
  .meta-row,
  .source-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .insight-grid {
    display: grid;
    gap: 12px;
  }

  .insight-card {
    padding: 14px;
    border: 1px solid var(--n-border-color);
    border-radius: 16px;

    strong {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
    }

    p {
      margin: 0;
      color: var(--n-text-color-2);
      line-height: 1.7;
    }
  }

  .persona-card {
    background: rgba(247, 251, 255, 0.88);
  }

  .generate-form {
    border-top: 1px dashed var(--n-border-color);
    padding-top: 4px;
  }

  .platform-tip {
    margin-top: 10px;
  }
}
</style>
