<script setup>
import { Field, Form } from 'vee-validate';
import http from "@/lib/http.js";
import { toFormValidator } from "@vee-validate/zod";
import * as zod from "zod";
import states from "@/lib/states.js";
import { ref } from "vue";
import { occupations, relationships } from "@/lib/options.js";
import { useStore } from "@/stores/store.ts";
import { useCreateRequestMutation, useSaveCcRequestId, useSaveUserDataMutation } from "@/lib/api/others.js";
import { useQueryClient } from "@tanstack/vue-query";

const emit = defineEmits(['done']);

const store = useStore();
const lgas = ref([]);
const qc = useQueryClient();
const schema = toFormValidator(
  zod.object({
    date_of_birth: zod.string().min(1, 'Date of birth cannot be empty'),
    gender: zod.string().min(1, 'Gender is required'),
    address: zod.string().min(1, 'Address is required'),
    state: zod.string().min(1, 'State is required'),
    lga: zod.string().min(1, 'LGA is required'),
    nok_name: zod.string().min(1, 'Next of kin name is required'),
    nok_phone: zod.string().min(1, 'Next of kin phone is required'),
    nok_email: zod.string().min(1, 'Next of kin email is required'),
    nok_address: zod.string().min(1, 'Next of kin address is required'),
    nok_relationship: zod.string().min(1, 'Next of kin relationship is required'),
    work_occupation_id: zod.string().min(1, 'Employment status is required'),
    work_monthly_income: zod.string().min(1, 'Monthly income is required'),
  })
);

const { mutateAsync: saveUserData, isLoading: isSaveUserDataLoading } = useSaveUserDataMutation();
const { mutateAsync: createRequest, isLoading: isCreateRequestLoading } = useCreateRequestMutation();
const { mutateAsync: saveCcRequestId, isLoading: isSaveCcRequestIdLoading } = useSaveCcRequestId();

const handleSubmit = async (values) => {
  const body = {
    token: store.cc_request.token,
    request: {
      amount: store.plansTotal,
      tenor: store.plansDuration,
      product_id: 30002,
    },
    profile: {
      full_name: store.customer.full_name,
      email: store.customer.email,
      phone: store.customer.phone,
      date_of_birth: values.date_of_birth,
      gender: values.gender,
    },
    work: {
      occupation_id: values.work_occupation_id,
      monthly_income: values.work_occupation_id,
    },
    next_of_kin: {
      full_name: values.nok_name,
      email: values.nok_email,
      phone: values.nok_phone,
      address: values.nok_address,
      relationship: values.nok_relationship,
    },
    home_address: {
      address: values.address,
      state_id: values.state,
      lga_id: values.lga,
    },
    merchant_id: store.merchant.id,
    merchant_request_id: store.request.id,
    plans: store.request.items.map(i => i.item_plan.plan),
  };
  await saveUserData(body);
  const creditclan_request_id = await createRequest(body);
  await saveCcRequestId({ merchant_request_id: store.request.id, creditclan_request_id });
  qc.invalidateQueries(['request']);
  emit('done');
};

const handleStateChange = async (value) => {
  const res = await http.get(`https://mobile.creditclan.com/webapi/v1/states/${ value }/lgas`, {
    headers: { 'x-api-key': 'WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228' }
  });
  lgas.value = res.data.data.map(lga => ({ title: lga.name, value: lga.id }));
};
</script>

<template>
  <v-card
    v-if="isSaveUserDataLoading || isCreateRequestLoading || isSaveCcRequestIdLoading" class="pa-0" elevation="0"
  >
    <v-card-text class="px-6 py-6">
      <div class="py-16 text-center">
        <br><br><br>
        <v-progress-circular indeterminate size="25"></v-progress-circular>
        <p class="mx-auto mt-10 text-body-1" style="max-width: 300px">
          Please wait..
        </p>
        <br><br><br>
      </div>
    </v-card-text>
  </v-card>
  <template v-else>
    <h3 class="mb-8">Kindly provide the following information to continue</h3>
    <Form :validation-schema="schema" @submit="handleSubmit" v-slot="{ errors }">
      <v-card variant="outlined" class="rounded-lg border">
        <v-card-text class="pa-6 pb-2">
          <div class="mb-6">Personal information</div>
          <Field name="date_of_birth" v-slot="{ field, errors }">
            <v-text-field
              label="Date of birth" type="date" variant="underlined" v-bind="field"
              :error-messages="errors" class="rounded-lg"
            />
          </Field>
          <Field name="gender" v-slot="{ field, errors }">
            <v-select
              :items="[{ title: 'Male', value: '0' }, { title: 'Female', value: '1' }]" v-bind="field"
              label="Gender" variant="underlined" :error-messages="errors" class="rounded-lg"
            />
          </Field>
        </v-card-text>
      </v-card>
      <v-card variant="outlined" class="rounded-lg border mt-4">
        <v-card-text class="pa-6 pb-2">
          <div class="mb-6">Personal address</div>
          <Field name="address" v-slot="{ field, errors }">
            <v-text-field
              label="Address" type="text" variant="underlined" v-bind="field" :error-messages="errors"
              class="rounded-lg"
            />
          </Field>
          <Field name="state" v-slot="{ field, errors }">
            <v-select
              :items="states" v-bind="field" label="State" variant="underlined" :error-messages="errors"
              class="rounded-lg" @update:modelValue="handleStateChange"
            />
          </Field>
          <Field name="lga" v-slot="{ field, errors }">
            <v-select
              :items="lgas" v-bind="field" label="LGA" variant="underlined" :error-messages="errors"
              class="rounded-lg"
            />
          </Field>
        </v-card-text>
      </v-card>
      <v-card variant="outlined" class="rounded-lg border mt-4">
        <v-card-text class="pa-6 pb-2">
          <div class="mb-6">Next of kin information</div>
          <Field name="nok_name" v-slot="{ field, errors }">
            <v-text-field
              label="Name" type="text" variant="underlined" v-bind="field" :error-messages="errors"
              class="rounded-lg"
            />
          </Field>
          <Field name="nok_phone" v-slot="{ field, errors }">
            <v-text-field
              label="Phone number" type="text" variant="underlined" v-bind="field" :error-messages="errors"
              class="rounded-lg"
            />
          </Field>
          <Field name="nok_email" v-slot="{ field, errors }">
            <v-text-field
              label="Email address" type="text" variant="underlined" v-bind="field" :error-messages="errors"
              class="rounded-lg"
            />
          </Field>
          <Field name="nok_address" v-slot="{ field, errors }">
            <v-text-field
              label="Address" type="text" variant="underlined" v-bind="field" :error-messages="errors"
              class="rounded-lg"
            />
          </Field>
          <Field name="nok_relationship" v-slot="{ field, errors }">
            <v-select
              :items="relationships" v-bind="field" label="Relationship" variant="underlined" :error-messages="errors"
              class="rounded-lg"
            />
          </Field>
        </v-card-text>
      </v-card>
      <v-card variant="outlined" class="rounded-lg border mt-4">
        <v-card-text class="pa-6 pb-2">
          <div class="mb-6">Work information</div>
          <Field name="work_occupation_id" v-slot="{ field, errors }">
            <v-select
              label="Employment status" :items="occupations" v-bind="field" variant="underlined"
              :error-messages="errors" class="rounded-lg"
            />
          </Field>
          <Field name="work_monthly_income" v-slot="{ field, errors }">
            <v-text-field
              label="Monthly income" type="number" variant="underlined" v-bind="field" :error-messages="errors"
              class="rounded-lg"
            />
          </Field>
        </v-card-text>
      </v-card>
      <v-btn type="submit" variant="flat" color="green" rounded class="mt-10">Submit</v-btn>
    </Form>
  </template>
</template>
