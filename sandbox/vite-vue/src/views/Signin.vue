<template>
  <div class="flex flex-col items-center pt-4 pb-8 px-2 gap-4">
    <h1 class="text-4xl">{{ title }}</h1>
    <div class="card card-bordered">
      <div class="card-body">
        <form
          v-if="!emailSent"
          class="flex flex-col gap-4"
          @submit="handleSigninSubmit"
        >
          <span>Let's log you in!</span>
          <label class="input input-bordered flex items-center gap-2">
            <span aria-hidden="true" class="icon-[mdi--email-outline]"></span>
            <input
              v-model="email"
              type="email"
              class="grow"
              placeholder="Email"
              required
            />
          </label>
          <button type="submit" class="self-end btn">{{ title }}</button>
        </form>
        <form v-else class="flex flex-col gap-4" @submit="handleCodeSubmit">
          <span>Okay, we sent you an email at {{ email }}!</span
          ><span>What was the code?</span>
          <label class="input input-bordered flex items-center gap-2">
            <span aria-hidden="true" class="icon-[mdi--key-variant]"></span>
            <input
              v-model="code"
              type="text"
              class="grow"
              placeholder="Code"
              required
            />
          </label>
          <button type="submit" class="self-end btn">
            <span v-if="isLoading" class="loading loading-spinner"></span>Verify
          </button>
        </form>
      </div>
      <div
        v-if="error"
        ref="alert-error"
        role="alert"
        class="alert alert-error rounded-lg rounded-tl-none rounded-tr-none"
      >
        <span
          aria-hidden="true"
          class="icon-[mdi--error-outline] text-2xl"
        ></span>

        <span>Error! {{ error || "unknown error." }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, useTemplateRef } from "vue";
import { db } from "@/db";
import { useRouter } from "vue-router";

const router = useRouter();

const title = "Sign in";

const email = ref("");
const code = ref("");
const error = ref("");
const emailSent = ref(false);
const isLoading = ref(false);
async function handleSigninSubmit(e: Event) {
  e.preventDefault();
  if (!email.value || emailSent.value) {
    return;
  }
  emailSent.value = true;
  error.value = "";
  try {
    await db.auth.sendMagicCode({ email: email.value });
    emailSent.value = true;
  } catch (err) {
    //@ts-ignore TODO!
    error.value = err?.body?.message || "Unknown error.";
    emailSent.value = false;
  }
}
async function handleCodeSubmit(e: Event) {
  e.preventDefault();
  if (!code.value || isLoading.value) {
    return;
  }
  emailSent.value = true;
  error.value = "";
  isLoading.value = true;
  try {
    await db.auth.signInWithMagicCode({ email: email.value, code: code.value });
    emailSent.value = true;
  } catch (err) {
    //@ts-ignore TODO!
    error.value = err?.body?.message || "Unknown error.";
    code.value = "";
    isLoading.value = false;
  }
}

const alertError = useTemplateRef("alert-error");
watchEffect(() => {
  if (error.value && alertError.value) {
    alertError.value?.scrollIntoView();
  }
});

const { user } = db.useAuth();
watchEffect(() => {
  if (user.value) {
    router.push("/");
  }
});
</script>
