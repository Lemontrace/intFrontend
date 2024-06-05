<script setup>
import { reactive, ref } from 'vue';
import Dialog from 'primevue/dialog';

const paymentTypes = ref([]);

function fetchPaymentTypes() {
    fetch('/api/payment_type', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        if (!res.ok) {
            alert('결제유형 정보를 가져오는데 실패했습니다\nReason: ' + await res.text());
        } else {
            res.json().then((data) => {
                paymentTypes.value = data.filter((paymentType) => paymentType.is_active);
            })
        }
    })
}
fetchPaymentTypes()

const isPaymentTypePopupOpen = ref(false);

const paymentTypePopupState = reactive({
    paymentTypeName: '',
    paymentTypeIsInstantlyArrived: false,
});

function addPaymentType() {
    fetch('/api/payment_type', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            name: paymentTypePopupState.paymentTypeName,
            is_instantly_arrived: paymentTypePopupState.paymentTypeIsInstantlyArrived,
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('결제유형 추가에 실패했습니다\nReason: ' + await res.text());
        } else {
            fetchPaymentTypes();
            paymentTypePopupState.paymentTypeName = '';
            paymentTypePopupState.paymentTypeIsInstantlyArrived = false;
        }
    })
}

function deletePaymentType(paymentTypeId) {
    fetch(`/api/payment_type/${paymentTypeId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        if (!res.ok) {
            alert('결제유형 삭제에 실패했습니다\nReason: ' + await res.text());
        } else {
            fetchPaymentTypes();
        }
    })
}

</script>

<template>
    <div style="position:fixed;display: flex; width: 100%; height: 100%;">
        <div class="sidebar">
            <router-link to="/admin/users">사용자 관리</router-link>
            <router-link to="/admin/products">제품 관리</router-link>
            <router-link to="/admin/categories">카테고리 관리</router-link>
            <router-link to="/admin/sales">영업 목록</router-link>
            <router-link to="/admin/installations">설치 목록</router-link>
            <button class="sidebar-button" @click="isPaymentTypePopupOpen = true">결제유형 관리(팝업)</button>
        </div>
        <div class="content">
            <router-view></router-view>
        </div>
        <Dialog v-model:visible="isPaymentTypePopupOpen">
            <template #header>
                <h2 style="text-align: center;width: 100%;">결제유형 관리</h2>
            </template>
            <table>
                <thead>
                    <tr>
                        <th>이름</th>
                        <th>즉시도착</th>
                        <th>삭제/추가</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="paymentType in paymentTypes" :key="paymentType.id">
                        <td>{{ paymentType.name }}</td>
                        <td><input type="checkbox" disabled :checked="paymentType.is_instantly_arrived"></td>
                        <td><button class="small-button danger-button" @click="deletePaymentType(paymentType.id)">삭제</button></td>
                    </tr>
                    <tr>
                        <td><input type="text" v-model="paymentTypePopupState.paymentTypeName"></td>
                        <td><input type="checkbox" v-model="paymentTypePopupState.paymentTypeIsInstantlyArrived"></td>
                        <td><button class="small-button" @click="addPaymentType">추가</button></td>
                    </tr>
                </tbody>
            </table>
            <template #footer>
                <button class="small-button" @click="isPaymentTypePopupOpen = false">닫기</button>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.sidebar {
    width: 200px;
    background-color: #f0f0f0;
    padding: 1rem;
    padding-top: 200px;
}

.sidebar a {
    display: block;
    margin-bottom: 1rem;
    text-decoration: none;
    color: black;
}

.sidebar-button {
    background-color: rgba(0, 0, 0, 0);
    border: none;
    cursor: pointer;
    padding: 0;
    font-size: 15px;
}

.content {
    width: calc(100% - 200px);
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

input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    width: 100%;
}
</style>