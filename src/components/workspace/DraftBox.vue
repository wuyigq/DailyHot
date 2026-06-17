<template>
  <n-card class="draft-box">
    <template #header>
      <div class="panel-header">
        <div>
          <div class="panel-title">草稿箱与发布检查</div>
          <n-text :depth="3">编辑草稿、审核状态、发布检查、发布包</n-text>
        </div>
      </div>
    </template>

    <n-grid cols="1 720:3" :x-gap="10" :y-gap="10" class="filter-row">
      <n-grid-item>
        <n-select
          :value="filters.platform"
          :options="platformFilterOptions"
          @update:value="patchFilters({ platform: $event })"
        />
      </n-grid-item>
      <n-grid-item>
        <n-select
          :value="filters.risk"
          :options="riskFilterOptions"
          @update:value="patchFilters({ risk: $event })"
        />
      </n-grid-item>
      <n-grid-item>
        <n-select
          :value="filters.reviewStatus"
          :options="reviewFilterOptions"
          @update:value="patchFilters({ reviewStatus: $event })"
        />
      </n-grid-item>
    </n-grid>

    <n-spin :show="loading">
      <div v-if="drafts.length" class="draft-list">
        <article
          v-for="draft in drafts"
          :key="draft.id"
          class="draft-card"
          :class="{ active: activeDraftId === draft.id }"
          @click="$emit('select', draft.id)"
        >
          <div class="draft-head">
            <div class="meta-row">
              <n-tag round size="small">{{ platformLabel(draft.platform) }}</n-tag>
              <n-tag round size="small" :type="riskType(draft.topic?.riskLevel)">
                {{ riskLabel(draft.topic?.riskLevel) }}
              </n-tag>
              <n-tag round size="small" :type="reviewType(draft.reviewStatus)">
                {{ reviewLabel(draft.reviewStatus) }}
              </n-tag>
            </div>
            <n-text :depth="3">{{ formatDate(draft.createdAt) }}</n-text>
          </div>

          <h3>{{ draft.topic?.title || "未命名热点" }}</h3>

          <n-input
            :value="draft.content"
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 14 }"
            @update:value="$emit('update-content', { draftId: draft.id, content: $event })"
            @click.stop
          />

          <div class="review-row">
            <n-button size="tiny" secondary @click.stop="$emit('review', { draft, reviewStatus: 'reviewing' })">
              送审
            </n-button>
            <n-button size="tiny" type="success" secondary @click.stop="$emit('review', { draft, reviewStatus: 'approved' })">
              审核通过
            </n-button>
            <n-button size="tiny" type="error" secondary @click.stop="$emit('review', { draft, reviewStatus: 'rejected' })">
              驳回
            </n-button>
          </div>

          <div class="action-row">
            <n-button size="small" secondary @click.stop="$emit('save', draft)">保存</n-button>
            <n-button size="small" secondary @click.stop="$emit('check', draft)">发布检查</n-button>
            <n-button size="small" secondary @click.stop="$emit('publish-package', draft)">
              生成发布包
            </n-button>
            <n-button size="small" secondary @click.stop="$emit('copy', draft.content)">复制</n-button>
            <n-button size="small" type="error" secondary @click.stop="$emit('archive', draft)">
              归档
            </n-button>
          </div>

          <n-alert
            v-if="publishBlocked(draft)"
            type="warning"
            :show-icon="false"
            class="warning-box"
          >
            该草稿为高风险热点，未审核通过前不可生成发布包。
          </n-alert>

          <n-alert
            v-if="checkResults[draft.id]"
            class="check-box"
            :type="checkResults[draft.id].passed ? 'success' : 'warning'"
            :show-icon="false"
          >
            <div class="check-head">
              <strong>{{ checkResults[draft.id].passed ? "检查通过" : "检查未通过" }}</strong>
              <n-text :depth="3">
                {{ checkResults[draft.id].length }} / {{ checkResults[draft.id].limit }} 字
              </n-text>
            </div>
            <ul class="issue-list">
              <li v-for="issue in checkResults[draft.id].issues" :key="issue.message">
                [{{ issue.level }}] {{ issue.message }}
              </li>
            </ul>
            <div v-if="checkResults[draft.id].suggestions?.length" class="suggestion-list">
              <span v-for="suggestion in checkResults[draft.id].suggestions" :key="suggestion">
                {{ suggestion }}
              </span>
            </div>
          </n-alert>

          <n-card
            v-if="publishPackages[draft.id]"
            size="small"
            embedded
            class="package-card"
          >
            <template #header>
              <div class="panel-header">
                <span>{{ publishPackages[draft.id].platformName }}发布包</span>
                <n-button
                  size="tiny"
                  secondary
                  @click.stop="$emit('open-deeplink', publishPackages[draft.id])"
                >
                  打开平台
                </n-button>
              </div>
            </template>
            <n-input
              :value="publishPackages[draft.id].copyText"
              type="textarea"
              readonly
              :autosize="{ minRows: 5, maxRows: 10 }"
            />
            <div class="hashtag-row">
              <n-tag
                v-for="tag in publishPackages[draft.id].hashtags"
                :key="tag"
                size="small"
                round
              >
                #{{ tag }}
              </n-tag>
            </div>
            <ul class="issue-list compact">
              <li v-for="item in publishPackages[draft.id].checklist" :key="item">
                {{ item }}
              </li>
            </ul>
            <div class="media-box">
              <strong>封面 / 配图建议</strong>
              <p>{{ publishPackages[draft.id].mediaSuggestion.coverTitle }}</p>
              <n-input
                :value="publishPackages[draft.id].mediaSuggestion.imagePrompt"
                type="textarea"
                readonly
                :autosize="{ minRows: 3, maxRows: 6 }"
              />
            </div>
          </n-card>
        </article>
      </div>
      <n-empty v-else description="还没有草稿，先从热点详情里生成一条" />
    </n-spin>
  </n-card>
</template>

<script setup>
defineProps({
  drafts: {
    type: Array,
    default: () => [],
  },
  activeDraftId: {
    type: String,
    default: "",
  },
  checkResults: {
    type: Object,
    default: () => ({}),
  },
  publishPackages: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  filters: {
    type: Object,
    default: () => ({
      platform: "all",
      risk: "all",
      reviewStatus: "all",
    }),
  },
});

const emit = defineEmits([
  "update:filters",
  "select",
  "update-content",
  "save",
  "review",
  "check",
  "publish-package",
  "copy",
  "archive",
  "open-deeplink",
]);

const platformFilterOptions = [
  { label: "全部平台", value: "all" },
  { label: "小红书笔记", value: "xiaohongshu" },
  { label: "朋友圈动态", value: "moments" },
  { label: "公众号开头", value: "article" },
  { label: "视频口播", value: "video" },
  { label: "微博短评", value: "weibo" },
];

const riskFilterOptions = [
  { label: "全部风险", value: "all" },
  { label: "低风险", value: "low" },
  { label: "需核实", value: "medium" },
  { label: "高风险", value: "high" },
];

const reviewFilterOptions = [
  { label: "全部状态", value: "all" },
  { label: "草稿", value: "draft" },
  { label: "审核中", value: "reviewing" },
  { label: "已通过", value: "approved" },
  { label: "已驳回", value: "rejected" },
];

const patchFilters = (patch) => {
  emit("update:filters", patch);
};

const platformLabel = (platform) =>
  (
    {
      xiaohongshu: "小红书笔记",
      moments: "朋友圈动态",
      article: "公众号开头",
      video: "视频口播",
      weibo: "微博短评",
    }[platform] || platform
  );

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

const reviewLabel = (status) =>
  (
    {
      draft: "草稿",
      reviewing: "审核中",
      approved: "已通过",
      rejected: "已驳回",
    }[status || "draft"] || "草稿"
  );

const reviewType = (status) =>
  (
    {
      draft: "default",
      reviewing: "warning",
      approved: "success",
      rejected: "error",
    }[status || "draft"] || "default"
  );

const publishBlocked = (draft) => draft.topic?.riskLevel === "high" && draft.reviewStatus !== "approved";

const formatDate = (date) => new Date(date).toLocaleString();
</script>

<style lang="scss" scoped>
.draft-box {
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

  .filter-row {
    margin-bottom: 16px;
  }

  .draft-list {
    display: grid;
    gap: 14px;
  }

  .draft-card {
    display: grid;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--n-border-color);
    border-radius: 18px;
    transition: 0.2s ease;

    &:hover,
    &.active {
      border-color: rgba(45, 112, 237, 0.34);
      box-shadow: 0 10px 24px rgba(45, 112, 237, 0.08);
    }

    h3 {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
    }
  }

  .draft-head,
  .meta-row,
  .review-row,
  .action-row,
  .hashtag-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .draft-head {
    justify-content: space-between;
  }

  .check-box,
  .warning-box {
    margin-top: -2px;
  }

  .check-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .issue-list {
    margin: 0;
    padding-left: 18px;
    color: var(--n-text-color-2);
    line-height: 1.7;

    &.compact {
      margin-top: 10px;
    }
  }

  .suggestion-list {
    display: grid;
    gap: 6px;
    margin-top: 10px;
    color: var(--n-text-color-3);
    font-size: 13px;
  }

  .package-card {
    margin-top: 4px;
  }

  .media-box {
    display: grid;
    gap: 8px;
    margin-top: 12px;
    padding: 12px;
    border-radius: 14px;
    background: rgba(247, 251, 255, 0.9);

    p {
      margin: 0;
      color: var(--n-text-color-2);
    }
  }
}
</style>
