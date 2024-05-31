<script setup>
import { useRoute } from 'vue-router';
import InstallationForm from '@/components/fragments/InstallationForm.vue';

const route = useRoute();

const saleIds = Array.isArray(route.query.id) ? route.query.id : [route.query.id];
console.log(saleIds);
function print() {
    window.print();
}
</script>

<template>
    <button @click="print()" class="basic-button">프린트</button>
    <div>
        <div v-for="saleId in saleIds" :key="saleId">
            <InstallationForm :id="saleId" />
        </div>
        <div class="page-break"></div>
    </div>
</template>

<style scoped>
@media print {
    button {
        display: none;
    }
    .page-break {
        page-break-after: always;
    }
}
</style>