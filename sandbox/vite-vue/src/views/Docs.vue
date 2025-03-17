<template>
  <div class="flex flex-col items-center pt-4 pb-8 px-2 gap-4">
    <h1 class="text-4xl">Docs</h1>
    <div class="card card-bordered rounded-lg bg-base-100 sm:min-w-96">
      <ul class="list bg-base-100 rounded-box shadow-md">
        <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">
          You should see only one doc here
        </li>

        <li
          v-for="doc of data?.docs"
          class="list-row p-4 flex items-center justify-between"
        >
          <div>
            <div class="text-xs font-semibold opacity-60">{{ doc.id }}</div>
            <div class="text-xs">
              {{ doc.text }}
            </div>
          </div>
          <button @click="changeDoc" class="btn btn-ghost">switch doc</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { db } from "@/db";

const firstDocId = "c0cf9996-89d0-40d3-8068-8f4fefdd43f0";

const secondDocId = "58911734-6d15-4bfa-98ca-432936cb96e3";

const options = ref({ ruleParams: { knownDocId: firstDocId } });

const { data } = db.useQuery({ docs: {} }, options);

function changeDoc() {
  if (options.value.ruleParams.knownDocId === firstDocId) {
    options.value.ruleParams.knownDocId = secondDocId;
  } else {
    options.value.ruleParams.knownDocId = firstDocId;
  }
}
</script>

<style scoped></style>
