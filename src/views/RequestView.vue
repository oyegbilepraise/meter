<script setup>
import { formatCurrency } from "@/lib/utils.js";
import Plans from "@/components/Plans.vue";
import EligibilityWidget from "@/components/EligibilityWidget.vue";
import { useConfirmPaymentMutation, useGetMeterDetailsQuery, useGetRequestQuery } from "@/lib/api/others.js";
import { useRoute } from "vue-router";
import { useStore } from "@/stores/store.ts";
import useModals from "@/hooks/use-modals.js";
import MakeTransferPayment from "@/components/transfer/MakeTransferPayment.vue";
import { useQueryClient } from "@tanstack/vue-query";
import { ref } from "vue";
import RequestHeader from "@/components/RequestHeader.vue";
import { useDisplay } from "vuetify";
import CustomerInformationForm from "@/components/CustomerInformationForm.vue";

const { modals, openModal, closeModals } = useModals({
  pay: false,
  plans: false,
  eligibility: false,
  details: false,
});

const route = useRoute();
const store = useStore();
const qc = useQueryClient();
const tab = ref(null);
const display = useDisplay();
const { mutateAsync: confirmPayment } = useConfirmPaymentMutation();
const { data: meter = {}, isLoading: isMeterLoading } = useGetMeterDetailsQuery(route.params.id);
const { isLoading: isRequestLoading } = useGetRequestQuery(route.params.id, {
  onSuccess: res => {
    const { customer, merchant, ...request } = res.request;
    store.$patch({ customer, merchant, request, cc_request: res.cc_request });
  }
});

const handlePaymentDone = async (payment_ref) => {
  closeModals();
  try {
    const { id } = store.request;
    const res = await confirmPayment({ id, payment_ref });
    if (!res.data.status) {
      alert(res.data.message);
      await qc.invalidateQueries(['request']);
    }
  } catch (e) {
    console.log(e);
    alert(e.response.data?.message || e?.message);
  }
};
</script>

<template>
  <main>
    <div v-if="isRequestLoading" class="d-flex align-center justify-center py-12 h-screen">
      <v-progress-circular indeterminate size="24"></v-progress-circular>
      <p class="ml-4">Loading request</p>
    </div>
    <template v-else>
      <RequestHeader/>
      <v-carousel
        :hide-delimiters="store.request.items.length === 1"
        :show-arrows="store.request.items.length > 1"
        height="400"
        hide-delimiter-background
        class="border mx-auto rounded-lg"
        style="max-width: 600px"
      >
        <template v-slot:prev="{ props }">
          <v-btn
            @click="props.onClick"
            icon size="small" variant="tonal" color="black"
          >
            <v-icon icon="mdi-chevron-left" size="24"></v-icon>
          </v-btn>
        </template>
        <template v-slot:next="{ props }">
          <v-btn
            @click="props.onClick"
            icon size="small" variant="tonal" color="black"
          >
            <v-icon icon="mdi-chevron-right" size="24"></v-icon>
          </v-btn>
        </template>
        <v-carousel-item v-for="item in store.request.items" :key="item.id">
          <v-img :src="item.primary_picture" cover/>
        </v-carousel-item>
      </v-carousel>
      <v-container style="max-width: 500px">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="mt-4">
              <h4 class="font-weight-medium">
                {{ store.request.items[0].name }}
              </h4>
            </div>
            <p class="font-weight-medium">{{ formatCurrency(store.itemsTotal) }}</p>
          </div>
          <img src="/images/conlog.png" alt="" style="width: 100px;"/>
        </div>

        <v-btn
          v-if="!store.request.creditclan_request_id"
          @click="openModal('plans')" color="green" block rounded flat class="my-4" size="large"
        >
          Pay later
        </v-btn>
        <div v-else class="mt-4">
          <v-icon color="orange" size="10">mdi-circle</v-icon>
          You request is under review, we will get back to you shortly
        </div>

        <v-tabs v-model="tab" class="mt-4">
          <v-tab value="one">Details</v-tab>
          <v-tab value="two">Installation</v-tab>
        </v-tabs>

        <v-window v-model="tab" class="mt-4">
          <v-window-item value="one">
            <div class="border rounded-lg pa-4 bg-white">
              <p class="font-weight-regular">
                <v-icon icon="mdi-account-outline" size="16"></v-icon>
                {{ store.customer.full_name }}
              </p>
              <p class="font-weight-regular">
                <v-icon icon="mdi-map-marker-outline" size="16"></v-icon>
                {{ store.customer.address }}
              </p>
            </div>
            <div v-if="isMeterLoading" class="mt-4">Loading meter details..</div>
            <v-card v-if="!isMeterLoading && meter" variant="outlined" class="border rounded-lg mt-4 bg-white">
              <p class="d-flex align-center justify-space-between py-1 px-4">
                <span>Account no</span>
                <span>{{ meter.account_number }}</span>
              </p>
              <v-divider/>
              <p class="d-flex align-center justify-space-between py-1 px-4">
                <span>Meter type</span>
                <span>{{ meter.meter_type }}</span>
              </p>
              <v-divider/>
              <p class="d-flex align-center justify-space-between py-1 px-4">
                <span>Payment ref no.</span>
                <span>{{ meter.reference_code }}</span>
              </p>
              <v-divider/>
              <p class="d-flex align-center justify-space-between py-1 px-4">
                <span>Map</span>
                <span>{{ meter.map }}</span>
              </p>
              <v-divider/>
              <p class="d-flex align-center justify-space-between py-1 px-4">
                <span>Amount</span>
                <span>{{ formatCurrency(63061.32) }}</span>
              </p>
              <v-divider/>
              <p class="d-flex align-center justify-space-between py-1 px-4">
                <span>Commission</span>
                <span>0.5%</span>
              </p>
              <v-divider/>
              <p class="d-flex align-center justify-space-between py-1 px-4">
                <span>Amount to be paid</span>
                <span>{{ formatCurrency(63378.22) }}</span>
              </p>
            </v-card>
          </v-window-item>
          <v-window-item value="two">
            <div class="border rounded-lg pa-4 bg-white">
              <ul style="list-style-position: inside">
                <li>5-10 days delivery</li>
                <li>No upfront payment required</li>
                <li>Make first payment on activation</li>
                <li>Lot's of freebies</li>
              </ul>
            </div>
          </v-window-item>
        </v-window>


        <v-navigation-drawer
          v-if="display.mdAndUp" v-model="modals.plans" temporary location="right" width="550" elevation="0"
        >
          <v-sheet>
            <Plans v-if="modals.plans" @launch="openModal($event)" @close="closeModals()"/>
          </v-sheet>
        </v-navigation-drawer>
        <v-dialog v-else v-model="modals.plans" fullscreen>
          <v-sheet>
            <Plans v-if="modals.plans" @launch="openModal($event)" @close="closeModals()"/>
          </v-sheet>
        </v-dialog>

        <v-navigation-drawer
          v-if="display.mdAndUp" v-model="modals.eligibility" temporary location="right" width="550" elevation="0"
        >
          <EligibilityWidget v-if="modals.eligibility" @close="closeModals()"/>
        </v-navigation-drawer>
        <v-dialog v-else v-model="modals.eligibility" fullscreen>
          <EligibilityWidget v-if="modals.eligibility" @close="closeModals()"/>
        </v-dialog>

        <v-navigation-drawer
          v-if="display.mdAndUp" v-model="modals.pay" temporary location="right" width="550" elevation="0"
        >
          <MakeTransferPayment
            v-if="modals.pay"
            :amount="store.plansOutright"
            :name="store.customer.full_name"
            :phone="store.customer.phone"
            @cancel="closeModals()"
            @done="handlePaymentDone($event)"
          />
        </v-navigation-drawer>
        <v-dialog v-else v-model="modals.pay" fullscreen>
          <MakeTransferPayment
            v-if="modals.pay"
            :amount="store.plansOutright"
            :name="store.customer.full_name"
            :phone="store.customer.phone"
            @cancel="closeModals()"
            @done="handlePaymentDone($event)"
          />
        </v-dialog>

        <v-navigation-drawer
          v-if="display.mdAndUp" v-model="modals.details" temporary location="right" width="550" elevation="0"
        >
          <CustomerInformationForm v-if="modals.details" @close="closeModals()"/>
        </v-navigation-drawer>
        <v-dialog v-else v-model="modals.details" fullscreen>
          <CustomerInformationForm v-if="modals.details" @close="closeModals()"/>
        </v-dialog>
      </v-container>
    </template>
  </main>
</template>
