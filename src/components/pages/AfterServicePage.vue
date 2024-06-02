<script setup>
import { reactive, ref } from 'vue';
import Dialog from 'primevue/dialog';

const categories = ref([]);
const afterServiceProducts = ref([]);
const afterServiceTypes = ref([]);

function fetchCategories() {
    fetch('/api/category', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
    })
        .then(response => response.json())
        .then(data => {
            categories.value = data;
            categories.value.forEach(category => {
                editState[category.id] = reactive({
                    after_service_type_id: null,
                    commission: null
                });
            });
        });
}

fetchCategories();

function fetchAfterServiceProducts() {
    fetch('/api/after_service_product', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
    }).then(response => response.json())
        .then(data => {
            afterServiceProducts.value = data;
        });
}

fetchAfterServiceProducts();

function fetchAfterServiceTypes() {
    fetch('/api/after_service_type', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
    }).then(response => response.json())
        .then(data => {
            afterServiceTypes.value = data;
        });
}

fetchAfterServiceTypes();

const isAfterServiceProductDialogVisible = ref(false);

const editState = reactive({})

function addServiceProduct(category_id) {
    fetch('/api/after_service_product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({
            category_id: category_id,
            after_service_type_id: editState[category_id].after_service_type_id,
            commission: parseInt(editState[category_id].commission)
        })
    }).then(async response => {
        if (response.ok) {
            fetchAfterServiceProducts();
            editState[category_id].after_service_type_id = null;
            editState[category_id].commission = null;
        } else {
            alert('A/S 제품 추가에 실패했습니다.\nReason : ' + await response.text());
        }
    });
}

function deleteAfterServiceProduct(id) {
    fetch('/api/after_service_product/' + id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
    }).then(async response => {
        if (response.ok) {
            fetchAfterServiceProducts();
        } else {
            alert('A/S 제품 삭제에 실패했습니다.\nReason : ' + await response.text());
        }
    });
}

const afterServiceTypeName = ref('');


function addAfterServiceType() {
    fetch('/api/after_service_type', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({
            name: afterServiceTypeName.value
        })
    }).then(response => {
        if (response.ok) {
            fetchAfterServiceTypes();
            isAfterServiceProductDialogVisible.value = false;
        } else {
            alert('A/S 유형 추가에 실패했습니다.\nReason : ' + response.text());
        }
    });
}
</script>

<template>
    <div style="display: flex;align-items: center;">
        <h1>A/S 관리</h1>
        <div class="button-div">
            <button @click="" class="basic-button">A/S 유형 추가</button>
        </div>
    </div>

    <div v-for="category in categories" style="padding: 16px;">
        <h2>{{ category.name }}</h2>
        <div style="padding: 16px; width: 100%;">
            <table style="border: 1px solid #ddd;width: 100%;">
                <tr>
                    <th>A/S유형</th>
                    <th>A/S수당</th>
                    <th>삭제/추가</th>
                </tr>
                <tr v-for="product in afterServiceProducts">
                    <template v-if="product.category_id === category.id">
                        <td>{{ product.after_service_type.name }}</td>
                        <td>{{ product.commission }}</td>
                        <td><button class="small-button" @click="deleteAfterServiceProduct(product.id)">삭제</button></td>
                    </template>
                </tr>
                <tr>
                    <td>
                        <select v-model="editState[category.id].after_service_type_id">
                            <option v-for="afterServiceType in afterServiceTypes" :key="afterServiceType.id"
                                :value="afterServiceType.id">
                                {{ afterServiceType.name }}
                            </option>
                        </select>
                    </td>
                    <td><input type="text" v-model="editState[category.id].commission"></td>
                    <td><button class="small-button" @click="addServiceProduct(category.id)">추가</button></td>
                </tr>
            </table>
        </div>
    </div>

    <Dialog v-model:visible="isAfterServiceProductDialogVisible">
        <template #header>
            <h2 style="text-align: center;width: 100%;">A/S 유형 추가</h2>
        </template>
        <label>
            A/S 유형
            <input type="text" v-model="afterServiceTypeName">
        </label>
        <template #footer>
            <button class="basic-button" @click="isAfterServiceProductDialogVisible = false">취소</button>
            <button class="basic-button" @click="addAfterServiceType">추가</button>
        </template>
    </Dialog>
</template>

<style scoped>
h1 {
    margin-bottom: 1rem;
    font-size: 3rem;
    padding: 1rem;
    margin-left: 2%;
}

.button-div {
    display: flex;
    position: absolute;
    right: 2%;
}

td {
    text-align: center;
    justify-content: center;
}

input,
select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    width: 100%;
}

select {
    background-color: white;
}
</style>