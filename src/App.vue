<script setup lang="ts">
</script>

<template>
  <v-app>
    <v-app-bar color="grey-lighten-3" app elevation="2">
      <v-app-bar-title>
        <router-link to="/">
          <v-img
            class="mx-2"
            src="/icon.svg"
            max-height="100"
            max-width="100"
            :aspect-ratio="1/1"
            contain
          ></v-img>
        </router-link>
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid class="fill-height d-flex align-center justify-center pa-4">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <v-footer app color="grey-lighten-3" class="text-center d-flex align-center justify-center">
      <div class="text-center">
        SecQ &copy; {{ new Date().getFullYear() }}
      </div>
    </v-footer>
  </v-app>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 追加: より確実な中央揃え */
.v-main {
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-main .v-container {
  max-width: 100%;
  width: 100%;
}
</style>