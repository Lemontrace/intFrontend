<script setup>
import router from '@/router';
import { computed, ref } from 'vue';

const sales = ref([]);
const searchKeyword = ref('');
const filteredSales = computed(() => sales.value.filter((sale) => sale.customer_name.includes(searchKeyword.value) || sale.display_id.includes(searchKeyword.value)));

const selected = ref([]);

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
                data.forEach((sale) => {
                    sale.total_count = sale.sold_product.reduce((acc, product) => acc + product.count, 0);
                })
                selected.value = new Array(sales.value.length).fill(false);
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
function onDisplayInstallationForm() {
    if (selected.value.filter(value => value).length === 0) {
        alert('선택된 항목이 없습니다.');
        return;
    }
    router.push(`/installationFormMultiPage?${sales.value.filter((_, index) => selected.value[index]).map((e) => 'id=' + encodeURIComponent(e.id)).join('&')}`);
}
</script>

<template>
    <div style="display: flex;align-items: center;" class="page-header">
        <h1>영업 목록</h1>
        <div style="display: flex;position: absolute;right: 2%;">
            <input type="text" style="font-size: medium;" v-model="searchKeyword" placeholder="고객명이나 고객번호로 검색">
            <div style="width: 16px;"></div>
            <button class="basic-button" @click="onDisplayInstallationForm()">설치
                확인서 {{ selected.filter(value => value).length }}개 출력</button>
        </div>
    </div>
    <div class="page-content">
        <table>
            <thead>
                <tr>
                    <th><input type="checkbox"
                            @change="selected = selected.map((value, index) => $event.target.checked && !sales[index].is_complete)">
                    </th>
                    <th>고객번호</th>
                    <th>고객명</th>
                    <th>연락번호</th>
                    <th>고객주소</th>
                    <th>영업자</th>
                    <th>총 수량</th>
                    <th>상태</th>
                    <th>상세보기</th>
                    <th>삭제</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(entry, index) in filteredSales" :key="index">
                    <td><input type="checkbox" @change="selected[index] = $event.target.checked"
                            :checked="selected[index]">
                    </td>
                    <td>{{ entry.display_id }}</td>
                    <td>{{ entry.customer_name }}</td>
                    <td>{{ entry.customer_phone }}</td>
                    <td>{{ entry.customer_address }}</td>
                    <td>{{ entry.seller.name }}</td>
                    <td>{{ entry.total_count }}</td>
                    <td>{{ entry.is_new ? '신규' : entry.is_complete ? '완료' : '진행중' }}</td>
                    <td><button class="small-button"><router-link
                                :to="'/admin/saleEdit/' + entry.id">보기</router-link></button></td>
                    <td><button class="small-button danger-button" @click="onDeleteSale(entry.id)">삭제</button></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
a {
    display: block;
    text-decoration: none;
    color: white;
}

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

th {
    position: sticky;
    top: 0;
    background-color: white;
}
</style>