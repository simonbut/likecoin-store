/* eslint import/prefer-default-export: "off" */
import * as api from '@/util/api/api';
import * as types from '@/store/mutation-types';
import EthHelper from '@/util/EthHelper';
import apiWrapper from './api-wrapper';

export async function sendPayment({ commit }, payload) {
  try {
    commit(types.UI_START_BLOCKING_LOADING);
    const { txHash } = await apiWrapper(commit, api.apiPostPayment(payload));
    commit(types.UI_STOP_BLOCKING_LOADING);
    commit(types.UI_START_LOADING_TX);
    commit(types.PAYMENT_SET_PENDING_HASH, txHash);
    await EthHelper.waitForTxToBeMined(txHash);
    commit(types.UI_STOP_LOADING_TX);
    return txHash;
  } catch (error) {
    commit(types.UI_STOP_ALL_LOADING);
    commit(types.UI_ERROR_MSG, error.message || error);
    throw error;
  }
}

export async function sendEthPayment({ commit }, { txHash }) {
  try {
    commit(types.UI_START_LOADING_TX);
    commit(types.PAYMENT_SET_PENDING_HASH, txHash);
    await EthHelper.waitForTxToBeMined(txHash);
    commit(types.UI_STOP_LOADING_TX);
    return txHash;
  } catch (error) {
    commit(types.UI_STOP_ALL_LOADING);
    commit(types.UI_ERROR_MSG, error.message || error);
    throw error;
  }
}

export async function checkCoupon({ commit }, code) {
  return apiWrapper(commit, api.apiCheckCoupon(code));
}

export async function claimCoupon({ commit }, { coupon, to }) {
  try {
    commit(types.UI_START_BLOCKING_LOADING);
    const { txHash } = await apiWrapper(commit, api.apiClaimCoupon(coupon, to));
    commit(types.UI_STOP_BLOCKING_LOADING);
    commit(types.UI_START_LOADING_TX);
    commit(types.PAYMENT_SET_PENDING_HASH, txHash);
    await EthHelper.waitForTxToBeMined(txHash);
    commit(types.UI_STOP_LOADING_TX);
    return txHash;
  } catch (error) {
    commit(types.UI_STOP_ALL_LOADING);
    let message = error.message || error;
    if (error.message === 'expired') message = 'Error: Coupon already expire';
    commit(types.UI_ERROR_MSG, message);
    throw new Error(message);
  }
}

export const closeTxToolbar = ({ commit }) => {
  commit(types.PAYMENT_SET_PENDING_HASH, '');
};
