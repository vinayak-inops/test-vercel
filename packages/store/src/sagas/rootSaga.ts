import { all, fork } from "redux-saga/effects";
import { attendanceSaga } from "./workflow/event-state-action-guard-saga";
import { attendanceSagas } from "./api-call/api-saga";
import { watchFetchexcelStatus } from "./master/excel-upload/excelStatus/excel-status-saga";
import { watchFetchExcelTemplates } from "./master/excel-upload/templates/excel-templates-saga";

export default function* rootSaga() {
  yield all([
    attendanceSagas(),
    attendanceSaga(),  
    watchFetchexcelStatus(),
    watchFetchExcelTemplates(), 
  ]);
}
