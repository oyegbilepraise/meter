<script setup>
import { useGetUserDetailsQuery } from "@/lib/api/others.js";
import { useStore } from "@/stores/store.ts";
import ProfileForm from "@/components/ProfileForm.vue";
import { ref } from "vue";

const emit = defineEmits(['close']);

const store = useStore();
const view = ref('profile');
const { data, isLoading: isUserDetailsLoading } = useGetUserDetailsQuery({
  data: {
    full_name: store.customer.full_name,
    phone: store.customer.phone,
    email: store.customer.email,
    date_of_birth: store.customer.date_of_birth,
  },
  onSuccess: res => {
    store.$patch({ cc_user: res.data.userData.data });
  }
});
</script>

<template>
  <v-card v-if="isUserDetailsLoading && !store.cc_user" class="pa-0" elevation="0">
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
  <v-container v-else class="pa-8">
    <ProfileForm v-if="view === 'profile'" @done="view = 'success'"/>
    <div v-if="view === 'success'" class="d-flex flex-column justify-center align-center text-center py-12">
      <v-icon size="120" color="green">mdi-check</v-icon>
      <div class="mt-8" style="font-size: 1.2rem; max-width: 350px">
        Your request has been successfully submitted, we will get back to you within 24 hours
      </div>
      <v-btn @click="emit('close')" variant="outlined" rounded class="mt-8">Close</v-btn>
    </div>
  </v-container>
</template>
