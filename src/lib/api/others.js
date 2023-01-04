import { useMutation, useQuery } from "@tanstack/vue-query";
import http from "@/lib/http.js";

export const useGetRequestQuery = (slug, { onSuccess, onError }) => {
  return useQuery(['request'], async () => {
    const { data: { data: id } } = await http.get(`/3/slug/${ slug }`);
    const { data: { data: request } } = await http.get(`https://sellbackend.creditclan.com/merchantclanbackend/public/index.php/api/request_only/${ id }`);
    const { customer: { email, phone }, creditclan_request_id: request_id } = request;
    let cc_request = null;
    if (request_id) {
      const { data: { token } } = await http.post(`https://mobile.creditclan.com/api/v3/customer/check/details`, {
        email, phone
      }, {
        headers: { 'x-api-key': 'WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228' }
      });
      const res = await http.post('https://mobile.creditclan.com/api/v3/loan/details', {
        token, request_id
      }, {
        headers: { 'x-api-key': 'WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228' }
      });
      cc_request = { ...res.data.data, token };
    }
    return { request, cc_request };
  }, { onSuccess, onError });
};

export const useGetMeterDetailsQuery = (slug) => {
  return useQuery(['meter'], async () => {
    const res = await http.post('https://wasapnodeserver.herokuapp.com/meter_details', { slug })
    return res.data.data;
  });
};

export const useUpdatePlanMutation = () => {
  return useMutation(({ item_request_id, plan }) => {
    return http.patch('https://sellbackend.creditclan.com/merchantclan/public/index.php/api/request/plan', {
      item_request_id, plan
    });
  });
};

export const useGetVirtualAccountQuery = ({ amount, phone, full_name }) => {
  return useQuery(['account'], async () => {
    const res = await http.post("https://wema.creditclan.com/generate/account/conlog", {
      amount, phone, full_name,
      merchant_name: 'Clan africa',
      narration: "Order payment",
    });
    return res.data.data;
  }, { refetchOnMount: false, refetchOnWindowFocus: false, staleTime: Infinity });
};

export const useConfirmPaymentMutation = () => {
  return useMutation(async ({ id, payment_ref }) => {
    await http.post(`/request/${ id }/reference`, { payment_ref });
    return http.post(`/request/${ id }/confirm/payment`, { payment_ref });
  });
};

export const useVerifyTransactionMutation = () => {
  return useMutation(async ({ transaction_reference }) => {
    const res = await http.post("https://wema.creditclan.com/api/v3/wema/verify_transaction", {
      transaction_reference,
    });
    return res.data;
  });
};

export const useGetUserDetailsQuery = (
  { data: { full_name, email, phone, date_of_birth, profile_image = '', ...rest }, onSuccess }
) => {
  return useQuery(['user'], async () => {
    let { data } = await http.post(`https://mobile.creditclan.com/api/v3/customer/check/details`, { email, phone }, {
      headers: { 'x-api-key': 'WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228' }
    });
    if (!data.token && !data.user_id) {
      const res = await http.post('https://mobile.creditclan.com/api/v3/customer/register/market_user', {
        profile: {
          full_name, email: email?.replace(/ /gi, ''), phone, date_of_birth,
          profile_image, password: 'temp', is_individual: 1, ...rest,
        }
      }, {
        headers: { 'x-api-key': 'WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228' }
      });
      data = res.data;
    }
    const res = await http.post('https://mobile.creditclan.com/api/v3/user/detailsbyid', { token: data.token }, {
      headers: { 'x-api-key': 'WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228' }
    });
    return { ...res.data, ...data };
  }, { onSuccess, staleTime: Infinity, cacheTime: Infinity });
};

export const useSaveUserDataMutation = () => {
  return useMutation((body) => {
    return http.post('https://mobile.creditclan.com/api/v3/customer/save_market_data', body, {
      headers: { 'x-api-key': 'WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228' }
    });
  });
};

export const useCreateRequestMutation = () => {
  return useMutation(async (body) => {
    const { data } = await http.post('https://mobile.creditclan.com/api/v3/loan/apply_for_bnpl', body, {
      headers: { 'x-api-key': 'WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228' }
    });
    if (!data.status) {
      throw new Error(data.message || 'An error occurred while creating your request, please try again');
    }
    return data.dd;
  });
};

export const useSaveCcRequestId = () => {
  return useMutation(({ merchant_request_id, creditclan_request_id }) => {
    return http.patch(`https://sellbackend.creditclan.com/merchantclan/public/index.php/api/request/${ merchant_request_id }`, {
      creditclan_request_id
    });
  });
};
