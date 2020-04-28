import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchBlocksRequest,
  fetchBlocksSuccess,
  fetchBlocksFailure,
  fetchTxnsRequest,
  fetchTxnsSuccess,
  fetchTxnsFailure,
} from "./reducer";
import { handelFetchTxns, handelFetchBlocks } from "./blockChainPage.service";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function* fetchBlocks() {
  try {
    const data = yield call(handelFetchBlocks);
    if (data && data.blocks) {
      yield put({ type: fetchBlocksSuccess.type, payload: { ...data } });
    } else {
      yield put({
        type: fetchBlocksFailure.type,
        payload: "No data found",
      });
    }
  } catch (e) {
    yield put({ type: fetchBlocksFailure.type, payload: e.message });
    console.log(e);
  }
}

function* fetchTxns() {
  try {
    const data = yield call(handelFetchTxns);
    if (data && data.txns) {
      yield put({ type: fetchTxnsSuccess.type, payload: { ...data } });
    } else {
      yield put({
        type: fetchTxnsFailure.type,
        payload: "No data found",
      });
    }
  } catch (e) {
    yield put({ type: fetchTxnsFailure.type, payload: e.message });
    console.log(e);
  }
}

function* mySaga() {
  yield takeLatest(fetchBlocksRequest.type, fetchBlocks);
  yield takeLatest(fetchTxnsRequest.type, fetchTxns);
}

export default mySaga;
