<script setup lang="ts">
import { RouterView } from 'vue-router';


</script>

<template>
  <RouterView>
  </RouterView>
</template>

<style scoped>
.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>

<style>
.basic-button {
  padding: 1rem 2rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  height: fit-content;
  width: fit-content;
}

.small-button {
  padding: 10px;
  border: none;
  border-radius: 0.25rem;
  background-color: var(--color-primary);
  color: white;
}

.danger-button {
  background-color:indianred;
}

.page-header {
  display: flex;
  align-items: center;
  height: 12%;
}

.page-content {
  height: 88%;
  overflow-y: auto;
}

:root {
  --color-primary: #9fd3c7;
  --color-secondary: #385170;
}
</style>