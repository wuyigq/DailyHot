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

    <n-grid cols="2 720:5 1100:10" :x-gap="16" :y-gap="16" class="overview-grid">
      <n-grid-item>
        <n-card class="metric-card">
          <n-statistic label="草稿数" :value="overview.draftCount || 0" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="metric-card">
          <n-statistic label="发布记录" :value="overview.publishCount || 0" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="metric-card">
          <n-statistic label="待发布" :value="overview.pendingScheduleCount || 0" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="metric-card">
          <n-statistic label="总曝光" :value="overview.totals?.views || 0" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="metric-card">
          <n-statistic label="线索数" :value="overview.totals?.leads || 0" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="metric-card">
          <n-statistic label="AI 生成" :value="overview.generation?.aiCount || 0" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="metric-card">
          <n-statistic label="模板回退" :value="overview.generation?.templateCount || 0" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="metric-card">
          <n-statistic label="平均耗时(ms)" :value="overview.generation?.averageLatencyMs || 0" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="metric-card">
          <n-statistic label="估算 Tokens" :value="overview.generation?.totalTokens || 0" />
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card class="panel account-panel">
      <template #header>
        <div class="card-header">
          <span>当前用户</span>
          <n-text :depth="3">{{ currentUser.id || "未登录" }}</n-text>
        </div>
      </template>
      <n-grid cols="1 760:4" :x-gap="12" :y-gap="12">
        <n-grid-item>
          <n-input v-model:value="loginForm.email" placeholder="邮箱，例如 creator@example.com" />
        </n-grid-item>
        <n-grid-item>
          <n-input v-model:value="loginForm.name" placeholder="昵称，例如 篮球观察员" />
        </n-grid-item>
        <n-grid-item>
          <n-button type="primary" block :loading="loginLoading" @click="login">
            登录 / 创建本地用户
          </n-button>
        </n-grid-item>
        <n-grid-item>
          <n-button block secondary @click="useDefaultUser">
            使用默认用户
          </n-button>
        </n-grid-item>
      </n-grid>
      <n-alert class="account-tip" type="info" :show-icon="false">
        本阶段是本地轻量登录：用邮箱生成稳定用户 ID，所有订阅、草稿、发布记录会按用户隔离。
      </n-alert>
    </n-card>

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
        <n-card title="人设与观点库" class="panel persona-panel">
          <n-form label-placement="top">
            <n-form-item label="显示名称">
              <n-input v-model:value="persona.displayName" placeholder="例如：篮球观察员" />
            </n-form-item>
            <n-form-item label="身份定位">
              <n-input
                v-model:value="persona.identity"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4 }"
              />
            </n-form-item>
            <n-form-item label="常用观点">
              <n-dynamic-tags v-model:value="persona.viewpoints" />
            </n-form-item>
            <n-form-item label="禁用表达">
              <n-dynamic-tags v-model:value="persona.forbiddenWords" />
            </n-form-item>
            <n-form-item label="表达边界">
              <n-dynamic-tags v-model:value="persona.boundaries" />
            </n-form-item>
            <n-button block secondary strong :loading="personaSaving" @click="savePersona">
              保存人设
            </n-button>
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
            <div class="topic-detail">
              <n-space size="small" class="topic-meta">
                <n-tag size="small" round>
                  {{ selectedTopic.relatedSources?.length || 1 }} 个来源
                </n-tag>
                <n-tag size="small" :type="riskType(selectedTopic.riskLevel)" round>
                  {{ riskLabel(selectedTopic.riskLevel) }}
                </n-tag>
                <n-text v-if="selectedTopic.firstSeenAt" :depth="3">
                  首见：{{ formatDate(selectedTopic.firstSeenAt) }}
                </n-text>
                <n-text v-if="selectedTopic.latestSeenAt" :depth="3">
                  最新：{{ formatDate(selectedTopic.latestSeenAt) }}
                </n-text>
              </n-space>
              <p v-if="selectedTopic.desc">{{ selectedTopic.desc }}</p>
              <n-space size="small" class="source-links">
                <n-button
                  v-for="source in selectedTopic.relatedSources || [selectedTopic]"
                  :key="`${source.source}-${source.url}`"
                  size="tiny"
                  secondary
                  @click="openTopic(source)"
                >
                  {{ source.sourceTitle || source.source }}
                </n-button>
              </n-space>
            </div>
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
          <n-grid cols="1 720:3" :x-gap="8" :y-gap="8" class="draft-filters">
            <n-grid-item>
              <n-select v-model:value="draftFilters.platform" :options="draftPlatformFilterOptions" />
            </n-grid-item>
            <n-grid-item>
              <n-select v-model:value="draftFilters.reviewStatus" :options="draftReviewFilterOptions" />
            </n-grid-item>
            <n-grid-item>
              <n-select v-model:value="draftFilters.riskLevel" :options="draftRiskFilterOptions" />
            </n-grid-item>
          </n-grid>
          <div v-if="filteredDrafts.length" class="draft-list">
            <article v-for="draft in filteredDrafts" :key="draft.id" class="draft">
              <div class="draft-meta">
                <n-tag size="small" round>{{ platformLabel(draft.platform) }}</n-tag>
                <n-tag size="small" round :type="generationType(draft.generationMode)">
                  {{ generationLabel(draft.generationMode) }}
                </n-tag>
                <n-text :depth="3">{{ formatDate(draft.createdAt) }}</n-text>
              </div>
              <h3>{{ draft.topic.title }}</h3>
              <div class="review-row">
                <n-tag size="small" :type="reviewType(draft.reviewStatus)">
                  {{ reviewLabel(draft.reviewStatus) }}
                </n-tag>
                <n-space size="small">
                  <n-button size="tiny" secondary @click="updateReview(draft, 'reviewing')">
                    送审
                  </n-button>
                  <n-button size="tiny" type="success" secondary @click="updateReview(draft, 'approved')">
                    通过
                  </n-button>
                  <n-button size="tiny" type="error" secondary @click="updateReview(draft, 'rejected')">
                    驳回
                  </n-button>
                </n-space>
              </div>
              <n-input
                v-model:value="draft.content"
                type="textarea"
                :autosize="{ minRows: 5, maxRows: 12 }"
              />
              <n-space justify="end" class="draft-actions">
                <n-button size="small" secondary @click="saveDraftContent(draft)">
                  保存版本
                </n-button>
                <n-button size="small" secondary @click="loadDraftVersions(draft)">
                  历史版本
                </n-button>
                <n-button size="small" secondary @click="checkDraft(draft)">
                  发布检查
                </n-button>
                <n-button size="small" secondary :disabled="isPublishBlocked(draft)" @click="loadPublishPackage(draft)">
                  发布助手
                </n-button>
                <n-button size="small" secondary :disabled="isPublishBlocked(draft)" @click="schedulePublish(draft)">
                  加入计划
                </n-button>
                <n-button size="small" secondary @click="copyDraft(draft.content)">
                  复制
                </n-button>
                <n-button size="small" type="primary" secondary @click="shareDraft(draft.content)">
                  手机分享
                </n-button>
                <n-button size="small" type="success" secondary :disabled="isPublishBlocked(draft)" @click="recordPublish(draft)">
                  记录发布
                </n-button>
                <n-button size="small" type="error" secondary @click="archiveDraft(draft)">
                  归档
                </n-button>
              </n-space>
              <n-alert
                v-if="isPublishBlocked(draft)"
                class="check-result"
                type="warning"
                :show-icon="false"
              >
                高风险草稿必须审核通过后才能进入发布流程。
              </n-alert>
              <n-alert
                v-if="checkResults[draft.id]"
                class="check-result"
                :type="checkResults[draft.id].passed ? 'success' : 'warning'"
                :show-icon="false"
              >
                <div class="check-title">
                  {{ checkResults[draft.id].passed ? "检查通过" : "需要处理后再发布" }}
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
              <n-card
                v-if="publishPackages[draft.id]"
                class="publish-package"
                size="small"
                embedded
              >
                <template #header>
                  <div class="card-header">
                    <span>{{ publishPackages[draft.id].platformName }}发布包</span>
                    <n-tag size="small" round>
                      {{ publishPackages[draft.id].copyText.length }} 字
                    </n-tag>
                  </div>
                </template>
                <n-space vertical>
                  <n-input
                    :value="publishPackages[draft.id].copyText"
                    type="textarea"
                    readonly
                    :autosize="{ minRows: 4, maxRows: 8 }"
                  />
                  <div class="tag-row">
                    <n-tag
                      v-for="tag in publishPackages[draft.id].hashtags"
                      :key="tag"
                      size="small"
                      round
                    >
                      #{{ tag }}
                    </n-tag>
                  </div>
                  <ul class="package-checklist">
                    <li v-for="item in publishPackages[draft.id].checklist" :key="item">
                      {{ item }}
                    </li>
                  </ul>
                  <n-space justify="end" class="draft-actions">
                    <n-button size="small" secondary @click="copyDraft(publishPackages[draft.id].copyText)">
                      复制发布包
                    </n-button>
                    <n-button size="small" secondary @click="downloadPackage(publishPackages[draft.id])">
                      下载文案
                    </n-button>
                    <n-button size="small" type="primary" secondary @click="sharePackage(publishPackages[draft.id])">
                      手机分享
                    </n-button>
                    <n-button size="small" type="success" secondary @click="openPublishTarget(publishPackages[draft.id])">
                      打开平台
                    </n-button>
                  </n-space>
                </n-space>
              </n-card>
              <n-card
                v-if="draftVersions[draft.id]?.length"
                class="draft-versions"
                size="small"
                embedded
              >
                <template #header>
                  <div class="card-header">
                    <span>版本历史</span>
                    <n-tag size="small" round>{{ draftVersions[draft.id].length }} 个版本</n-tag>
                  </div>
                </template>
                <n-timeline>
                  <n-timeline-item
                    v-for="version in draftVersions[draft.id]"
                    :key="version.id"
                    type="info"
                    :title="version.note"
                    :time="formatDate(version.createdAt)"
                  >
                    <p class="version-preview">{{ version.content }}</p>
                    <n-space justify="end">
                      <n-button size="tiny" secondary @click="restoreDraftVersion(draft, version)">
                        恢复此版本
                      </n-button>
                    </n-space>
                  </n-timeline-item>
                </n-timeline>
              </n-card>
            </article>
          </div>
          <n-empty v-else description="没有符合筛选条件的草稿" />
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card class="panel insights-panel">
      <template #header>
        <div class="card-header">
          <span>内容复盘建议</span>
          <n-button size="small" secondary @click="loadInsights">刷新</n-button>
        </div>
      </template>
      <n-grid cols="1 760:4" :x-gap="12" :y-gap="12">
        <n-grid-item>
          <n-statistic label="待发布计划" :value="insights.pendingScheduleCount || 0" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="未回填记录" :value="insights.unmeasuredRecordCount || 0" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="高风险草稿" :value="insights.highRiskDraftCount || 0" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="平台样本" :value="insights.rankedPlatforms?.length || 0" />
        </n-grid-item>
      </n-grid>
      <ul class="insight-list">
        <li v-for="item in insights.suggestions" :key="item">{{ item }}</li>
      </ul>
    </n-card>

    <n-card class="panel accounts-panel">
      <template #header>
        <div class="card-header">
          <span>平台账号</span>
          <n-button size="small" secondary @click="loadPlatformAccounts">刷新</n-button>
        </div>
      </template>
      <n-grid cols="1 760:4" :x-gap="12" :y-gap="12">
        <n-grid-item>
          <n-select
            v-model:value="accountForm.platform"
            :options="platformOptions"
            placeholder="平台"
          />
        </n-grid-item>
        <n-grid-item>
          <n-input v-model:value="accountForm.displayName" placeholder="账号昵称，例如 体育观察号" />
        </n-grid-item>
        <n-grid-item>
          <n-input v-model:value="accountForm.profileUrl" placeholder="主页链接，可选" />
        </n-grid-item>
        <n-grid-item>
          <n-button type="primary" block secondary @click="createPlatformAccount">
            添加账号
          </n-button>
        </n-grid-item>
      </n-grid>
      <div v-if="platformAccounts.length" class="account-list">
        <n-tag
          v-for="account in platformAccounts"
          :key="account.id"
          round
          :type="account.platform === accountForm.platform ? 'success' : 'default'"
        >
          {{ platformLabel(account.platform) }} · {{ account.displayName }}
        </n-tag>
      </div>
      <n-alert v-else class="account-tip" type="info" :show-icon="false">
        本地只保存账号昵称、平台和主页链接，不保存密码、Cookie 或平台 token。
      </n-alert>
    </n-card>

    <n-card class="panel schedules-panel">
      <template #header>
        <div class="card-header">
          <span>发布计划队列</span>
          <n-button size="small" secondary @click="loadPublishSchedules">刷新</n-button>
        </div>
      </template>
      <n-timeline v-if="publishSchedules.length">
        <n-timeline-item
          v-for="schedule in publishSchedules"
          :key="schedule.id"
          :type="scheduleType(schedule.status)"
          :title="`${platformLabel(schedule.platform)} · ${schedule.accountName || '未指定账号'} · ${scheduleLabel(schedule.status)}`"
          :time="formatDate(schedule.scheduledAt)"
        >
          <div class="schedule-content">
            <p>{{ schedule.note || "等待执行发布计划" }}</p>
            <n-space class="record-actions" justify="end">
              <n-button size="small" secondary @click="updateScheduleStatus(schedule, 'ready')">
                标记待发布
              </n-button>
              <n-button size="small" type="success" secondary @click="updateScheduleStatus(schedule, 'published')">
                已发布
              </n-button>
              <n-button size="small" type="warning" secondary @click="updateScheduleStatus(schedule, 'skipped')">
                跳过
              </n-button>
            </n-space>
          </div>
        </n-timeline-item>
      </n-timeline>
      <n-empty v-else description="还没有发布计划" />
    </n-card>

    <n-card class="panel records-panel">
      <template #header>
        <div class="card-header">
          <span>半自动发布记录</span>
          <n-button size="small" secondary @click="loadPublishRecords">刷新</n-button>
        </div>
      </template>
      <n-timeline v-if="publishRecords.length">
        <n-timeline-item
          v-for="record in publishRecords"
          :key="record.id"
          :type="record.status === 'failed' ? 'error' : 'success'"
          :title="`${platformLabel(record.platform)} · ${record.accountName || '未指定账号'} · ${record.status}`"
          :time="formatDate(record.createdAt)"
        >
          <div class="record-content">
            <p>{{ record.note || record.publishUrl || "已记录半自动发布动作" }}</p>
            <n-grid cols="2 640:5" :x-gap="8" :y-gap="8">
              <n-grid-item>
                <n-input-number v-model:value="metricForms[record.id].views" size="small" placeholder="曝光" />
              </n-grid-item>
              <n-grid-item>
                <n-input-number v-model:value="metricForms[record.id].likes" size="small" placeholder="点赞" />
              </n-grid-item>
              <n-grid-item>
                <n-input-number v-model:value="metricForms[record.id].comments" size="small" placeholder="评论" />
              </n-grid-item>
              <n-grid-item>
                <n-input-number v-model:value="metricForms[record.id].shares" size="small" placeholder="转发" />
              </n-grid-item>
              <n-grid-item>
                <n-input-number v-model:value="metricForms[record.id].leads" size="small" placeholder="线索" />
              </n-grid-item>
            </n-grid>
            <n-space class="record-actions" justify="end">
              <n-button size="small" secondary @click="saveMetrics(record)">
                保存指标
              </n-button>
            </n-space>
          </div>
        </n-timeline-item>
      </n-timeline>
      <n-empty v-else description="还没有发布记录" />
    </n-card>

    <n-card class="panel audit-panel">
      <template #header>
        <div class="card-header">
          <span>合规审计日志</span>
          <n-button size="small" secondary @click="loadAuditLogs">刷新</n-button>
        </div>
      </template>
      <n-timeline v-if="auditLogs.length">
        <n-timeline-item
          v-for="log in auditLogs"
          :key="log.id"
          type="info"
          :title="log.action"
          :content="`${log.targetType}: ${log.targetId}`"
          :time="formatDate(log.createdAt)"
        />
      </n-timeline>
      <n-empty v-else description="还没有审计记录" />
    </n-card>
  </div>
</template>

<script setup>
import {
  archiveWorkspaceDraft,
  checkWorkspaceDraft,
  createWorkspacePlatformAccount,
  createWorkspacePublishRecord,
  createWorkspacePublishSchedule,
  generateWorkspaceDraft,
  getWorkspaceAuditLogs,
  getWorkspaceMe,
  getWorkspaceOverview,
  getWorkspacePersona,
  getWorkspacePlatformAccounts,
  getWorkspacePublishPackage,
  getWorkspacePublishRecords,
  getWorkspacePublishSchedules,
  getWorkspaceDrafts,
  getWorkspaceDraftVersions,
  getWorkspaceFeed,
  getWorkspaceInsights,
  getWorkspacePreferences,
  loginWorkspace,
  restoreWorkspaceDraftVersion,
  saveWorkspacePersona,
  saveWorkspaceDraftContent,
  saveWorkspacePreferences,
  updateWorkspaceDraftReview,
  updateWorkspacePublishMetrics,
  updateWorkspacePublishSchedule,
} from "@/api";

const categoryOptions = ["体育", "娱乐", "科技", "财经", "政治", "军事", "游戏", "社会"];
const sourceOptions = [
  { label: "微博", name: "weibo" },
  { label: "知乎", name: "zhihu" },
  { label: "哔哩哔哩", name: "bilibili" },
  { label: "抖音", name: "douyin" },
  { label: "今日头条", name: "toutiao" },
  { label: "IT之家", name: "ithome" },
  { label: "百度", name: "baidu" },
  { label: "腾讯新闻", name: "qq-news" },
  { label: "新浪新闻", name: "sina-news" },
  { label: "澎湃新闻", name: "thepaper" },
];
const platformOptions = [
  { label: "微博短评", value: "weibo" },
  { label: "小红书笔记", value: "xiaohongshu" },
  { label: "视频口播", value: "video" },
];
const draftPlatformFilterOptions = [
  { label: "全部平台", value: "all" },
  ...platformOptions,
];
const draftReviewFilterOptions = [
  { label: "全部审核状态", value: "all" },
  { label: "草稿", value: "draft" },
  { label: "审核中", value: "reviewing" },
  { label: "已通过", value: "approved" },
  { label: "已驳回", value: "rejected" },
];
const draftRiskFilterOptions = [
  { label: "全部风险", value: "all" },
  { label: "低风险", value: "low" },
  { label: "需核实", value: "medium" },
  { label: "高风险", value: "high" },
];

const preferences = ref({
  keywords: [],
  categories: [],
  excludeWords: [],
  sources: [],
  tone: "balanced",
});
const currentUser = ref({
  id: "",
  email: "",
  name: "",
});
const loginForm = ref({
  email: "",
  name: "",
});
const persona = ref({
  displayName: "",
  identity: "",
  voice: "balanced",
  viewpoints: [],
  forbiddenWords: [],
  boundaries: [],
});
const draftOptions = ref({
  platform: "weibo",
  tone: "balanced",
});
const draftFilters = ref({
  platform: "all",
  reviewStatus: "all",
  riskLevel: "all",
});
const accountForm = ref({
  platform: "weibo",
  displayName: "",
  profileUrl: "",
  note: "",
});
const feed = ref([]);
const drafts = ref([]);
const publishRecords = ref([]);
const publishSchedules = ref([]);
const platformAccounts = ref([]);
const auditLogs = ref([]);
const overview = ref({
  draftCount: 0,
  publishCount: 0,
  scheduleCount: 0,
  pendingScheduleCount: 0,
  totals: {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    leads: 0,
  },
  generation: {
    aiCount: 0,
    templateCount: 0,
    averageLatencyMs: 0,
    totalTokens: 0,
  },
});
const insights = ref({
  rankedPlatforms: [],
  bestRecord: null,
  pendingScheduleCount: 0,
  unmeasuredRecordCount: 0,
  highRiskDraftCount: 0,
  suggestions: [],
});
const metricForms = ref({});
const checkResults = ref({});
const publishPackages = ref({});
const draftVersions = ref({});
const selectedTopic = ref(null);
const loginLoading = ref(false);
const saving = ref(false);
const personaSaving = ref(false);
const feedLoading = ref(false);
const generating = ref(false);
const feedError = ref("");
const filteredDrafts = computed(() => {
  return drafts.value.filter((draft) => {
    const platformMatched = draftFilters.value.platform === "all" || draft.platform === draftFilters.value.platform;
    const reviewMatched =
      draftFilters.value.reviewStatus === "all" || (draft.reviewStatus || "draft") === draftFilters.value.reviewStatus;
    const riskMatched = draftFilters.value.riskLevel === "all" || draft.topic?.riskLevel === draftFilters.value.riskLevel;
    return platformMatched && reviewMatched && riskMatched;
  });
});

const loadPreferences = async () => {
  const res = await getWorkspacePreferences();
  if (res.code === 200) {
    preferences.value = res.data;
    draftOptions.value.tone = res.data.tone;
  }
};

const loadMe = async () => {
  const res = await getWorkspaceMe();
  if (res.code === 200) {
    currentUser.value = res.data;
    loginForm.value.email = res.data.email || loginForm.value.email;
    loginForm.value.name = res.data.name || loginForm.value.name;
  }
};

const reloadWorkspace = async () => {
  await Promise.all([loadMe(), loadPreferences(), loadPersona()]);
  await Promise.all([
    loadFeed(false),
    loadDrafts(),
    loadPlatformAccounts(),
    loadPublishRecords(),
    loadPublishSchedules(),
    loadOverview(),
    loadInsights(),
    loadAuditLogs(),
  ]);
};

const login = async () => {
  if (!loginForm.value.email) return $message.warning("请输入邮箱");
  loginLoading.value = true;
  try {
    const res = await loginWorkspace(loginForm.value);
    if (res.code === 200) {
      localStorage.setItem("workspaceUserId", res.data.id);
      currentUser.value = res.data;
      $message.success(`已登录：${res.data.name}`);
      await reloadWorkspace();
    }
  } finally {
    loginLoading.value = false;
  }
};

const useDefaultUser = async () => {
  localStorage.removeItem("workspaceUserId");
  loginForm.value = { email: "", name: "" };
  $message.info("已切换到默认本地用户");
  await reloadWorkspace();
};

const loadPersona = async () => {
  const res = await getWorkspacePersona();
  if (res.code === 200) persona.value = res.data;
};

const savePersona = async () => {
  personaSaving.value = true;
  try {
    const res = await saveWorkspacePersona(persona.value);
    if (res.code === 200) {
      persona.value = res.data;
      $message.success("人设已保存");
    }
  } finally {
    personaSaving.value = false;
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

const loadPublishRecords = async () => {
  const res = await getWorkspacePublishRecords();
  if (res.code === 200) {
    publishRecords.value = res.data;
    metricForms.value = res.data.reduce((acc, record) => {
      acc[record.id] = {
        views: record.metrics?.views || 0,
        likes: record.metrics?.likes || 0,
        comments: record.metrics?.comments || 0,
        shares: record.metrics?.shares || 0,
        leads: record.metrics?.leads || 0,
      };
      return acc;
    }, {});
  }
};

const loadPlatformAccounts = async () => {
  const res = await getWorkspacePlatformAccounts();
  if (res.code === 200) platformAccounts.value = res.data;
};

const createPlatformAccount = async () => {
  if (!accountForm.value.platform || !accountForm.value.displayName) {
    return $message.warning("请选择平台并填写账号昵称");
  }
  const res = await createWorkspacePlatformAccount(accountForm.value);
  if (res.code === 200) {
    platformAccounts.value = [...platformAccounts.value, res.data];
    accountForm.value.displayName = "";
    accountForm.value.profileUrl = "";
    accountForm.value.note = "";
    $message.success("平台账号已添加");
    await loadAuditLogs();
  }
};

const loadPublishSchedules = async () => {
  const res = await getWorkspacePublishSchedules();
  if (res.code === 200) publishSchedules.value = res.data;
};

const loadOverview = async () => {
  const res = await getWorkspaceOverview();
  if (res.code === 200) overview.value = res.data;
};

const loadInsights = async () => {
  const res = await getWorkspaceInsights();
  if (res.code === 200) insights.value = res.data;
};

const loadAuditLogs = async () => {
  const res = await getWorkspaceAuditLogs();
  if (res.code === 200) auditLogs.value = res.data;
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
      $message.success(`草稿已生成：${generationLabel(res.data.generationMode)}`);
      drafts.value = [res.data, ...drafts.value];
      await Promise.all([loadOverview(), loadAuditLogs()]);
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

const checkDraft = async (draft) => {
  const res = await checkWorkspaceDraft(draft.id, { content: draft.content });
  if (res.code === 200) {
    checkResults.value = {
      ...checkResults.value,
      [draft.id]: res.data,
    };
    $message[res.data.passed ? "success" : "warning"](
      res.data.passed ? "发布检查通过" : "发布前仍有风险项"
    );
    await loadAuditLogs();
  }
};

const saveDraftContent = async (draft) => {
  const res = await saveWorkspaceDraftContent(draft.id, {
    content: draft.content,
    note: "手动保存草稿",
  });
  if (res.code === 200) {
    Object.assign(draft, res.data.draft);
    draftVersions.value = {
      ...draftVersions.value,
      [draft.id]: [res.data.version, ...(draftVersions.value[draft.id] || [])],
    };
    $message.success("草稿版本已保存");
    await loadAuditLogs();
  }
};

const loadDraftVersions = async (draft) => {
  const res = await getWorkspaceDraftVersions(draft.id);
  if (res.code === 200) {
    draftVersions.value = {
      ...draftVersions.value,
      [draft.id]: res.data,
    };
    $message.success("版本历史已加载");
  }
};

const restoreDraftVersion = async (draft, version) => {
  const res = await restoreWorkspaceDraftVersion(draft.id, version.id);
  if (res.code === 200) {
    Object.assign(draft, res.data.draft);
    draftVersions.value = {
      ...draftVersions.value,
      [draft.id]: [res.data.version, ...(draftVersions.value[draft.id] || [])],
    };
    $message.success("已恢复历史版本");
    await loadAuditLogs();
  }
};

const archiveDraft = async (draft) => {
  const res = await archiveWorkspaceDraft(draft.id);
  if (res.code === 200) {
    drafts.value = drafts.value.filter((item) => item.id !== draft.id);
    $message.success("草稿已归档");
    await Promise.all([loadOverview(), loadInsights(), loadAuditLogs()]);
  }
};

const loadPublishPackage = async (draft) => {
  const res = await getWorkspacePublishPackage(draft.id);
  if (res.code === 200) {
    publishPackages.value = {
      ...publishPackages.value,
      [draft.id]: res.data,
    };
    $message.success("发布包已生成");
    await loadAuditLogs();
  }
};

const sharePackage = async (publishPackage) => {
  if (navigator.share) {
    await navigator.share({
      title: publishPackage.title,
      text: publishPackage.mobileShareText || publishPackage.copyText,
    });
  } else {
    await copyDraft(publishPackage.copyText);
    $message.info("当前浏览器不支持系统分享，已复制发布包");
  }
};

const downloadPackage = (publishPackage) => {
  const file = publishPackage.files?.[0];
  if (!file) return $message.warning("没有可下载文件");
  const blob = new Blob([file.content], { type: file.mimeType || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.filename || `${publishPackage.draftId}.txt`;
  link.click();
  URL.revokeObjectURL(url);
};

const openPublishTarget = (publishPackage) => {
  const target = publishPackage.deeplinks?.[0];
  if (!target?.url) return $message.warning("该平台暂未配置跳转入口");
  const url = window.innerWidth <= 680 && target.mobileUrl ? target.mobileUrl : target.url;
  window.open(url, "_blank");
};

const recordPublish = async (draft) => {
  const account = defaultAccountForPlatform(draft.platform);
  const res = await createWorkspacePublishRecord({
    draftId: draft.id,
    platform: draft.platform,
    accountId: account?.id,
    status: "assisted",
    note: "已复制或分享到目标平台，等待用户手动确认发布。",
  });
  if (res.code === 200) {
    appendPublishRecord(res.data);
    $message.success("发布动作已记录");
    await Promise.all([loadOverview(), loadAuditLogs()]);
  }
};

const appendPublishRecord = (record) => {
  if (!record || publishRecords.value.some((item) => item.id === record.id)) return;
  publishRecords.value = [record, ...publishRecords.value];
  metricForms.value = {
    ...metricForms.value,
    [record.id]: {
      views: record.metrics?.views || 0,
      likes: record.metrics?.likes || 0,
      comments: record.metrics?.comments || 0,
      shares: record.metrics?.shares || 0,
      leads: record.metrics?.leads || 0,
    },
  };
};

const schedulePublish = async (draft) => {
  const account = defaultAccountForPlatform(draft.platform);
  const scheduledAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const res = await createWorkspacePublishSchedule({
    draftId: draft.id,
    platform: draft.platform,
    accountId: account?.id,
    scheduledAt,
    note: "已加入发布计划，建议到点前再次检查内容和来源。",
  });
  if (res.code === 200) {
    publishSchedules.value = [...publishSchedules.value, res.data].sort((a, b) =>
      a.scheduledAt.localeCompare(b.scheduledAt)
    );
    $message.success("已加入发布计划");
    await Promise.all([loadOverview(), loadAuditLogs()]);
  }
};

const updateScheduleStatus = async (schedule, status) => {
  const res = await updateWorkspacePublishSchedule(schedule.id, { status });
  if (res.code === 200) {
    const nextSchedule = res.data.schedule || res.data;
    Object.assign(schedule, nextSchedule);
    appendPublishRecord(res.data.publishRecord);
    $message.success(`计划已更新：${scheduleLabel(status)}`);
    await Promise.all([loadOverview(), loadAuditLogs()]);
  }
};

const updateReview = async (draft, reviewStatus) => {
  const res = await updateWorkspaceDraftReview(draft.id, { reviewStatus });
  if (res.code === 200) {
    Object.assign(draft, res.data);
    $message.success(`已更新为：${reviewLabel(reviewStatus)}`);
    await Promise.all([loadOverview(), loadAuditLogs()]);
  }
};

const saveMetrics = async (record) => {
  const res = await updateWorkspacePublishMetrics(record.id, {
    ...metricForms.value[record.id],
    status: "published",
  });
  if (res.code === 200) {
    Object.assign(record, res.data);
    $message.success("发布指标已保存");
    await Promise.all([loadOverview(), loadAuditLogs()]);
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

const isPublishBlocked = (draft) => {
  return draft.topic?.riskLevel === "high" && draft.reviewStatus !== "approved";
};

const platformLabel = (platform) => {
  return {
    weibo: "微博短评",
    xiaohongshu: "小红书笔记",
    video: "视频口播",
  }[platform] || platform;
};

const defaultAccountForPlatform = (platform) => {
  return platformAccounts.value.find((account) => account.platform === platform);
};

const reviewLabel = (status = "draft") => {
  return {
    draft: "草稿",
    reviewing: "审核中",
    approved: "已通过",
    rejected: "已驳回",
  }[status] || "草稿";
};

const reviewType = (status = "draft") => {
  return {
    draft: "default",
    reviewing: "warning",
    approved: "success",
    rejected: "error",
  }[status] || "default";
};

const generationLabel = (mode = "template") => {
  return {
    ai: "AI 生成",
    template: "模板生成",
  }[mode] || "模板生成";
};

const generationType = (mode = "template") => {
  return {
    ai: "success",
    template: "default",
  }[mode] || "default";
};

const scheduleLabel = (status = "pending") => {
  return {
    pending: "待排期",
    ready: "待发布",
    published: "已发布",
    skipped: "已跳过",
    failed: "失败",
  }[status] || "待排期";
};

const scheduleType = (status = "pending") => {
  return {
    pending: "info",
    ready: "warning",
    published: "success",
    skipped: "default",
    failed: "error",
  }[status] || "info";
};

const formatDate = (date) => new Date(date).toLocaleString();

onMounted(async () => {
  await reloadWorkspace();
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

  .overview-grid {
    margin-bottom: 20px;
  }

  .metric-card {
    border-radius: 16px;
  }

  .persona-panel,
  .account-panel,
  .insights-panel,
  .accounts-panel,
  .schedules-panel,
  .records-panel,
  .audit-panel {
    margin-top: 20px;
  }

  .account-panel {
    margin-bottom: 20px;

    .account-tip {
      margin-top: 12px;
    }
  }

  .accounts-panel {
    .account-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }
  }

  .insights-panel {
    .insight-list {
      margin: 14px 0 0;
      padding-left: 18px;
      color: var(--n-text-color-2);
      line-height: 1.8;
    }
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

  .draft-filters {
    margin-bottom: 12px;
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

  .topic-detail {
    margin-top: 12px;
    padding: 14px;
    border: 1px solid var(--n-border-color);
    border-radius: 14px;

    p {
      margin: 10px 0;
      color: var(--n-text-color-2);
      line-height: 1.7;
    }

    .source-links {
      margin-top: 8px;
    }
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
    .draft-actions,
    .review-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .review-row {
      justify-content: space-between;
      margin: 10px 0;
      flex-wrap: wrap;
    }

    .draft-actions {
      margin-top: 12px;
    }

    .check-result {
      margin-top: 12px;

      .check-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 6px;
        font-weight: 700;
      }

      ul {
        margin: 0;
        padding-left: 18px;
      }
    }

    .publish-package {
      margin-top: 12px;

      .tag-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .package-checklist {
        margin: 0;
        padding-left: 18px;
        color: var(--n-text-color-2);
        line-height: 1.7;
      }
    }

    .draft-versions {
      margin-top: 12px;

      .version-preview {
        display: -webkit-box;
        margin: 0 0 8px;
        overflow: hidden;
        color: var(--n-text-color-2);
        line-height: 1.7;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
      }
    }
  }

  .schedule-content,
  .record-content {
    p {
      margin: 0 0 10px;
    }

    .record-actions {
      margin-top: 10px;
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

    .draft {
      .draft-meta,
      .draft-actions {
        flex-wrap: wrap;
        justify-content: flex-start;
      }
    }
  }
}
</style>
