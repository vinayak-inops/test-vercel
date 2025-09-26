// Initial State
const createInitialSubState = () => ({
    data: null,
    loading: false,
    error: null,
  });
  
interface SubState {
    data: any;
    loading: boolean;
    error: any;
}

interface InitialState {
    workflowGuard: SubState;
    workflowAction: SubState;
    workflowEvent: SubState;
    workflowSubmit: SubState;
}

const initialState: InitialState = {
    workflowGuard: createInitialSubState(),
    workflowAction: createInitialSubState(),
    workflowEvent: createInitialSubState(),
    workflowSubmit: createInitialSubState(),
};
  
  // Reducer Helper Functions
  const handleRequest = (subState:any) => ({
    ...subState,
    loading: true,
    error: null,
  });
  
  const handleSuccess = (subState:any, data:any) => ({
    ...subState,
    loading: false,
    data,
    error: null,
  });
  
  const handleFailure = (subState:any, error:any) => ({
    ...subState,
    loading: false,
    error,
  });
  
  // Helper to create reducers for a specific entity
  const createEntityReducer = (
    state: InitialState,
    action: { type: string; data?: any; error?: any },
    entity: keyof InitialState,
    actionTypes: { REQUEST: string; SUCCESS: string; FAILURE: string }
  ) => {
    switch (action.type) {
      case actionTypes.REQUEST:
        return {
          ...state,
          [entity]: handleRequest(state[entity]),
        };
      case actionTypes.SUCCESS:
        return {
          ...state,
          [entity]: handleSuccess(state[entity], action.data),
        };
      case actionTypes.FAILURE:
        return {
          ...state,
          [entity]: handleFailure(state[entity], action.error),
        };
      default:
        return state;
    }
  };
  
  // Import WORKFLOW_ACTIONS from the constants file
  import { WORKFLOW_ACTIONS } from './api-configuration';
  
  // Unified Reducer
  export const attendanceReducer = (state = initialState, action:any) => {
    // Handle workflow guard actions
    if (Object.values(WORKFLOW_ACTIONS.FETCH_GUARD).includes(action.type)) {
      return createEntityReducer(
        state,
        action,
        "workflowGuard",
        WORKFLOW_ACTIONS.FETCH_GUARD as any
      );
    }
  
    // Handle workflow action actions
    if (Object.values(WORKFLOW_ACTIONS.FETCH_ACTION).includes(action.type)) {
      return createEntityReducer(
        state,
        action,
        "workflowAction",
        WORKFLOW_ACTIONS.FETCH_ACTION as any
      );
    }
  
    // Handle workflow event actions
    if (Object.values(WORKFLOW_ACTIONS.FETCH_EVENT).includes(action.type)) {
      return createEntityReducer(
        state,
        action,
        "workflowEvent",
        WORKFLOW_ACTIONS.FETCH_EVENT as any
      );
    }
  
    // Handle workflow submit actions
    if (Object.values(WORKFLOW_ACTIONS.SUBMIT).includes(action.type)) {
      return createEntityReducer(
        state,
        action,
        "workflowSubmit",
        WORKFLOW_ACTIONS.SUBMIT as any
      );
    }
  
    return state;
  };
  
  export default attendanceReducer;