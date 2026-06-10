import axios from "@/api/request";

/**
 * 获取热榜分类数据
 * @param {string} type 热榜分类名称
 * @param {boolean} isNew 是否拉取最新数据
 * @param {object} params 请求参数
 * @returns
 */
export const getHotLists = (type, isNew = false, params) => {
  return axios({
    method: "GET",
    url: `/${type}`,
    params: {
      cache: !isNew,
      ...params,
    },
  });
};

export const getWorkspacePreferences = () => {
  return axios({
    method: "GET",
    url: "/workspace/preferences",
  });
};

export const loginWorkspace = (data) => {
  return axios({
    method: "POST",
    url: "/workspace/auth/login",
    data,
  });
};

export const getWorkspaceMe = () => {
  return axios({
    method: "GET",
    url: "/workspace/auth/me",
  });
};

export const saveWorkspacePreferences = (data) => {
  return axios({
    method: "PUT",
    url: "/workspace/preferences",
    data,
  });
};

export const getWorkspaceFeed = (params) => {
  return axios({
    method: "GET",
    url: "/workspace/feed",
    params,
  });
};

export const generateWorkspaceDraft = (data) => {
  return axios({
    method: "POST",
    url: "/workspace/generate",
    data,
  });
};

export const getWorkspaceDrafts = () => {
  return axios({
    method: "GET",
    url: "/workspace/drafts",
  });
};

export const getWorkspacePersona = () => {
  return axios({
    method: "GET",
    url: "/workspace/persona",
  });
};

export const saveWorkspacePersona = (data) => {
  return axios({
    method: "PUT",
    url: "/workspace/persona",
    data,
  });
};

export const checkWorkspaceDraft = (id, data) => {
  return axios({
    method: "POST",
    url: `/workspace/drafts/${id}/check`,
    data,
  });
};

export const getWorkspacePublishRecords = () => {
  return axios({
    method: "GET",
    url: "/workspace/publish-records",
  });
};

export const createWorkspacePublishRecord = (data) => {
  return axios({
    method: "POST",
    url: "/workspace/publish-records",
    data,
  });
};

export const updateWorkspaceDraftReview = (id, data) => {
  return axios({
    method: "PATCH",
    url: `/workspace/drafts/${id}/review`,
    data,
  });
};

export const updateWorkspacePublishMetrics = (id, data) => {
  return axios({
    method: "PATCH",
    url: `/workspace/publish-records/${id}/metrics`,
    data,
  });
};

export const getWorkspaceOverview = () => {
  return axios({
    method: "GET",
    url: "/workspace/overview",
  });
};

export const getWorkspaceAuditLogs = () => {
  return axios({
    method: "GET",
    url: "/workspace/audit-logs",
  });
};
