import { call, put, takeLatest, all } from "redux-saga/effects";
import { attendanceApi, WORKFLOW_ACTIONS, attendanceActions } from "./api-configuration";

// Generic saga creator for GET requests
function* createFetchSaga(
  apiFunction: any,
  successAction: any,
  failureAction: any
) {
  return function* (action: any): Generator<any, void, any> {
    try {
      const response = yield call(apiFunction, action.payload);
      yield put(successAction(response.data));
    } catch (error: any) {
      yield put(failureAction(error?.response?.data || error.message));
    }
  };
}

// Worker Sagas using the generic saga creator
const fetchWorkflowGuardSaga = createFetchSaga(
  attendanceApi.fetchWorkflowGuard,
  attendanceActions.workflowGuard.success,
  attendanceActions.workflowGuard.failure
);

const fetchWorkflowActionSaga = createFetchSaga(
  attendanceApi.fetchWorkflowAction,
  attendanceActions.workflowAction.success,
  attendanceActions.workflowAction.failure
);

const fetchWorkflowEventSaga = createFetchSaga(
  attendanceApi.fetchWorkflowEvent,
  attendanceActions.workflowEvent.success,
  attendanceActions.workflowEvent.failure
);

// Custom saga for the POST request since it has a different pattern
function* submitWorkflowSaga(action: any): Generator<any, void, any> {
  try {
    const response = yield call(attendanceApi.submitWorkflow, action.payload);
    yield put(attendanceActions.submitWorkflow.success(response.data));
  } catch (error: any) {
    yield put(
      attendanceActions.submitWorkflow.failure(
        error.response?.data || error.message
      )
    );
  }
}

// Watcher Saga
export function* attendanceSagas() {
  yield all([
    takeLatest(
      WORKFLOW_ACTIONS.FETCH_GUARD.REQUEST as any,
      fetchWorkflowGuardSaga as any
    ),
    takeLatest(
      WORKFLOW_ACTIONS.FETCH_ACTION.REQUEST as any,
      fetchWorkflowActionSaga as any
    ),
    takeLatest(
      WORKFLOW_ACTIONS.FETCH_EVENT.REQUEST as any,
      fetchWorkflowEventSaga as any
    ),
    takeLatest(
      WORKFLOW_ACTIONS.SUBMIT.REQUEST as any,
      submitWorkflowSaga as any
    ),
  ]);
}