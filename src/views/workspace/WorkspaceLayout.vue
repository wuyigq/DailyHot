<template>
  <div class="workspace-layout">
    <section class="hero">
      <div class="hero-copy">
        <n-tag type="success" round>ToB MVP</n-tag>
        <h1>热点内容获客工作台</h1>
        <p>
          面向本地商家、品牌和代运营团队。当前阶段只做一件事：把
          <strong>行业热点 -> 商家内容 -> 可发布草稿</strong>
          跑通，并保证手机浏览器可用。
        </p>
      </div>
      <n-card class="status-card" embedded>
        <n-space vertical size="small">
          <div class="status-row">
            <span>当前用户</span>
            <strong>{{ workspace.currentUser?.name || "未初始化" }}</strong>
          </div>
          <div class="status-row">
            <span>品牌 / 门店</span>
            <strong>{{ workspace.merchantProfile.brandName || "待填写" }}</strong>
          </div>
          <div class="status-row">
            <span>首发行业</span>
            <strong>{{ workspace.merchantProfile.industry }}</strong>
          </div>
          <div class="status-row">
            <span>首发平台</span>
            <strong>{{ activePlatforms }}</strong>
          </div>
        </n-space>
      </n-card>
    </section>

    <div class="nav">
      <n-button
        v-for="item in navItems"
        :key="item.path"
        :type="route.path === item.path ? 'primary' : 'default'"
        :secondary="route.path !== item.path"
        strong
        round
        @click="router.push(item.path)"
      >
        {{ item.label }}
      </n-button>
    </div>

    <router-view />
  </div>
</template>

<script setup>
import { workspaceStore } from "@/store";
import { getPlatformLabel } from "@/utils/workspace";
import { useRoute, useRouter } from "vue-router";

const workspace = workspaceStore();
const route = useRoute();
const router = useRouter();

const navItems = [
  { label: "1. 商家设置", path: "/workspace/setup" },
  { label: "2. 行业热点", path: "/workspace/topics" },
  { label: "3. 草稿箱", path: "/workspace/drafts" },
];

const activePlatforms = computed(() => {
  const platforms = workspace.merchantProfile.platforms || [];
  return platforms.length ? platforms.map((item) => getPlatformLabel(item)).join(" / ") : "待选择";
});

onMounted(() => {
  workspace.bootstrap();
});
</script>

<style lang="scss" scoped>
.workspace-layout {
  display: grid;
  gap: 20px;

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(260px, 0.8fr);
    gap: 18px;
    align-items: stretch;
  }

  .hero-copy,
  .status-card {
    border-radius: 20px;
    padding: 24px;
    background:
      radial-gradient(circle at 12% 24%, rgba(234, 68, 77, 0.16), transparent 26%),
      linear-gradient(135deg, rgba(45, 112, 237, 0.1), rgba(238, 173, 63, 0.14));
  }

  .hero-copy {
    h1 {
      margin: 14px 0 12px;
      font-size: clamp(30px, 5vw, 54px);
      line-height: 1;
      letter-spacing: -0.08em;
    }

    p {
      max-width: 760px;
      margin: 0;
      font-size: 15px;
      line-height: 1.8;
      color: var(--n-text-color-2);
    }
  }

  .status-card {
    background-color: rgba(255, 255, 255, 0.72);
  }

  .status-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 14px;
  }

  .nav {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  @media (max-width: 900px) {
    .hero {
      grid-template-columns: 1fr;
    }

    .hero-copy,
    .status-card {
      padding: 20px;
    }
  }
}
</style>
