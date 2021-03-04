import { call, put, takeLatest, select } from 'redux-saga/effects';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';

import * as log from '../../utils/electronLogger';
import {
  getErrorMessage,
  getNetwork,
  handelGetPaymentRequestLedger,
  remapNodeError,
} from '@/utils/utility';
import {
  fetchTokenInfo,
  fetchTokensRequest,
  fetchTokensFailure,
  fetchTokensSuccess,
  fetchTokenInfoSuccess,
  fetchTokenInfoFailure,
  fetchTransfersRequest,
  fetchTransfersFailure,
  fetchTransfersSuccess,
  createToken,
  createTokenSuccess,
  createTokenFailure,
  destroyToken,
  destroyTokenFailure,
  destroyTokenSuccess,
  updateTokenRequest,
  updateTokenSuccess,
  updateTokenFailure,
  mintToken,
  mintTokenSuccess,
  mintTokenFailure,
} from './reducer';
import {
  handleFetchTokens,
  handleFetchToken,
  handleTokenTransfers,
  handleCreateTokens,
  handleDestroyToken,
  updateToken,
  handleMintTokens,
} from './service';
import { ErrorMessages, ResponseMessages } from '../../constants/common';

export function* getConfigurationDetails() {
  const { configurationData } = yield select((state) => state.app);
  const data = cloneDeep(configurationData);
  if (isEmpty(data)) {
    throw new Error('Unable to fetch configuration file');
  }
  return data;
}

export function* fetchToken(action) {
  const {
    payload: { id },
  } = action;
  try {
    const data = yield call(handleFetchToken, id);
    yield put({
      type: fetchTokenInfoSuccess.type,
      payload: { tokenInfo: data },
    });
  } catch (e) {
    yield put({ type: fetchTokenInfoFailure.type, payload: e.message });
    log.error(e);
  }
}

export function* fetchTokens() {
  try {
    const data = yield call(handleFetchTokens);
    yield put({
      type: fetchTokensSuccess.type,
      payload: { tokens: data },
    });
  } catch (e) {
    yield put({ type: fetchTokensFailure.type, payload: e.message });
    log.error(e);
  }
}

export function* fetchTransfers(action) {
  const {
    payload: { id },
  } = action;
  try {
    const data = yield call(handleTokenTransfers, id);
    yield put({
      type: fetchTransfersSuccess.type,
      payload: { transfers: data },
    });
  } catch (e) {
    yield put({ type: fetchTransfersFailure.type, payload: e.message });
    log.error(e);
  }
}

export function* createTokens(action) {
  try {
    const {
      payload: { tokenData, typeWallet },
    } = action;
    const networkName = yield call(getNetwork);
    const paymentsLedger = yield call(
      handelGetPaymentRequestLedger,
      networkName
    );
    const data = yield call(
      handleCreateTokens,
      tokenData,
      typeWallet,
      paymentsLedger
    );
    yield put({ type: createTokenSuccess.type, payload: { ...data } });
  } catch (e) {
    yield put({
      type: createTokenFailure.type,
      payload: remapNodeError(getErrorMessage(e)),
    });
    log.error(e);
  }
}

export function* mintTokens(action) {
  try {
    const networkName = yield call(getNetwork);
    const {
      payload: { tokenData },
    } = action;
    const data = yield call(handleMintTokens, tokenData, networkName);
    yield put({ type: mintTokenSuccess.type, payload: { ...data } });
  } catch (e) {
    yield put({
      type: mintTokenFailure.type,
      payload: remapNodeError(getErrorMessage(e)),
    });
    log.error(e);
  }
}

export function* updateTokens(action) {
  try {
    const {
      payload: { tokenData, typeWallet },
    } = action;
    const networkName = yield call(getNetwork);
    const data = yield call(updateToken, tokenData, networkName, typeWallet);
    yield put({ type: updateTokenSuccess.type, payload: { ...data } });
  } catch (e) {
    yield put({
      type: updateTokenFailure.type,
      payload: remapNodeError(getErrorMessage(e)),
    });
    log.error(e);
  }
}

export function* tokenDestroy(action) {
  try {
    const {
      payload: { id },
    } = action;
    const data = yield call(handleDestroyToken, id);
    yield put({ type: destroyTokenSuccess.type, payload: data });
  } catch (e) {
    yield put({
      type: destroyTokenFailure.type,
      payload: remapNodeError(getErrorMessage(e)),
    });
    log.error(e);
  }
}

function* mySaga() {
  yield takeLatest(fetchTokenInfo.type, fetchToken);
  yield takeLatest(fetchTokensRequest.type, fetchTokens);
  yield takeLatest(createToken.type, createTokens);
  yield takeLatest(destroyToken.type, tokenDestroy);
  yield takeLatest(mintToken.type, mintTokens);
  yield takeLatest(updateTokenRequest.type, updateTokens);
  yield takeLatest(fetchTransfersRequest.type, fetchTransfers);
}

export default mySaga;
