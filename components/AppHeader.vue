<script setup lang="ts">
import { computed } from 'vue'

import { useRoute } from '#app'

import AppIcon from './AppIcon.vue'

const route = useRoute()
const isEditor = computed(() => route.path.startsWith('/notes/'))
</script>

<template>
  <header class="site-header">
    <div class="page-container header-inner">
      <NuxtLink class="brand" to="/" aria-label="Note Space — на главную">
        <img class="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
        <span class="brand-copy">
          <strong>Note Space</strong>
          <span>рабочие списки</span>
        </span>
      </NuxtLink>

      <div class="header-context">
        <span class="header-kicker">{{ isEditor ? 'редактор' : 'рабочее пространство' }}</span>
      </div>

      <NuxtLink v-if="!isEditor" class="button button-dark header-action" to="/notes/new">
        <AppIcon name="plus" :size="17" />
        <span>Новая заметка</span>
      </NuxtLink>
      <NuxtLink v-else class="header-back-link" to="/">
        <AppIcon name="arrow-left" :size="17" />
        <span>Все заметки</span>
      </NuxtLink>
    </div>
  </header>
</template>
