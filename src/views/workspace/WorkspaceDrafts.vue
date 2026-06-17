<template>
  <div class="workspace-page">
    <n-card class="panel">
      <template #header>
        <div class="card-header">
          <span>草稿箱</span>
          <n-space>
            <n-button secondary strong :loading="loading" @click="loadDrafts">
              刷新
            </n-button>
            <n-button strong @click="router.push('/workspace/topics')">
              返回热点流
            </n-button>
          </n-space>
        </div>
      </template>

      <n-grid cols="1 720:3" :x-gap="12" :y-gap="12" class="filters">
        <n-grid-item>
          <n-select v-model:value="filters.platform" :options="platformFilterOptions" />
        </n-grid-item>
        <n-grid-item>
          <n-select v-model:value="filters.reviewStatus" :options="reviewStatusOptions" />
        </n-grid-item>
        <n-grid-item>
          <n-select v-model:value="filters.riskLevel" :options="riskLevelOptions" />
        </n-grid-item>
      </n-grid>

      <n-empty v-if="!filteredDrafts.length" description="还没有草稿，先从行业热点生成第一条内容" />

      <div v-else class="draft-list">
        <article v-for="draft in filteredDrafts" :key="draft.id" class="draft-item">
          <div class="draft-top">
            <div>
              <h3>{{ draft.topic.title }}</h3>
              <n-space size="small" class="tag-row">
                <n-tag size="small" round>{{ getPlatformLabel(draft.platform) }}</n-tag>
                <n-tag size="small" round type="info">{{ getContentTypeLabel(draft.contentType) }}</n-tag>
                <n-tag size="small" round>{{ getReviewLabel(draft.reviewStatus) }}</n-tag>
                <n-tag size="small" :type="riskType(draft.topic?.riskLevel)" round>
                  {{ getRiskLabel(draft.topic?.riskLevel) }}
                </n-tag>
              </n-space>
            </div>
            <n-text :depth="3">{{ formatDate(draft.createdAt) }}</n-text>
          </div>

          <n-input
            v-model:value="draft.content"
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 14 }"
          />

          <div class="actions">
            <n-button size="small" secondary @click="saveDraft(draft)">
              保存草稿
            </n-button>
            <n-button size="small" secondary @click="copyDraft(draft.content)">
              复制文案
            </n-button>
            <n-button size="small" secondary @click="exportDraft(draft)">
              导出 TXT
            </n-button>
            <n-button size="small" secondary @click="runCheck(draft)">
              发布前检查
            </n-button>
          </div>

          <n-alert
            v-if="checkResults[draft.id]"
            class="check-result"
            :type="checkResults[draft.id].passed ? 'success' : 'warning'"
            :show-icon="false"
          >
            <div class="check-head">
              <strong>{{ checkResults[draft.id].passed ? "检查通过" : "需要处理后再发布" }}</strong>
              <n-text :depth="3">
                {{ checkResults[draft.id].length }} / {{ checkResults[draft.id].limit }} 字
              </n-text>
            </div>
            <ul>
              <li v-for="issue in checkResults[draft.id].issues" :key="issue.message">
                [{{ issue.level }}] {{ issue.message }}
              </li>
            </ul>
          </n-alert>
        </article>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import {
  checkWorkspaceDraft,
  getWorkspaceDrafts,
  saveWorkspaceDraftContent,
} from "@/api";
import {
  getContentTypeLabel,
  getPlatformLabel,
  getReviewLabel,
  getRiskLabel,
  reviewStatusOptions,
  riskLevelOptions,
} from "@/utils/workspace";
import { useRouter } from "vue-router";

const router = useRouter();
const loading = ref(false);
const drafts = ref([]);
const checkResults = ref({});

const filters = ref({
  platform: "all",
  reviewStatus: "all",
  riskLevel: "all",
});

const platformFilterOptions = [
  { label: "全部平台模板", value: "all" },
  { label: "微博短评", value: "weibo" },
  { label: "小红书笔记", value: "xiaohongshu" },
  { label: "公众号开头", value: "article" },
  { label: "朋友圈动态", value: "moments" },
  { label: "视频口播", value: "video" },
];

const filteredDrafts = computed(() =>
  drafts.value.filter((draft) => {
    if (filters.value.platform !== "all" && draft.platform !== filters.value.platform) return false;
    if (filters.value.reviewStatus !== "all" && draft.reviewStatus !== filters.value.reviewStatus) return false;
    if (filters.value.riskLevel !== "all" && draft.topic?.riskLevel !== filters.value.riskLevel) return false;
    return true;
  }),
);

const riskType = (level) => ({
  low: "success",
  medium: "warning",
  high: "error",
}[level] || "default");

const loadDrafts = async () => {
  loading.value = true;
  try {
    const res = await getWorkspaceDrafts();
    if (res?.code === 200) {
      drafts.value = res.data || [];
    }
  } finally {
    loading.value = false;
  }
};

const saveDraft = async (draft) => {
  const res = await saveWorkspaceDraftContent(draft.id, {
    content: draft.content,
    note: "商家手动编辑保存",
  });
  if (res?.code === 200) {
    Object.assign(draft, res.data.draft);
    $message.success("草稿已保存");
  }
};

const copyDraft = async (content) => {
  await navigator.clipboard.writeText(content);
  $message.success("文案已复制");
};

const exportDraft = (draft) => {
  const blob = new Blob([draft.content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${draft.topic.title.slice(0, 24)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
};

const runCheck = async (draft) => {
  const res = await checkWorkspaceDraft(draft.id, {
    content: draft.content,
  });
  if (res?.code === 200) {
    checkResults.value = {
      ...checkResults.value,
      [draft.id]: res.data,
    };
    $message[res.data.passed ? "success" : "warning"](
      res.data.passed ? "发布检查通过" : "草稿仍有风险项",
    );
  }
};

const formatDate = (date) => new Date(date).toLocaleString();

onMounted(loadDrafts);
</script>

<style lang="scss" scoped>
.workspace-page {
  display: grid;
}

.panel {
  border-radius: 18px;
}

.card-header,
.draft-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.filters {
  margin-bottom: 14px;
}

.draft-list {
  display: grid;
  gap: 14px;
}

.draft-item {
  display: grid;
  gap: 12px;
  padding: 18px;
  border: 1px solid var(--n-border-color);
  border-radius: 16px;

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
  }
}

.tag-row,
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.check-result {
  .check-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 6px;
  }

  ul {
    margin: 0;
    padding-left: 18px;
    line-height: 1.8;
  }
}

@media (max-width: 760px) {
  .card-header,
  .draft-top {
    flex-direction: column;
  }
}
</style>
