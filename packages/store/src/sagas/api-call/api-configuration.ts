import axios from "axios";

// API Endpoints Configuration
export const API_CONFIG = {
  BASE_URLS: {
    QUERY: "http://192.168.1.23:8080/api/query/attendance",
    COMMAND: "http://192.168.1.23:8080/api/command/attendance",
  },
  ENDPOINTS: {
    workflowGuard: "/workflowguard",
    workflowAction: "/workflowaction",
    workflowEvent: "/workflowevent",
    workflows: "/workflows",
  },
  METHODS: {
    GET: "GET",
    POST: "POST",
  },
};

// Action Type Generator
const createActionTypes = (base:any, actions:any) => {
  const types: Record<string, string> = {};
  actions.forEach((action:any) => {
    types[action] = `${base}_${action}`;
  });
  return types;
};

// Action Types
export const REQUEST_TYPES = ["REQUEST", "SUCCESS", "FAILURE"];

export const WORKFLOW_ACTIONS = {
  FETCH_GUARD: createActionTypes("FETCH_WORKFLOW_GUARD", REQUEST_TYPES),
  FETCH_ACTION: createActionTypes("FETCH_WORKFLOW_ACTION", REQUEST_TYPES),
  FETCH_EVENT: createActionTypes("FETCH_WORKFLOW_EVENT", REQUEST_TYPES),
  SUBMIT: createActionTypes("SUBMIT_WORKFLOW", REQUEST_TYPES),
};

// Action Creator Generator
const createActionCreators = (types:any) => ({
  request: (payload:any) => ({ type: types.REQUEST, payload }),
  success: (data:any) => ({ type: types.SUCCESS, data }),
  failure: (error:any) => ({ type: types.FAILURE, error }),
});

// Unified Action Creators
export const attendanceActions = {
  workflowGuard: createActionCreators(WORKFLOW_ACTIONS.FETCH_GUARD),
  workflowAction: createActionCreators(WORKFLOW_ACTIONS.FETCH_ACTION),
  workflowEvent: createActionCreators(WORKFLOW_ACTIONS.FETCH_EVENT),
  submitWorkflow: createActionCreators(WORKFLOW_ACTIONS.SUBMIT),
};

// Utility function to build URL with query params
const buildUrl = (baseUrl:any, endpoint:any, params = {}) => {
  const url = `${baseUrl}${endpoint}`;
  const queryString = new URLSearchParams(params).toString();
  return queryString ? `${url}?${queryString}` : url;
};

// Generic fetch function
const fetchData = (baseUrl:any, endpoint:any, params = {}) => {
  const url = buildUrl(baseUrl, endpoint, params);
  return axios.get(url);
};

export const attendanceApi = {
  // GET requests using the same function with different parameters
  fetchWorkflowGuard: (params:any) =>
    fetchData(
      API_CONFIG.BASE_URLS.QUERY,
      API_CONFIG.ENDPOINTS.workflowGuard,
      params
    ),

  fetchWorkflowAction: (params:any) =>
    fetchData(
      API_CONFIG.BASE_URLS.QUERY,
      API_CONFIG.ENDPOINTS.workflowAction,
      params
    ),

  fetchWorkflowEvent: (params:any) =>
    fetchData(
      API_CONFIG.BASE_URLS.QUERY,
      API_CONFIG.ENDPOINTS.workflowEvent,
      params
    ),

  // POST request for workflow submission
  submitWorkflow: (workflowData:any) => {
    return axios.post(
      `${API_CONFIG.BASE_URLS.COMMAND}${API_CONFIG.ENDPOINTS.workflows}`,
      {
        tenant: "Midhani",
        action: "insert",
        id: null,
        name: workflowData.workFlowName.title,
        collectionName: "workflows",
        data: {
          initialState: workflowData.initialState,
          states: [
            ...workflowData.uniqueSourceStates,
            workflowData.backend[workflowData.backend.length - 1].targetState,
          ],
          transitions: workflowData.backend,
          workflowui: {
            nodes: workflowData.nodes,
            edges: workflowData.edges,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  },
};