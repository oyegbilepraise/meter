<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import { useStore } from "@/stores/store.ts";
import { roundToNearestTen } from "@/lib/utils.js";
import { useUpdatePlanMutation } from "@/lib/api/others.js";
import { useQueryClient } from "@tanstack/vue-query";
import { ref } from "vue";

const emit = defineEmits(['launch', 'close']);

const store = useStore();
const qc = useQueryClient();
const isRefreshing = ref(false);
const colors = ['blue', 'teal', 'purple', 'green', 'red'];
const { mutateAsync: updatePlan, isLoading: isUpdatePlanLoading } = useUpdatePlanMutation();

const handleMonthly = async (duration) => {
  try {
    const interest = 7;
    const markup = 5;
    const percent = (duration * interest) + markup;
    const promises = store.request.items.map(async item => {
      const total = roundToNearestTen(+item.price + ((percent / 100) * +item.price));
      let monthly = roundToNearestTen(total / duration);
      const plan = {
        total,
        percent,
        duration,
        monthly,
        items: [],
        markup,
        interest,
        id: 1,
        label: "basic",
        gross_net: 0,
        percent_net: 0,
        monthly_net: 0,
      };
      return updatePlan({ item_request_id: item.item_plan.id, plan });
    });
    isRefreshing.value = true;
    await Promise.all(promises);
    await qc.invalidateQueries(['request']);
    emit('launch', 'details');
    isRefreshing.value = false;
  } catch (e) {
    console.log(e);
  }
};

const handleOutright = async () => {
  const promises = store.request.items.map(async item => {
    const commission = .5;
    const outright = roundToNearestTen(+item.price + ((commission / 100) * +item.price));
    const plan = { outright };
    return updatePlan({ item_request_id: item.item_plan.id, plan });
  });
  await Promise.all(promises);
  isRefreshing.value = true;
  await qc.invalidateQueries(['request']);
  emit('launch', 'pay');
  isRefreshing.value = false;
};
</script>

<template>
  <v-card v-if="(isUpdatePlanLoading || isRefreshing)" class="pa-0" elevation="0">
    <v-card-text class="px-6 py-6">
      <div class="py-16 text-center">
        <br><br><br>
        <v-progress-circular indeterminate size="25"></v-progress-circular>
        <p class="mx-auto mt-10 text-body-1" style="max-width: 300px">
          Saving your plan..
        </p>
        <br><br><br>
      </div>
    </v-card-text>
  </v-card>
  <div v-else class="pa-8">
    <div class="d-flex align-center justify-space-between mb-8">
      <h3>Select a plan</h3>
      <v-btn @click="emit('close')" icon variant="outlined" color="red" size="x-small">
        <v-icon icon="mdi-close" size="20"/>
      </v-btn>
    </div>
    <div class="mt-8">
      <Swiper :slides-per-view="1.2" :space-between="15">
        <SwiperSlide>
          <v-card class="d-flex flex-column pb-4 pt-6 rounded-lg" min-height="200px" :color="colors[3]">
            <v-card-title class="font-weight-bold d-flex align-center white--text px-8 py-0">
              Make full payment
            </v-card-title>
            <v-divider class="my-6"></v-divider>
            <p class="px-8 pb-8">Click the button below to select this plan</p>
            <v-card-actions class="px-8 mt-8 mt-auto">
              <v-btn
                @click="handleOutright()" :disabled="isUpdatePlanLoading" variant="flat" color="white" elevation="0"
                block class="d-flex justify-space-between px-6" rounded append-icon="mdi-arrow-right"
              >
                Select
              </v-btn>
            </v-card-actions>
          </v-card>
        </SwiperSlide>
        <SwiperSlide v-for="(n, i) of [2,3,6]" :key="n">
          <v-card class="d-flex flex-column pb-4 pt-6 rounded-lg" min-height="200px" :color="colors[i]">
            <v-card-title class="font-weight-bold d-flex align-center white--text px-8 py-0">
              Pay over {{ n }} months
            </v-card-title>
            <v-divider class="my-6"></v-divider>
            <p class="px-8 pb-8">Click the button below to select this plan</p>
            <v-card-actions class="px-8 mt-8 mt-auto">
              <v-btn
                @click="handleMonthly(n)" :disabled="isUpdatePlanLoading" variant="flat" color="white" elevation="0"
                block class="d-flex justify-space-between px-6" rounded append-icon="mdi-arrow-right"
              >
                Select
              </v-btn>
            </v-card-actions>
          </v-card>
        </SwiperSlide>
        <SwiperSlide>
          <v-card class="d-flex flex-column pb-4 pt-6 rounded-lg" min-height="200px" :color="colors[4]">
            <v-card-title class="font-weight-bold d-flex align-center white--text px-8 py-0">
              Pay on delivery
            </v-card-title>
            <v-divider class="my-6"></v-divider>
            <p class="px-8 pb-8">Click the button below to select this plan</p>
            <v-card-actions class="px-8 mt-8 mt-auto">
              <v-btn
                variant="outlined" color="white" elevation="0" block class="d-flex justify-space-between px-6" rounded
                disabled append-icon="mdi-arrow-right"
              >
                Select
                <v-icon class="ml-4">mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>
