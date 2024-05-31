<script setup>
import router from '@/router';
import { ref } from 'vue';

const sales = ref([]);
const selected = ref([])

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
                sales.value = data.sort((a, b) => a.is_complete - b.is_complete);
                selected.value = Array(data.length).fill(false);
            })
        }
    })
}

fetchSales();

function onDeleteSale(saleId) {
    fetch(`/api/sale/${saleId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        if (!res.ok) {
            alert('영업 정보를 삭제하는데 실패했습니다\nReason: ' + await res.text());
        } else {
            fetchSales();
        }
    })
}

function onDisplayInstallationForm(saleIdArray) {
    router.push(`/installationFormMultiPage?${saleIdArray.map(e => 'id=' + e).join('&')}`);
}
</script>

<template>
    <div style="display: flex;align-items: center;">
        <h1>영업 목록</h1>
        <button class="basic-button"
            @click="onDisplayInstallationForm(sales.filter((sale, index) => selected[index]).map(sale => sale.id))">설치
            확인서 {{ selected.filter(value => value).length }}개 출력</button>
    </div>
    <table>
        <thead>
            <tr>
                <th><input type="checkbox"
                        @change="selected = selected.map((selected, index) => $event.target.checked && !sales[index].is_complete)">
                </th>
                <th>고객번호</th>
                <th>영업자</th>
                <th>총 금액</th>
                <th>총 수량</th>
                <th>영업수당(예상)</th>
                <th>상태</th>
                <th>삭제</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(sale, index) in sales" :key="sale.id">
                <td><input type="checkbox" @change="selected[index] = $event.target.checked" :checked="selected[index]">
                </td>
                <td>{{ sale.display_id }}</td>
                <td>{{ sale.seller.name }}</td>
                <td>{{ sale.sold_product.reduce((memo, product_sale) => memo + product_sale.total_amount, 0) }}</td>
                <td>{{ sale.sold_product.reduce((memo, product_sale) => memo + product_sale.count, 0) }}</td>
                <td>{{
                    sale.is_afterservice ? 0 :
                    sale.sold_product.reduce((memo, product_sale) => memo +
                        (product_sale.count * product_sale.product.sales_commission * sale.seller.user_rank.commission_rate -
                            (product_sale.product.retail_price * product_sale.count - product_sale.total_amount)), 0)
                }}</td>
                <td>{{ sale.is_afterservice ? 'A/S' : sale.is_new ? '신규' : sale.is_complete ? '완료됨' : '보류됨' }}</td>
                <td><button class="small-button" @click="onDeleteSale(sale.id)">삭제</button></td>
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

th,
td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: center;
}

.basic-button {
    position: absolute;
    right: 2%;
}
</style>