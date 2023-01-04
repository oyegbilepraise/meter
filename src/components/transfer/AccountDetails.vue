<script setup>
import { onBeforeMount, onBeforeUnmount, reactive, ref } from "vue";
import { formatCurrency } from "@/lib/utils.js";

const emit = defineEmits(['generate', 'cancel', 'confirm'])

const props = defineProps({
  account: {
    type: Object,
    required: true,
  },
});

const timer = reactive({ days: 0, hours: 0, minutes: 0, seconds: 0, });
const expired = ref(false);
let interval = null;

onBeforeMount(() => {
  startTimer();
});

onBeforeUnmount(() => {
  clearTimer();
});

const countdown = () => {
  expired.value = false;
  const future = new Date(props.account.expiry_date);
  const now = new Date(Date.now());
  if (future < now) {
    timer.days = 0;
    timer.hours = 0;
    timer.minutes = 0;
    timer.seconds = 0;
    expired.value = true;
    return clearTimer();
  }
  const diff = future - now;
  timer.days = Math.floor(diff / (1000 * 60 * 60 * 24));
  timer.hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  timer.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  timer.seconds = Math.floor((diff % (1000 * 60)) / 1000);
};

const startTimer = () => {
  countdown();
  interval = setInterval(() => countdown(), 1000);
};

const clearTimer = () => {
  if (interval) clearInterval(interval);
};
</script>

<template>
  <div>
    <div class="px-8 pt-10 pb-5 white border-bottom">
      <div class="text-h5 font-weight-medium">Make payment</div>
      <p class="mt-2 mb-0 black--text">
        Kindly transfer exactly <span class="font-weight-bold">{{ formatCurrency(props.account.amount) }}</span> in the
        account below
      </p>
    </div>
    <div v-if="props.account.amount" class="px-8 pb-8 pt-4">
      <v-list class="transparent" :class="{ 'disabled': expired }">
        <v-list-item class="pa-0">
          <v-list-item-title class="d-flex justify-space-between align-center">
            <span class="text--secondary">Merchant name</span>
            <span class="font-weight-medium">{{ props.account.merchant_name }}</span>
          </v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item class="pa-0">
          <v-list-item-title class="d-flex justify-space-between align-center">
            <span class="text--secondary">Bank</span>
            <span class="font-weight-medium">{{ props.account.bank_name }}</span>
          </v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item class="pa-0">
          <v-list-item-title class="d-flex justify-space-between align-center">
            <span class="text--secondary">Account number</span>
            <span class="font-weight-medium">{{ props.account.account_number }}</span>
          </v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item class="pa-0">
          <v-list-item-title class="d-flex justify-space-between align-center">
            <div class="text--secondary">Expires in</div>
            <div v-if="!expired" class="font-weight-medium">
              {{ timer.hours }} : {{ timer.minutes }} : {{ timer.seconds }}
            </div>
            <div v-else class="red--text">
              <v-icon class="mr-1" color="red">mdi-alert-circle</v-icon>
              Expired
            </div>
          </v-list-item-title>
        </v-list-item>
      </v-list>
      <div class="mt-10 d-flex align-center">
        <v-btn color="red" variant="outlined" rounded @click="emit('cancel')">Cancel</v-btn>
        <v-btn v-if="!expired" color="green" elevation="0" rounded @click="emit('confirm')" class="ml-2">
          Confirm transfer
        </v-btn>
        <v-btn v-else color="green" elevation="0" rounded @click="emit('generate')" class="ml-2">
          <v-icon class="mr-2">mdi-refresh</v-icon>
          Get new account
        </v-btn>
      </div>
    </div>
  </div>
</template>
