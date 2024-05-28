<script setup>
import { ref } from 'vue';
import Dialog from 'primevue/dialog';

let products = ref([]);
function fetchProducts() {
    fetch('/api/product',{
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    
    }).then(async (res) => {
        if (!res.ok) {
            alert('제품 정보를 가져오는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            res.json().then((data) => {
                products.value = data;
            });
        }
    });
}

fetchProducts();

let categories = ref([]);
function fetchCategories() {
    return fetch('/api/category', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        if (!res.ok) {
            alert('카테고리 정보를 가져오는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            res.json().then((data) => {
                categories.value = data;
            });
        }
    });
}

fetchCategories();

let isAddProductDialogVisible = ref(false);

function onAddProductClick() {
    let isValid = document.getElementById('add-product-form').checkValidity();
    if (!isValid) {
        alert('입력값을 확인해주세요.');
        return;
    }
    addProduct();
}

let name = ref('');
let retail_price = ref('');
let sales_commission = ref('');
let category = ref('');
let service_type = ref('');
let installation_commission = ref('');
let collection_commission = ref('');
let delivery_commission = ref('');
let is_active = ref(false);


function addProduct() {
    return fetch('/api/product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            name: name.value,
            retail_price: parseInt(retail_price.value),
            sales_commission: parseInt(sales_commission.value),
            category_id: category.value,
            service_type: service_type.value,
            installation_commission: service_type.value === '설치' ? parseInt(installation_commission.value) : null,
            collection_commission: service_type.value === '회수선출' ? parseInt(collection_commission.value) : null,
            delivery_commission: service_type.value === '회수선출' ? parseInt(delivery_commission.value) : null,
            is_active: is_active.value,
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('제품 추가에 실패했습니다.\nReason : ' + await res.text());
        } else {
            isAddProductDialogVisible.value = false;
            fetchProducts();
        }
    });
}

function onProductActivenessChange(event, id) {
    return fetch('/api/product/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({
            is_active: event.target.checked
        })
    }).then(async (res) => {
        if (!res.ok) {
            alert('제품 사용 여부 변경에 실패했습니다.\nReason : ' + await res.text());
        }
    });

}
</script>

<template>
    <div style="display: flex;align-items: center;">
        <h1>제품 관리</h1>
        <button @click="isAddProductDialogVisible = true" class="basic-button" id="add-product">제품 추가</button>
    </div>
    <table>
        <thead>
            <tr>
                <th>제품명</th>
                <th>판매가</th>
                <th>영업수당</th>
                <th>분류</th>
                <th>설치 분류</th>
                <th>설치수당</th>
                <th>회수수당</th>
                <th>선출수당</th>
                <th>사용중</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="product in products" :key="product.id">
                <td>{{ product.name }}</td>
                <td>{{ product.retail_price }}</td>
                <td>{{ product.sales_commission }}</td>
                <td>{{ product.category.name }}</td>
                <td>{{ product.service_type }}</td>
                <td>{{ product.installation_commission }}</td>
                <td>{{ product.collection_commission }}</td>
                <td>{{ product.delivery_commission }}</td>
                <td><input @change="onProductActivenessChange($event,product.id)" type="checkbox" :checked="product.is_active"></td>
            </tr>
        </tbody>
    </table>

    <Dialog v-model:visible="isAddProductDialogVisible" style="width: 25em;">
        <template #header>
            <h2 style="text-align: center;width: 100%;">제품 추가</h2>
        </template>
        <form id="add-product-form">
            <label for="name">제품명</label>
            <input v-model="name" type="text" id="name" name="name" required>
            <label for="retail_price">판매가</label>
            <input v-model="retail_price" type="text" pattern="[0-9]+" id="retail_price" name="retail_price" required>
            <label for="sales_commission">영업수당</label>
            <input v-model="sales_commission" type="text" pattern="[0-9]+" id="sales_commission" name="sales_commission" required>
            <label for="category">분류</label>
            <select v-model="category" id="category" required>
                <option v-for="category in categories" :value="category.id">{{ category.name }}</option>
            </select>
            <label for="service_type">설치 분류</label>
            <select v-model="service_type" id="service_type" required>
                <option value="설치">설치</option>
                <option value="회수선출">회수선출</option>
            </select>
            <label for="installation_commission">설치수당</label>
            <input v-model="installation_commission" :disabled="service_type !== '설치'" type="text" pattern="[0-9]+" id="installation_commission" name="installation_commission" required>
            <label for="collection_commission">회수수당</label>
            <input v-model="collection_commission" :disabled="service_type !== '회수선출'" type="text" pattern="[0-9]+" id="collection_commission" name="collection_commission" required>
            <label for="delivery_commission">선출수당</label>
            <input v-model="delivery_commission" :disabled="service_type !== '회수선출'" type="text" pattern="[0-9]+" id="delivery_commission" name="delivery_commission" required>
            <label for="is_active">사용중</label>
            <input v-model="is_active" type="checkbox" id="is_active" name="is_active">
        </form>
        <template #footer>
            <button class="basic-button" @click="onAddProductClick">추가</button>
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

#add-product {
    position: absolute;
    right: 2%;
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

input,select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    width: 100%;
}

select {
    background-color: white;
}

input:invalid,select:invalid {
    border-color: red;
}

input[type="checkbox"] {
    width: auto;
}

input#is_active {
    margin-left: 1rem;
}
</style>