<template>
  <div class="workspace-page">
    <n-grid cols="1 980:2" :x-gap="20" :y-gap="20">
      <n-grid-item>
        <n-card title="登录与商家初始化" class="panel">
          <n-space vertical size="large">
            <n-alert type="info" :show-icon="false">
              当前阶段是轻量 Web/PWA MVP。先创建一个本地商家工作账号，再填写门店基础信息。
            </n-alert>
            <n-form label-placement="top">
              <n-form-item label="邮箱">
                <n-input v-model:value="loginForm.email" placeholder="merchant@example.com" />
              </n-form-item>
              <n-form-item label="联系人">
                <n-input v-model:value="loginForm.name" placeholder="例如：徐店长" />
              </n-form-item>
              <n-space>
                <n-button type="primary" strong :loading="loginLoading" @click="login">
                  登录 / 创建工作账号
                </n-button>
                <n-button secondary strong @click="useDefaultUser">
                  使用默认本地账号
                </n-button>
              </n-space>
            </n-form>
            <n-descriptions bordered :column="1" label-placement="left" size="small">
              <n-descriptions-item label="当前用户 ID">
                {{ workspace.currentUser?.id || "未创建" }}
              </n-descriptions-item>
              <n-descriptions-item label="当前用户名称">
                {{ workspace.currentUser?.name || "未创建" }}
              </n-descriptions-item>
            </n-descriptions>
          </n-space>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="MVP 交付边界" class="panel">
          <ul class="todo-list">
            <li>当前只服务商家 / 品牌 / 代运营团队，不做个人创作者主叙事。</li>
            <li>当前只做 1-2 个首发行业，优先验证“内容是否能带来咨询或预约”。</li>
            <li>当前只做 Web/PWA，可在手机浏览器完成配置、看热点、生成草稿、复制导出。</li>
            <li>当前不承诺全平台全自动发布，先做发布前检查和半自动分发辅助。</li>
          </ul>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card title="商家配置" class="panel">
      <n-form label-placement="top">
        <n-grid cols="1 720:2 1100:4" :x-gap="16" :y-gap="8">
          <n-grid-item>
            <n-form-item label="品牌 / 门店名称">
              <n-input v-model:value="profile.brandName" placeholder="例如：徐记烧烤 徐汇店" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="首发行业">
              <n-select
                v-model:value="profile.industry"
                :options="industryOptions"
                @update:value="handleIndustryChange"
              />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="所在城市">
              <n-select v-model:value="profile.city" :options="cityOptions" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="当前目标">
              <n-input v-model:value="profile.target" placeholder="例如：提升到店转化" />
            </n-form-item>
          </n-grid-item>
        </n-grid>

        <n-form-item label="首发平台">
          <n-checkbox-group v-model:value="profile.platforms">
            <n-space>
              <n-checkbox
                v-for="item in platformOptions"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </n-space>
          </n-checkbox-group>
        </n-form-item>

        <n-form-item label="业务关键词">
          <n-dynamic-tags v-model:value="profile.keywords" />
        </n-form-item>

        <n-grid cols="1 900:2" :x-gap="16" :y-gap="16">
          <n-grid-item>
            <n-card embedded title="将同步到热点筛选的条件">
              <n-form-item label="热点分类">
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
              <n-form-item label="默认语气">
                <n-radio-group v-model:value="preferences.tone">
                  <n-space>
                    <n-radio-button
                      v-for="item in toneOptions"
                      :key="item.value"
                      :value="item.value"
                    >
                      {{ item.label }}
                    </n-radio-button>
                  </n-space>
                </n-radio-group>
              </n-form-item>
            </n-card>
          </n-grid-item>

          <n-grid-item>
            <n-card embedded title="首发建议">
              <ul class="todo-list compact">
                <li>先只做 {{ profile.industry }} 行业，避免“什么都能做”的泛化叙事。</li>
                <li>关键词里要放活动词、转化词、同城词，不要只放泛热点词。</li>
                <li>默认至少保留 2 个平台，便于后续半自动分发对比。</li>
                <li>排除掉不适合商家跟进的高风险公共议题。</li>
              </ul>
            </n-card>
          </n-grid-item>
        </n-grid>

        <n-space justify="end" class="actions">
          <n-button secondary strong @click="resetProfile">恢复行业预设</n-button>
          <n-button type="primary" strong :loading="saving" @click="saveSetup">
            保存商家配置
          </n-button>
          <n-button type="success" strong @click="goTopics">进入行业热点流</n-button>
        </n-space>
      </n-form>
    </n-card>
  </div>
</template>

<script setup>
import { workspaceStore } from "@/store";
import {
  categoryOptions,
  cityOptions,
  defaultMerchantProfile,
  defaultWorkspacePreferences,
  industryOptions,
  keywordPresets,
  platformOptions,
  toneOptions,
} from "@/utils/workspace";
import { useRouter } from "vue-router";

const router = useRouter();
const workspace = workspaceStore();

const loginLoading = ref(false);
const saving = ref(false);

const loginForm = ref({
  email: "",
  name: "",
});

const profile = ref(workspace.normalizeProfile(workspace.merchantProfile));
const preferences = ref(workspace.mergePreferences(profile.value, workspace.preferences));

const syncFromStore = () => {
  profile.value = workspace.normalizeProfile(workspace.merchantProfile);
  preferences.value = workspace.mergePreferences(profile.value, workspace.preferences);
};

const handleIndustryChange = (industry) => {
  const presetKeywords = keywordPresets[industry] || [];
  profile.value.keywords = [...presetKeywords];
  preferences.value = workspace.mergePreferences(profile.value, {
    ...preferences.value,
    keywords: presetKeywords,
    categories: [industry, profile.value.city].filter(Boolean),
  });
};

const ensureUser = async () => {
  if (workspace.currentUser?.id) return true;
  workspace.useDefaultUser();
  return true;
};

const login = async () => {
  loginLoading.value = true;
  try {
    const res = await workspace.login(loginForm.value);
    if (res?.code === 200) {
      $message.success("工作账号已创建");
      await workspace.bootstrap(true);
      syncFromStore();
    }
  } finally {
    loginLoading.value = false;
  }
};

const useDefaultUser = () => {
  workspace.useDefaultUser();
  $message.success("已切换为默认本地账号");
  syncFromStore();
};

const saveSetup = async () => {
  saving.value = true;
  try {
    await ensureUser();
    const profileRes = await workspace.syncMerchantProfile(profile.value);
    if (profileRes?.code === 200) {
      workspace.updateMerchantProfile(profileRes.data);
    }
    const res = await workspace.syncPreferences({
      ...preferences.value,
      keywords: workspace.merchantProfile.keywords,
      categories: [...new Set([workspace.merchantProfile.industry, workspace.merchantProfile.city, ...preferences.value.categories])]
        .filter(Boolean)
        .slice(0, 6),
    });
    if (res?.code === 200) {
      $message.success("商家配置已保存");
      syncFromStore();
    }
  } finally {
    saving.value = false;
  }
};

const resetProfile = () => {
  const defaults = defaultMerchantProfile();
  defaults.industry = profile.value.industry;
  defaults.city = profile.value.city;
  defaults.target = profile.value.target;
  profile.value = workspace.normalizeProfile(defaults);
  preferences.value = workspace.mergePreferences(
    profile.value,
    defaultWorkspacePreferences(profile.value),
  );
  $message.success("已恢复为当前行业预设");
};

const goTopics = async () => {
  await saveSetup();
  router.push("/workspace/topics");
};

watch(
  () => workspace.merchantProfile,
  () => {
    syncFromStore();
  },
  { deep: true },
);

onMounted(() => {
  if (!workspace.initialized) {
    workspace.bootstrap().then(syncFromStore);
  } else {
    syncFromStore();
  }
});
</script>

<style lang="scss" scoped>
.workspace-page {
  display: grid;
  gap: 20px;
}

.panel {
  border-radius: 18px;
}

.actions {
  margin-top: 12px;
}

.todo-list {
  margin: 0;
  padding-left: 18px;
  color: var(--n-text-color-2);
  line-height: 1.9;

  &.compact {
    line-height: 1.8;
  }
}
</style>
