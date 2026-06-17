<template>
  <div class="merchant-onboarding">
    <section class="header-block">
      <div>
        <n-tag round type="warning">Step 2 / 商家入驻</n-tag>
        <h1>先定义商家场景，再去筛热点</h1>
        <p>
          当前步骤只收集 MVP 必需信息：商家名称、行业、城市、团队规模和首批重点平台。完成后会进入配置页补齐关键词与账号信息。
        </p>
      </div>
      <n-button tertiary @click="router.push('/merchant/login')">切换账号</n-button>
    </section>

    <n-grid cols="1 900:3" :x-gap="20" :y-gap="20">
      <n-grid-item :span="2">
        <n-card class="form-card" title="入驻信息">
          <n-form label-placement="top">
            <n-grid cols="1 700:2" :x-gap="16">
              <n-grid-item>
                <n-form-item label="商家 / 门店名称">
                  <n-input v-model:value="form.merchantName" placeholder="例如：星火烧肉·杭州城西店" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="品牌名称">
                  <n-input v-model:value="form.brandName" placeholder="例如：星火烧肉" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="重点行业">
                  <n-select v-model:value="form.industry" :options="industryOptions" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="所在城市">
                  <n-select
                    v-model:value="form.city"
                    filterable
                    tag
                    :options="cityOptions"
                    placeholder="选择或输入城市"
                  />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="业务形态">
                  <n-input v-model:value="form.businessType" placeholder="例如：本地门店 / 连锁品牌 / 代运营团队" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="团队规模">
                  <n-select v-model:value="form.teamSize" :options="teamSizeOptions" />
                </n-form-item>
              </n-grid-item>
            </n-grid>
            <n-form-item label="当前最重要的获客目标">
              <n-input
                v-model:value="form.businessGoal"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 5 }"
                placeholder="例如：提升工作日午餐到店率，为暑期课程招募试听线索"
              />
            </n-form-item>
            <n-form-item label="联系人">
              <n-input v-model:value="form.contactName" placeholder="例如：李店长" />
            </n-form-item>
            <n-form-item label="联系电话">
              <n-input v-model:value="form.contactPhone" placeholder="例如：13800000000" />
            </n-form-item>
            <n-form-item label="首批重点平台">
              <n-checkbox-group v-model:value="form.preferredPlatforms">
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
          </n-form>
          <n-space justify="space-between" class="actions">
            <n-button secondary @click="fillDemo">填入示例</n-button>
            <n-button type="primary" strong @click="saveAndContinue">保存并进入配置</n-button>
          </n-space>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card class="side-card" title="入驻完成后">
          <ol>
            <li>系统按行业和城市推荐关键词配置。</li>
            <li>你可以勾选重点平台并绑定账号。</li>
            <li>配置完成后再进入热点工作台生成内容。</li>
          </ol>
        </n-card>
        <n-card class="side-card" title="MVP 建议">
          <n-space vertical>
            <n-tag round>优先聚焦 1 到 2 个行业</n-tag>
            <n-tag round>先做 Web/PWA 可用闭环</n-tag>
            <n-tag round>平台以抖音 / 小红书 / 视频号优先</n-tag>
          </n-space>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import {
  CITY_OPTIONS,
  INDUSTRY_OPTIONS,
  PLATFORM_OPTIONS,
  createEmptyMerchantProfile,
  readMerchantProfile,
  saveMerchantProfile,
} from "@/utils/merchantWorkspace";

const router = useRouter();
const userId = ref("");
const form = ref(createEmptyMerchantProfile());

const industryOptions = INDUSTRY_OPTIONS;
const cityOptions = CITY_OPTIONS;
const platformOptions = PLATFORM_OPTIONS;
const teamSizeOptions = [
  { label: "1-3 人", value: "1-3" },
  { label: "4-10 人", value: "4-10" },
  { label: "11-30 人", value: "11-30" },
  { label: "30 人以上", value: "30+" },
];

const loadProfile = () => {
  userId.value = localStorage.getItem("workspaceUserId") || "";
  if (!userId.value) {
    router.replace("/merchant/login");
    return;
  }
  form.value = readMerchantProfile(userId.value);
};

const fillDemo = () => {
  form.value = {
    ...form.value,
    merchantName: "星火烧肉·杭州城西店",
    brandName: "星火烧肉",
    industry: "food",
    city: "杭州",
    businessType: "本地门店",
    businessGoal: "围绕团购、上新和门店活动做持续内容获客，提升工作日到店转化。",
    teamSize: "4-10",
    preferredPlatforms: ["douyin", "xiaohongshu", "video"],
    contactName: "李店长",
    contactPhone: "13800000000",
  };
};

const saveAndContinue = () => {
  if (!form.value.merchantName || !form.value.industry || !form.value.city) {
    $message.warning("请至少填写商家名称、行业和城市");
    return;
  }
  if (!form.value.preferredPlatforms.length) {
    $message.warning("请至少选择一个重点平台");
    return;
  }

  saveMerchantProfile(userId.value, {
    ...form.value,
    completedAt: form.value.completedAt || new Date().toISOString(),
  });
  $message.success("商家入驻信息已保存");
  router.push("/merchant/config");
};

onMounted(() => {
  loadProfile();
});
</script>

<style lang="scss" scoped>
.merchant-onboarding {
  display: grid;
  gap: 20px;
  padding-bottom: 32px;

  .header-block {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: flex-start;
    padding: 24px 28px;
    border-radius: 24px;
    background:
      radial-gradient(circle at right top, rgba(249, 115, 22, 0.18), transparent 28%),
      linear-gradient(135deg, rgba(255, 247, 237, 0.95), rgba(255, 255, 255, 0.96));
    border: 1px solid rgba(251, 146, 60, 0.18);

    h1 {
      margin: 14px 0 10px;
      font-size: clamp(28px, 4vw, 48px);
      letter-spacing: -0.05em;
    }

    p {
      max-width: 760px;
      color: var(--n-text-color-2);
      line-height: 1.8;
    }
  }

  .form-card,
  .side-card {
    border-radius: 20px;
  }

  .side-card + .side-card {
    margin-top: 20px;
  }

  .actions {
    margin-top: 10px;
  }

  ol {
    padding-left: 18px;
    line-height: 1.9;
    color: var(--n-text-color-2);
  }

  @media (max-width: 760px) {
    .header-block {
      flex-direction: column;
      padding: 20px;
    }
  }
}
</style>
