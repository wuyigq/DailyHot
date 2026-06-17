import { defineStore } from "pinia";
import {
  getWorkspaceMe,
  getWorkspaceMerchantProfile,
  getWorkspacePreferences,
  loginWorkspace,
  saveWorkspaceMerchantProfile,
  saveWorkspacePreferences,
} from "@/api";
import {
  defaultMerchantProfile,
  defaultWorkspacePreferences,
  keywordPresets,
} from "@/utils/workspace";

export const workspaceStore = defineStore("workspaceData", {
  state: () => ({
    currentUser: null,
    merchantProfile: defaultMerchantProfile(),
    preferences: defaultWorkspacePreferences(),
    selectedTopic: null,
    initialized: false,
    loading: false,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.currentUser?.id),
    workspaceUserId: (state) => state.currentUser?.id || localStorage.getItem("workspaceUserId") || "",
  },
  actions: {
    normalizeProfile(profile = {}) {
      const base = defaultMerchantProfile();
      return {
        ...base,
        ...profile,
        platforms: Array.isArray(profile.platforms) && profile.platforms.length
          ? [...new Set(profile.platforms)]
          : base.platforms,
        keywords: Array.isArray(profile.keywords) && profile.keywords.length
          ? [...new Set(profile.keywords)]
          : keywordPresets[profile.industry] || base.keywords,
      };
    },
    mergePreferences(profile = this.merchantProfile, remote = {}) {
      const defaults = defaultWorkspacePreferences(profile);
      return {
        ...defaults,
        ...remote,
        keywords: Array.isArray(remote.keywords) && remote.keywords.length
          ? remote.keywords
          : defaults.keywords,
        categories: Array.isArray(remote.categories) && remote.categories.length
          ? remote.categories
          : defaults.categories,
        excludeWords: Array.isArray(remote.excludeWords)
          ? remote.excludeWords
          : defaults.excludeWords,
        sources: Array.isArray(remote.sources) && remote.sources.length
          ? remote.sources
          : defaults.sources,
      };
    },
    applyIndustryPreset(industry) {
      if (!industry) return;
      this.merchantProfile.industry = industry;
      const presetKeywords = keywordPresets[industry];
      if (presetKeywords?.length) {
        this.merchantProfile.keywords = [...presetKeywords];
      }
      this.preferences = this.mergePreferences(this.merchantProfile, {
        ...this.preferences,
        keywords: this.merchantProfile.keywords,
        categories: [industry, this.merchantProfile.city].filter(Boolean),
      });
    },
    updateMerchantProfile(profile) {
      this.merchantProfile = this.normalizeProfile({
        ...this.merchantProfile,
        ...profile,
      });
      this.preferences = this.mergePreferences(this.merchantProfile, {
        ...this.preferences,
        keywords: this.merchantProfile.keywords,
        categories: [this.merchantProfile.industry, this.merchantProfile.city].filter(Boolean),
      });
    },
    setSelectedTopic(topic) {
      this.selectedTopic = topic || null;
    },
    async bootstrap(force = false) {
      if ((this.initialized && !force) || this.loading) return;
      this.loading = true;
      try {
        if (this.workspaceUserId) {
          const [meRes, merchantProfileRes, preferencesRes] = await Promise.allSettled([
            getWorkspaceMe(),
            getWorkspaceMerchantProfile(),
            getWorkspacePreferences(),
          ]);

          if (meRes.status === "fulfilled" && meRes.value?.code === 200) {
            this.currentUser = meRes.value.data;
          }

          if (merchantProfileRes.status === "fulfilled" && merchantProfileRes.value?.code === 200) {
            this.merchantProfile = this.normalizeProfile(merchantProfileRes.value.data);
          }

          if (preferencesRes.status === "fulfilled" && preferencesRes.value?.code === 200) {
            this.preferences = this.mergePreferences(this.merchantProfile, preferencesRes.value.data);
          }
        }
      } finally {
        this.loading = false;
        this.initialized = true;
      }
    },
    async login(payload) {
      const res = await loginWorkspace(payload);
      if (res?.code === 200) {
        this.currentUser = res.data;
        localStorage.setItem("workspaceUserId", res.data.id);
        this.preferences = this.mergePreferences(this.merchantProfile, this.preferences);
      }
      return res;
    },
    useDefaultUser() {
      const defaultUser = {
        id: "local-user",
        email: "local-user@dailyhot.local",
        name: "本地商家用户",
      };
      this.currentUser = defaultUser;
      localStorage.setItem("workspaceUserId", defaultUser.id);
      this.preferences = this.mergePreferences(this.merchantProfile, this.preferences);
      return defaultUser;
    },
    async syncPreferences(override = {}) {
      const payload = this.mergePreferences(this.merchantProfile, {
        ...this.preferences,
        ...override,
      });
      const res = await saveWorkspacePreferences(payload);
      if (res?.code === 200) {
        this.preferences = this.mergePreferences(this.merchantProfile, res.data);
      }
      return res;
    },
    async syncMerchantProfile(override = {}) {
      const payload = this.normalizeProfile({
        ...this.merchantProfile,
        ...override,
      });
      const res = await saveWorkspaceMerchantProfile(payload);
      if (res?.code === 200) {
        this.merchantProfile = this.normalizeProfile(res.data);
        this.preferences = this.mergePreferences(this.merchantProfile, this.preferences);
      }
      return res;
    },
  },
  persist: [
    {
      storage: localStorage,
      paths: ["currentUser", "merchantProfile", "preferences"],
    },
  ],
});
