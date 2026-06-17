<template>
  <div class="merchant-config">
    <section class="hero">
      <div>
        <n-tag round type="info">Step 3 / 商家配置</n-tag>
        <h1>配置行业、城市、平台与关键词</h1>
        <p>
          这一页对应 ToB MVP 的基础配置层。行业和城市会保存在前端商家档案中，关键词、来源和语气会写入现有 workspace preferences，平台账号会接入已有本地 API。
        </p>
      </div>
      <n-space vertical align="end">
        <n-button tertiary @click="router.push('/merchant/onboarding')">返回入驻信息</n-button>
        <n-button type="primary" strong :loading="saving" @click="saveAll">
          保存全部配置
        </n-button>
      </n-space>
    </section>

    <n-grid cols="1 1080:3" :x-gap="20" :y-gap="20">
      <n-grid-item :span="2">
        <n-card class="panel" title="商家基础配置">
          <n-form label-placement="top">
            <n-grid cols="1 760:2" :x-gap="16">
              <n-grid-item>
                <n-form-item label="商家名称">
                  <n-input v-model:value="profile.merchantName" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="品牌名称">
                  <n-input v-model:value="profile.brandName" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="行业">
                  <n-select v-model:value="profile.industry" :options="industryOptions" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="城市">
                  <n-select v-model:value="profile.city" filterable tag :options="cityOptions" />
                </n-form-item>
              </n-grid-item>
            </n-grid>

            <n-form-item label="重点平台">
              <n-checkbox-group v-model:value="profile.preferredPlatforms">
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

            <n-form-item label="关键词">
              <n-dynamic-tags v-model:value="preferences.keywords" />
            </n-form-item>

            <n-grid cols="1 760:2" :x-gap="16">
              <n-grid-item>
                <n-form-item label="行业分类">
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
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="热点来源">
                  <n-checkbox-group v-model:value="preferences.sources">
                    <n-space>
                      <n-checkbox
                        v-for="item in sourceOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                      />
                    </n-space>
                  </n-checkbox-group>
                </n-form-item>
              </n-grid-item>
            </n-grid>

            <n-form-item label="排除词">
              <n-dynamic-tags v-model:value="preferences.excludeWords" />
            </n-form-item>

            <n-form-item label="默认内容语气">
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
          </n-form>
        </n-card>

        <n-card class="panel account-panel" title="平台账号绑定">
          <n-grid cols="1 760:4" :x-gap="12" :y-gap="12">
            <n-grid-item>
              <n-select v-model:value="accountForm.platform" :options="platformOptions" />
            </n-grid-item>
            <n-grid-item>
              <n-input v-model:value="accountForm.displayName" placeholder="账号名称" />
            </n-grid-item>
            <n-grid-item>
              <n-input v-model:value="accountForm.profileUrl" placeholder="主页链接（可选）" />
            </n-grid-item>
            <n-grid-item>
              <n-button block type="primary" :loading="accountSaving" @click="saveAccount">
                {{ accountForm.id ? "更新账号" : "添加账号" }}
              </n-button>
            </n-grid-item>
          </n-grid>
          <n-input
            v-model:value="accountForm.note"
            class="account-note"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="备注：如负责人、当前运营状态、素材风格等"
          />

          <div v-if="platformAccounts.length" class="account-list">
            <article v-for="account in platformAccounts" :key="account.id" class="account-item">
              <div>
                <n-space align="center">
                  <n-tag round :type="account.status === 'active' ? 'success' : 'default'">
                    {{ platformLabel(account.platform) }}
                  </n-tag>
                  <strong>{{ account.displayName }}</strong>
                </n-space>
                <p v-if="account.profileUrl">{{ account.profileUrl }}</p>
                <p v-if="account.note">{{ account.note }}</p>
              </div>
              <n-space>
                <n-button size="small" secondary @click="editAccount(account)">编辑</n-button>
                <n-button
                  size="small"
                  secondary
                  @click="toggleAccountStatus(account)"
                >
                  {{ account.status === "active" ? "停用" : "启用" }}
                </n-button>
                <n-popconfirm @positive-click="removeAccount(account)">
                  <template #trigger>
                    <n-button size="small" tertiary type="error">删除</n-button>
                  </template>
                  确认删除该平台账号？
                </n-popconfirm>
              </n-space>
            </article>
          </div>
          <n-empty v-else description="还没有绑定平台账号" />
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card class="panel summary-panel" title="配置摘要">
          <n-space vertical>
            <n-text>当前账号：{{ currentUser.name || currentUser.id || "未登录" }}</n-text>
            <n-text>商家：{{ profile.merchantName || "未填写" }}</n-text>
            <n-text>行业：{{ getIndustryLabel(profile.industry) }}</n-text>
            <n-text>城市：{{ profile.city || "未填写" }}</n-text>
            <n-space>
              <n-tag v-for="item in profile.preferredPlatforms" :key="item" round>
                {{ platformLabel(item) }}
              </n-tag>
            </n-space>
          </n-space>
        </n-card>

        <n-card class="panel summary-panel" title="建议配置">
          <n-space vertical>
            <n-text :depth="3">基于当前行业的推荐分类和关键词：</n-text>
            <div class="suggestion-block">
              <strong>分类</strong>
              <n-space>
                <n-tag v-for="item in industrySuggestions.categories" :key="item" round type="info">
                  {{ item }}
                </n-tag>
              </n-space>
            </div>
            <div class="suggestion-block">
              <strong>关键词</strong>
              <n-space>
                <n-tag v-for="item in industrySuggestions.keywords" :key="item" round type="warning">
                  {{ item }}
                </n-tag>
              </n-space>
            </div>
            <n-button secondary @click="applySuggestions">一键应用建议</n-button>
          </n-space>
        </n-card>

        <n-card class="panel summary-panel" title="下一步">
          <ul>
            <li>保存完成后，可进入热点工作台继续看热点与生成草稿。</li>
            <li>行业 / 城市目前为前端本地持久化，后端尚无正式 merchant model。</li>
            <li>平台账号已经接到现有 workspace API，可用于后续发布流程。</li>
          </ul>
          <n-button class="workspace-entry" tertiary type="primary" @click="router.push('/workspace')">
            打开热点工作台
          </n-button>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import {
  createWorkspacePlatformAccount,
  deleteWorkspacePlatformAccount,
  getWorkspaceMe,
  getWorkspacePlatformAccounts,
  getWorkspacePreferences,
  saveWorkspacePreferences,
  updateWorkspacePlatformAccount,
} from "@/api";
import {
  CATEGORY_OPTIONS,
  CITY_OPTIONS,
  INDUSTRY_OPTIONS,
  PLATFORM_OPTIONS,
  SOURCE_OPTIONS,
  TONE_OPTIONS,
  createEmptyMerchantProfile,
  getIndustryLabel,
  getIndustrySuggestions,
  getPlatformLabel,
  isMerchantProfileComplete,
  readMerchantProfile,
  saveMerchantProfile,
} from "@/utils/merchantWorkspace";

const router = useRouter();

const currentUser = ref({});
const saving = ref(false);
const accountSaving = ref(false);
const profile = ref(createEmptyMerchantProfile());
const preferences = ref({
  keywords: [],
  categories: [],
  excludeWords: [],
  sources: [],
  tone: "balanced",
});
const platformAccounts = ref([]);
const accountForm = ref({
  id: "",
  platform: "douyin",
  displayName: "",
  profileUrl: "",
  note: "",
});

const industryOptions = INDUSTRY_OPTIONS;
const cityOptions = CITY_OPTIONS;
const platformOptions = PLATFORM_OPTIONS;
const categoryOptions = CATEGORY_OPTIONS;
const sourceOptions = SOURCE_OPTIONS;
const toneOptions = TONE_OPTIONS;

const userId = computed(() => localStorage.getItem("workspaceUserId") || "");
const industrySuggestions = computed(() => getIndustrySuggestions(profile.value.industry));
const platformLabel = getPlatformLabel;

const resetAccountForm = () => {
  accountForm.value = {
    id: "",
    platform: profile.value.preferredPlatforms[0] || "douyin",
    displayName: "",
    profileUrl: "",
    note: "",
  };
};

const ensureAccess = () => {
  if (!userId.value) {
    router.replace("/merchant/login");
    return false;
  }
  const nextProfile = readMerchantProfile(userId.value);
  if (!isMerchantProfileComplete(nextProfile)) {
    router.replace("/merchant/onboarding");
    return false;
  }
  profile.value = nextProfile;
  return true;
};

const applySuggestions = () => {
  const mergedKeywords = Array.from(
    new Set([...preferences.value.keywords, ...industrySuggestions.value.keywords, profile.value.city].filter(Boolean))
  );
  const mergedCategories = Array.from(
    new Set([...preferences.value.categories, ...industrySuggestions.value.categories].filter(Boolean))
  );
  preferences.value = {
    ...preferences.value,
    keywords: mergedKeywords,
    categories: mergedCategories,
  };
  $message.success("已应用行业建议");
};

const loadConfig = async () => {
  if (!ensureAccess()) return;

  const [meRes, prefRes, accountRes] = await Promise.all([
    getWorkspaceMe(),
    getWorkspacePreferences(),
    getWorkspacePlatformAccounts(),
  ]);

  if (meRes.code === 200) {
    currentUser.value = meRes.data;
  }

  if (prefRes.code === 200) {
    preferences.value = {
      keywords: prefRes.data.keywords || [],
      categories: prefRes.data.categories || [],
      excludeWords: prefRes.data.excludeWords || [],
      sources: prefRes.data.sources || [],
      tone: prefRes.data.tone || "balanced",
    };
  }

  if (accountRes.code === 200) {
    platformAccounts.value = accountRes.data;
  }

  if (!preferences.value.keywords.length && !preferences.value.categories.length) {
    applySuggestions();
  }

  resetAccountForm();
};

const saveAll = async () => {
  if (!profile.value.merchantName || !profile.value.industry || !profile.value.city) {
    $message.warning("请先补齐商家名称、行业和城市");
    return;
  }
  if (!profile.value.preferredPlatforms.length) {
    $message.warning("请至少选择一个重点平台");
    return;
  }

  saving.value = true;
  try {
    saveMerchantProfile(userId.value, profile.value);
    const res = await saveWorkspacePreferences(preferences.value);
    if (res.code === 200) {
      preferences.value = res.data;
      $message.success("商家配置已保存");
    }
  } finally {
    saving.value = false;
  }
};

const saveAccount = async () => {
  if (!accountForm.value.platform || !accountForm.value.displayName) {
    $message.warning("请填写平台和账号名称");
    return;
  }

  const isEditing = Boolean(accountForm.value.id);
  accountSaving.value = true;
  try {
    const payload = {
      platform: accountForm.value.platform,
      displayName: accountForm.value.displayName,
      profileUrl: accountForm.value.profileUrl,
      note: accountForm.value.note,
    };
    const res = accountForm.value.id
      ? await updateWorkspacePlatformAccount(accountForm.value.id, payload)
      : await createWorkspacePlatformAccount(payload);

    if (res.code === 200) {
      if (isEditing) {
        platformAccounts.value = platformAccounts.value.map((item) =>
          item.id === res.data.id ? res.data : item
        );
      } else {
        platformAccounts.value = [...platformAccounts.value, res.data].sort((a, b) =>
          a.platform.localeCompare(b.platform) || a.displayName.localeCompare(b.displayName)
        );
      }
      resetAccountForm();
      $message.success(isEditing ? "平台账号已更新" : "平台账号已添加");
    }
  } finally {
    accountSaving.value = false;
  }
};

const editAccount = (account) => {
  accountForm.value = {
    id: account.id,
    platform: account.platform,
    displayName: account.displayName,
    profileUrl: account.profileUrl || "",
    note: account.note || "",
  };
};

const toggleAccountStatus = async (account) => {
  const nextStatus = account.status === "active" ? "inactive" : "active";
  const res = await updateWorkspacePlatformAccount(account.id, { status: nextStatus });
  if (res.code === 200) {
    platformAccounts.value = platformAccounts.value.map((item) =>
      item.id === account.id ? res.data : item
    );
    $message.success(nextStatus === "active" ? "账号已启用" : "账号已停用");
  }
};

const removeAccount = async (account) => {
  const res = await deleteWorkspacePlatformAccount(account.id);
  if (res.code === 200) {
    platformAccounts.value = platformAccounts.value.filter((item) => item.id !== account.id);
    if (accountForm.value.id === account.id) {
      resetAccountForm();
    }
    $message.success("平台账号已删除");
  }
};

onMounted(() => {
  loadConfig();
});
</script>

<style lang="scss" scoped>
.merchant-config {
  display: grid;
  gap: 20px;
  padding-bottom: 32px;

  .hero {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: flex-start;
    padding: 28px;
    border-radius: 24px;
    background:
      radial-gradient(circle at 10% 10%, rgba(14, 165, 233, 0.18), transparent 26%),
      radial-gradient(circle at 90% 80%, rgba(34, 197, 94, 0.16), transparent 24%),
      linear-gradient(135deg, rgba(240, 249, 255, 0.96), rgba(255, 255, 255, 0.94));
    border: 1px solid rgba(56, 189, 248, 0.16);

    h1 {
      margin: 14px 0 10px;
      font-size: clamp(30px, 4vw, 50px);
      letter-spacing: -0.05em;
    }

    p {
      max-width: 820px;
      color: var(--n-text-color-2);
      line-height: 1.8;
    }
  }

  .panel {
    border-radius: 20px;
  }

  .account-panel {
    margin-top: 20px;
  }

  .account-note {
    margin: 12px 0 16px;
  }

  .account-list {
    display: grid;
    gap: 12px;
  }

  .account-item {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 14px;
    border: 1px solid rgba(148, 163, 184, 0.24);
    border-radius: 14px;
    background: rgba(248, 250, 252, 0.72);

    p {
      margin: 8px 0 0;
      color: var(--n-text-color-2);
      word-break: break-all;
    }
  }

  .summary-panel + .summary-panel {
    margin-top: 20px;
  }

  .suggestion-block {
    display: grid;
    gap: 10px;
  }

  ul {
    padding-left: 18px;
    color: var(--n-text-color-2);
    line-height: 1.8;
  }

  .workspace-entry {
    margin-top: 16px;
  }

  @media (max-width: 760px) {
    .hero,
    .account-item {
      flex-direction: column;
    }

    .hero {
      padding: 20px;
    }
  }
}
</style>
