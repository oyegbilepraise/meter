<script setup>
import ConfirmTransferPayment from "@/components/transfer/ConfirmTransferPayment.vue";
import AccountDetails from "@/components/transfer/AccountDetails.vue";
import { useGetVirtualAccountQuery } from "@/lib/api/others.js";
import { ref } from "vue";

const emit = defineEmits(['done', 'cancel']);

const props = defineProps({
  amount: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
});

const view = ref('account');
const { data: account, isLoading: isAccountLoading, retry } = useGetVirtualAccountQuery({
  amount: props.amount, phone: props.phone, full_name: props.name
});

const handleConfirmTransferDone = () => {
  emit('done', account.value.flw_ref);
};
</script>

<template>
  <v-sheet v-if="isAccountLoading" class="d-flex flex-column align-center justify-center text-center">
    <br/><br/><br/>
    <v-progress-circular color="green" indeterminate size="25"></v-progress-circular>
    <p class="mx-auto mt-10 black--text" style="max-width: 300px">
      Please wait..
    </p>
    <br/><br/><br/>
  </v-sheet>
  <template v-else-if="account">
    <v-sheet v-if="view === 'account'" class="pa-0">
      <AccountDetails
        :account="account"
        @confirm="view = 'confirm'"
        @generate="retry()"
        @cancel="emit('cancel')"
      />
    </v-sheet>
    <v-sheet v-if="view === 'confirm'" class="pa-0">
      <ConfirmTransferPayment
        :transaction_reference="account.flw_ref"
        @cancel="view = 'account'"
        @done="handleConfirmTransferDone()"
      />
    </v-sheet>
  </template>
  <v-sheet v-else class="pa-8 d-flex align-center">
    <v-icon class="mr-2">mdi-alert-circle</v-icon>
    <div class="mr-2">Something went wrong</div>
    <v-btn @click="emit('cancel')" text color="red" class="ml-auto">Close</v-btn>
  </v-sheet>
</template>
