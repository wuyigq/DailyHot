const routes = [
  // 首页
  {
    path: "/",
    name: "home",
    meta: {
      title: "首页",
    },
    component: () => import("@/views/Home.vue"),
  },
  // 新闻列表
  {
    path: "/list",
    name: "list",
    meta: {
      title: "新闻列表",
    },
    component: () => import("@/views/List.vue"),
  },
  // 设置页
  {
    path: "/setting",
    name: "setting",
    meta: {
      title: "全局设置",
    },
    component: () => import("@/views/Setting.vue"),
  },
  // 热点内容工作台
  {
    path: "/workspace",
    name: "workspace",
    meta: {
      title: "热点内容获客工作台",
    },
    component: () => import("@/views/workspace/WorkspaceLayout.vue"),
    redirect: "/workspace/setup",
    children: [
      {
        path: "setup",
        name: "workspace-setup",
        meta: {
          title: "商家设置",
        },
        component: () => import("@/views/workspace/WorkspaceSetup.vue"),
      },
      {
        path: "topics",
        name: "workspace-topics",
        meta: {
          title: "行业热点",
        },
        component: () => import("@/views/workspace/WorkspaceTopics.vue"),
      },
      {
        path: "topics/:topicId",
        name: "workspace-topic-detail",
        meta: {
          title: "热点详情与生成",
        },
        component: () => import("@/views/workspace/WorkspaceTopicDetail.vue"),
      },
      {
        path: "drafts",
        name: "workspace-drafts",
        meta: {
          title: "草稿箱",
        },
        component: () => import("@/views/workspace/WorkspaceDrafts.vue"),
      },
    ],
  },
  {
    path: "/merchant/login",
    name: "merchant-login",
    meta: {
      title: "商家登录",
    },
    component: () => import("@/views/merchant/Login.vue"),
  },
  {
    path: "/merchant/onboarding",
    name: "merchant-onboarding",
    meta: {
      title: "商家入驻",
    },
    component: () => import("@/views/merchant/Onboarding.vue"),
  },
  {
    path: "/merchant/config",
    name: "merchant-config",
    meta: {
      title: "商家配置",
    },
    component: () => import("@/views/merchant/Config.vue"),
  },
  // 测试页面
  {
    path: "/test",
    name: "test",
    meta: {
      title: "test",
    },
    component: () => import("@/views/Test.vue"),
  },
  // 403
  {
    path: "/403",
    name: "403",
    meta: {
      title: "403",
    },
    component: () => import("@/views/403.vue"),
  },
  // 404
  {
    path: "/404",
    name: "404",
    meta: {
      title: "404",
    },
    component: () => import("@/views/404.vue"),
  },
  // 500
  {
    path: "/500",
    name: "500",
    meta: {
      title: "500",
    },
    component: () => import("@/views/500.vue"),
  },
  {
    path: "/:pathMatch(.*)",
    redirect: "/404",
  },
];

export default routes;
