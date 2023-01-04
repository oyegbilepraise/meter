<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import { useStore } from "@/stores/store.ts";

const emit = defineEmits(['close']);

const qc = useQueryClient();
const store = useStore();

const widget = null;
const loading = ref('');
const CcEligibilityWidget = window['CcEligibilityWidget'];

onBeforeUnmount(() => {
  if (widget.value) widget.value.close();
});

onMounted(() => {
  const { request, customer, merchant } = store.$state;
  const amount = request.items.reduce((acc, i) => +i.price + acc, 0);
  const plans = store.request.items.map(i => i.item_plan.plan);
  loading.value = 'Please wait..';
  widget.value = CcEligibilityWidget.init({
    data: {
      request: {
        amount,
        tenor: request.no_of_months,
        product_id: 30002,
      },
      profile: {
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        date_of_birth: customer.date_of_birth,
        profile_image: '',
      },
      home_address: {
        address: customer.address,
        state_id: customer.state,
        lga_id: customer.lga
      },
      request_id: request.creditclan_request_id,
      config: {
        show_picture: true,
        show_accounts: true,
        show_work_information: true,
        platform: 'shop-merchant',
        show_signature: true,
      },
      extra: {
        merchant_id: merchant.id,
        merchant_request_id: request.id,
      },
      plans,
    },
    onReady: () => {
      loading.value = '';
    },
    onClose: () => {
      handleWidgetClose();
    },
    onCancel: () => {
      handleWidgetClose();
    },
    onCompleted: () => {
      handleWidgetClose();
    }
  });
  widget.value.open();
});

const handleWidgetClose = () => {
  emit('close');
  qc.invalidateQueries(['request']);
};
</script>

<template>
  <v-card class="pa-0" elevation="0">
    <v-card-text class="px-6 py-6">
      <div class="py-16 text-center">
        <br><br><br>
        <v-progress-circular indeterminate size="25"></v-progress-circular>
        <p class="mx-auto mt-10 text-body-1" style="max-width: 300px">
          {{ loading || 'Please wait..' }}
        </p>
        <br><br><br>
      </div>
    </v-card-text>
  </v-card>
</template>
