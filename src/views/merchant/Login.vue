<template>
  <div class="merchant-login">
    <section class="hero">
      <div class="hero-copy">
        <n-tag round type="success">ToB Web/PWA MVP</n-tag>
        <h1>商家内容获客工作台</h1>
        <p>
          先完成登录、商家入驻和基础配置，再进入热点工作台。当前前端优先覆盖餐饮、美业、教培和本地生活服务四类 MVP 行业。
        </p>
        <div class="hero-points">
          <span>行业化配置</span>
          <span>城市化选题</span>
          <span>多平台内容分发</span>
        </div>
      </div>
      <n-card class="login-card" :bordered="false">
        <template #header>
          <div class="card-header">
            <span>账户登录</span>
            <n-text :depth="3">本地用户隔离</n-text>
          </div>
        </template>
        <n-form label-placement="top">
          <n-form-item label="邮箱">
            <n-input
              v-model:value="loginForm.email"
              placeholder="merchant@example.com"
              @keyup.enter="submitLogin"
            />
          </n-form-item>
          <n-form-item label="联系人 / 团队名称">
            <n-input
              v-model:value="loginForm.name"
              placeholder="例如：星火餐饮运营组"
              @keyup.enter="submitLogin"
            />
          </n-form-item>
        </n-form>
        <n-space vertical size="large">
          <n-button type="primary" strong block :loading="loginLoading" @click="submitLogin">
            登录并开始配置
          </n-button>
          <n-button block secondary @click="useDefaultUser">
            使用默认本地用户
          </n-button>
        </n-space>
        <n-alert class="login-tip" type="info" :show-icon="false">
          当前版本未接入正式企业认证，登录后使用本地持久化保存商家入驻信息与配置草稿。
        </n-alert>
      </n-card>
    </section>

    <section class="content-grid">
      <n-card class="feature-card" title="MVP 范围">
        <ul>
          <li>账户登录与商家身份初始化</li>
          <li>商家行业、城市、平台和关键词配置</li>
          <li>为后续热点筛选与草稿生成提供基础上下文</li>
        </ul>
      </n-card>
      <n-card class="feature-card" title="当前重点行业">
        <n-space>
          <n-tag v-for="item in industryOptions" :key="item.value" round>
            {{ item.label }}
          </n-tag>
        </n-space>
      </n-card>
      <n-card v-if="currentUser.id" class="feature-card" title="继续上次进度">
        <n-space vertical>
          <n-text>{{ currentUser.name || currentUser.email || currentUser.id }}</n-text>
          <n-text :depth="3">当前用户 ID：{{ currentUser.id }}</n-text>
          <n-button tertiary type="primary" @click="continueSetup">
            {{ nextStepLabel }}
          </n-button>
        </n-space>
      </n-card>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { getWorkspaceMe, loginWorkspace } from "@/api";
import {
  INDUSTRY_OPTIONS,
  isMerchantProfileComplete,
  readMerchantProfile,
} from "@/utils/merchantWorkspace";

const router = useRouter();

const loginLoading = ref(false);
const loginForm = ref({
  email: "",
  name: "",
});
const currentUser = ref({});
const industryOptions = INDUSTRY_OPTIONS;

const nextStepLabel = computed(() => {
  const profile = readMerchantProfile(currentUser.value.id);
  return isMerchantProfileComplete(profile) ? "继续查看配置" : "继续商家入驻";
});

const loadCurrentUser = async () => {
  const workspaceUserId = localStorage.getItem("workspaceUserId");
  if (!workspaceUserId) return;

  try {
    const res = await getWorkspaceMe();
    if (res.code === 200) {
      currentUser.value = res.data;
      loginForm.value.email = res.data.email || loginForm.value.email;
      loginForm.value.name = res.data.name || loginForm.value.name;
    }
  } catch (error) {
    console.warn("Failed to load workspace user", error);
  }
};

const routeByProfile = (userId) => {
  const profile = readMerchantProfile(userId);
  router.push(isMerchantProfileComplete(profile) ? "/merchant/config" : "/merchant/onboarding");
};

const submitLogin = async () => {
  if (!loginForm.value.email) {
    $message.warning("请输入邮箱");
    return;
  }

  loginLoading.value = true;
  try {
    const res = await loginWorkspace(loginForm.value);
    if (res.code === 200) {
      localStorage.setItem("workspaceUserId", res.data.id);
      currentUser.value = res.data;
      $message.success("登录成功");
      routeByProfile(res.data.id);
    }
  } finally {
    loginLoading.value = false;
  }
};

const useDefaultUser = () => {
  localStorage.setItem("workspaceUserId", "local-user");
  currentUser.value = {
    id: "local-user",
    name: "本地默认用户",
    email: "",
  };
  $message.success("已切换为默认本地用户");
  routeByProfile("local-user");
};

const continueSetup = () => {
  if (!currentUser.value.id) return;
  routeByProfile(currentUser.value.id);
};

onMounted(() => {
  loadCurrentUser();
});
</script>

<style lang="scss" scoped>
.merchant-login {
  display: grid;
  gap: 24px;
  padding: 8px 0 32px;

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 420px);
    gap: 24px;
    align-items: stretch;
    padding: 28px;
    border-radius: 28px;
    background:
      radial-gradient(circle at top left, rgba(10, 132, 255, 0.2), transparent 32%),
      radial-gradient(circle at bottom right, rgba(255, 140, 66, 0.18), transparent 28%),
      linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.92));
    border: 1px solid rgba(148, 163, 184, 0.18);
  }

  .hero-copy {
    display: grid;
    gap: 16px;
    align-content: center;

    h1 {
      font-size: clamp(34px, 5vw, 58px);
      line-height: 0.95;
      letter-spacing: -0.06em;
    }

    p {
      max-width: 720px;
      color: var(--n-text-color-2);
      font-size: 16px;
      line-height: 1.8;
    }
  }

  .hero-points {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    span {
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(148, 163, 184, 0.2);
      font-size: 13px;
    }
  }

  .login-card,
  .feature-card {
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(16px);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .login-tip {
    margin-top: 18px;
  }

  .content-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  ul {
    padding-left: 18px;
    color: var(--n-text-color-2);
    line-height: 1.8;
  }

  @media (max-width: 960px) {
    .hero,
    .content-grid {
      grid-template-columns: 1fr;
    }

    .hero {
      padding: 20px;
    }
  }
}
</style>
