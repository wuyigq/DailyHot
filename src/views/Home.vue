<template>
  <div class="home">
    <!-- <n-alert type="info" :show-icon="false" style="margin-bottom: 20px">
      站点未完工
    </n-alert> -->
    <n-grid
      v-if="displayedNewsArr[0]"
      cols="1 560:2 800:3 1100:4 1500:5"
      :x-gap="24"
      :y-gap="24"
    >
      <n-grid-item
        class="news-card"
        v-for="(item, index) in displayedNewsArr"
        :key="item"
        :style="{ animationDelay: index / 10 + 0.2 + 's' }"
      >
        <HotList :hotData="item" />
      </n-grid-item>
    </n-grid>
    <div ref="loadMoreRef" class="load-more" v-if="displayedNewsArr[0] && (hasMoreDisplay || store.routeHasMore)">
      <n-spin size="small" v-if="store.routeLoading" />
      <span v-else>继续下滑加载更多</span>
    </div>
    <div class="error" v-else>
      <n-divider dashed class="tip"> 此处暂无内容 </n-divider>
      <n-space justify="center">
        <n-button size="large" secondary strong @click="reset">
          出错了？点此重置
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import HotList from "@/components/HotList.vue";

const store = mainStore();
const pageSize = 20;
const renderCount = ref(pageSize);
const loadMoreRef = ref(null);
let loadMoreObserver = null;

const visibleNewsArr = computed(() => store.newsArr.filter((item) => item.show));
const displayedNewsArr = computed(() => visibleNewsArr.value.slice(0, renderCount.value));
const hasMoreDisplay = computed(() => renderCount.value < visibleNewsArr.value.length);

const loadMore = async () => {
  if (hasMoreDisplay.value) {
    renderCount.value += pageSize;
    return;
  }

  if (store.routeHasMore) {
    const beforeCount = visibleNewsArr.value.length;
    await store.loadNextRoutePage();
    if (visibleNewsArr.value.length > beforeCount) {
      renderCount.value += pageSize;
    }
  }
};

// 重置
const reset = () => {
  $dialog.warning({
    title: "重置站点",
    content:
      "确认重置站点？你的自定义数据将会恢复为默认状态！（当设置页面能正常进入并显示时请不要执行此操作！）",
    positiveText: "重置",
    negativeText: "取消",
    onPositiveClick: () => {
      if ($timeInterval) clearInterval($timeInterval);
      localStorage.clear();
      location.reload();
    },
  });
};

watch(
  () => visibleNewsArr.value.length,
  () => {
    if (renderCount.value < pageSize) {
      renderCount.value = pageSize;
    }
  },
  { immediate: true }
);

watch(
  () => loadMoreRef.value,
  (element) => {
    if (!element) return;

    if (!loadMoreObserver) {
      loadMoreObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      }, { rootMargin: "240px 0px" });
    }

    loadMoreObserver.disconnect();
    loadMoreObserver.observe(element);
  },
  { flush: "post" }
);

onBeforeUnmount(() => {
  loadMoreObserver?.disconnect();
});
</script>

<style lang="scss" scoped>
.home {
  .news-card {
    opacity: 0;
    transform: translateY(20px);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
    animation: cardShow 0.3s forwards ease-in-out;
  }
  .tip {
    font-size: 22px;
  }
  .load-more {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 72px;
    color: var(--n-text-color-3);
    font-size: 14px;
  }
}

// 出现动画
@keyframes cardShow {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
