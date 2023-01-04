<script setup>
import SecondsCountdown from "@/components/SecondsCountdown.vue";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useVerifyTransactionMutation } from "@/lib/api/others.js";

const emit = defineEmits(['done', 'cancel'])

const props = defineProps({
  transaction_reference: {
    type: String,
    required: true,
  },
});

let interval = null;
const retries = ref(10);
const { mutateAsync: verifyTransaction } = useVerifyTransactionMutation();

onMounted(() => {
  interval = setInterval(async () => {
    await confirm();
    if (retries.value > 0) retries.value -= 1;
    if (retries.value === 0) {
      clearInterval(interval);
      return emit('cancel');
    }
  }, 5000);
});

onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
});

const confirm = async () => {
  try {
    const data = await verifyTransaction({ transaction_reference: props.transaction_reference });
    if (data.status) {
      if (retries.value === 1) alert(data.status_desc);
    } else {
      retries.value = 0;
      emit('done');
    }
  } catch (e) {
    alert(`Unable to confirm transfer, ensure you've made the transfer and try again`);
  }
};
</script>

<template>
  <v-sheet class="d-flex flex-column align-center justify-center text-center py-16">
    <br><br><br>
    <div class="d-flex align-center">
      <v-progress-circular color="green" indeterminate size="24" class="mr-3"></v-progress-circular>
      <SecondsCountdown/>
    </div>
    <div class="mx-auto mt-6">Confirming your transfer</div>
    <p class="mt-1">
      Any issue? cancel confirmation
      <span @click="emit('cancel')" class="text-red-accent-4 mt-1 cursor-pointer">here</span>
    </p>
    <br><br><br>
  </v-sheet>
</template>
