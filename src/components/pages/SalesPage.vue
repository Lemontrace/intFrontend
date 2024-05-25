<script setup>
import router from '@/router';
import { ref } from 'vue';

const sales = ref([]);

function fetchSales() {
    fetch('/api/sale', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then((res) => {
        if (!res.ok) {
            if (res.status === 401) {
                alert('로그인이 필요합니다.');
                router.push('/');
                return;
            }
            alert('영업 정보를 가져오는데 실패했습니다');
        } else {
            res.json().then((data) => {
                sales.value = data;
            })
        }
    })
}

fetchSales();

function onDisplayInstallationForm(saleId) {
    router.push(`/installationForm/${saleId}`);
}
</script>

<template>
    <div style="display: flex;align-items: center;">
        <h1>영업 목록</h1>
    </div>
    <table>
        <thead>
            <tr>
                <th>고객번호</th>
                <th>영업자</th>
                <th>금액</th>
                <th>수량</th>
                <th>설치확인서</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="sale in sales" :key="sale.id">
                <td>{{ sale.display_id }}</td>
                <td>{{ sale.seller.name }}</td>
                <td>{{ sale.product_sales.reduce((memo, product_sale) => memo + product_sale.count * product_sale.product.retail_price, 0) }}</td>
                <td>{{ sale.product_sales.reduce((memo, product_sale) => memo + product_sale.count, 0) }}</td>
                <td><button @click="onDisplayInstallationForm(sale.id)" class="basic-button">프린트</button></td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
h1 {
    margin-bottom: 1rem;
    font-size: 3rem;
    padding: 1rem;
    margin-left: 2%;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: center;
}
</style>