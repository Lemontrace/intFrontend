<script setup>
import { ref, reactive, watch } from 'vue';
import Dialog from 'primevue/dialog';

const products = ref([]);
function fetchProducts() {
    fetch('/api/product', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }

    }).then(async (res) => {
        if (!res.ok) {
            alert('제품 정보를 가져오는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            res.json().then((data) => {
                products.value = data.filter(p => p.is_active).sort((a, b) => a.display_order - b.display_order);
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


let installationTypes = ref([]);
function fetchInstallationTypes() {
    return fetch('/api/installation_type', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 유형 정보를 가져오는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            res.json().then((data) => {
                installationTypes.value = data;
            });
        }
    });
}

fetchInstallationTypes();

let isInstallationTypeDialogVisible = ref(false);

let installationTypeName = ref('');

let isProductDialogVisible = ref(false);
let productDialogMode = ref('add');
let editProductId = ref(null);

function openProductDialog(mode, product = null) {
    productDialogMode.value = mode;
    if (mode === 'add') {
        name.value = '';
        retailPrice.value = '';
        category.value = '';
        company_profit.value = '';
        saleCommission.value = '';
        installationCommission.value = '';
        installationTypeId.value = null;
        previousProductId.value = null;
        nextProductId.value = null;
    } else {
        name.value = product.name;
        retailPrice.value = product.retail_price;
        category.value = product.category_id;
        company_profit.value = product.company_profit;
        saleCommission.value = product.sale_commission;
        installationCommission.value = product.installation_commission;
        installationTypeId.value = product.installation_type_id;
        previousProductId.value = product.previous_product?.id ?? null;
        nextProductId.value = product.next_product_id;
    }
    isProductDialogVisible.value = true;
    editProductId.value = product ? product.id : null;
}

function reorderProducts(product, value) {
    let putBehind = product.display_order < value;
    product.display_order = value;
    products.value.sort((a, b) => {
        let value = a.display_order - b.display_order
        if (value === 0) {
            if (a.id === product.id || b.id === product.id)
                if (a.id === product.id) return putBehind ? 1 : -1;
                else return putBehind ? -1 : 1;
        }
        return value
    });
    products.value.forEach((product, index) => {
        product.display_order = index + 1;
    });
    fetch('/api/product/display_order', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify(products.value.map(p => ({
            id: p.id,
            display_order: p.display_order
        })))
    }).then(async (res) => {
        if (!res.ok) {
            alert('제품 표시 순서 변경에 실패했습니다.\nReason : ' + await res.text());
        }
    });
}

function validateProductForm() {
    let isValid = document.getElementById('add-product-form').checkValidity();
    if (!isValid) {
        alert('입력값을 확인해주세요.');
        return false;
    }
    return true;
}

function addInstallationType() {
    if (installationTypeName.value === '') {
        alert('입력값을 확인해주세요.');
        return;
    }
    fetch('/api/installation_type', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            name: installationTypeName.value
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 유형 추가에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchInstallationTypes();
            installationTypeName.value = '';
        }
    });
}

function deleteInstallationType(id) {
    fetch('/api/installation_type/' + id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 유형 삭제에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchInstallationTypes();
        }
    });
}



let name = ref('');
let retailPrice = ref('');
let category = ref('');
let company_profit = ref('');
let installationTypeId = ref('');
let saleCommission = ref('');
let installationCommission = ref('');
let previousProductId = ref(null);
let nextProductId = ref(null);

function fillRelatedProductInfo(productId) {
    let product = products.value.find(p => p.id === productId);
    if (product) {
        retailPrice.value = product.retail_price;
        category.value = product.category_id;
        company_profit.value = product.company_profit;
    }
}


function addProduct() {
    return fetch('/api/product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            name: name.value,
            retail_price: parseInt(retailPrice.value),
            category_id: category.value,
            company_profit: parseInt(company_profit.value),
            installation_type_id: installationTypeId.value,
            sale_commission: parseInt(saleCommission.value),
            installation_commission: parseInt(installationCommission.value),
            previous_product_id: parseInt(previousProductId.value),
            next_product_id: parseInt(nextProductId.value)
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('제품 추가에 실패했습니다.\nReason : ' + await res.text());
        } else {
            isProductDialogVisible.value = false;
            fetchProducts();
        }
    });
}

function editProduct(id) {
    return fetch('/api/product/' + id, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            name: name.value,
            retail_price: parseInt(retailPrice.value),
            category_id: category.value,
            company_profit: parseInt(company_profit.value),
            installation_type_id: installationTypeId.value,
            sale_commission: parseInt(saleCommission.value),
            installation_commission: parseInt(installationCommission.value),
            previous_product_id: previousProductId.value,
            next_product_id: nextProductId.value
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('제품 수정에 실패했습니다.\nReason : ' + await res.text());
        } else {
            isProductDialogVisible.value = false;
            fetchProducts();
        }
    });
}

function deleteProduct(id) {
    return fetch('/api/product/' + id, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        if (!res.ok) {
            alert('제품 삭제에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchProducts();
        }
    });
}
</script>

<template>
    <div class="page-header">
        <h1>제품 관리</h1>
        <div class="button-div">
            <button @click="isInstallationTypeDialogVisible = true" class="basic-button" id="add-installation-type">설치
                유형 관리</button>
            <div style="width: 16px;"></div>
            <button @click="openProductDialog('add')" class="basic-button" id="add-product">제품 추가</button>
        </div>
    </div>
    <div class="page-content">
        <table id="table1">
            <thead style="position: sticky;">
                <tr>
                    <th>제품명</th>
                    <th>표시순서</th>
                    <th>판매가</th>
                    <th>영업수당</th>
                    <th>설치수당</th>
                    <th>회사이익</th>
                    <th>분류</th>
                    <th>설치유형</th>
                    <th>다음단계상품</th>
                    <th>수정</th>
                    <th>삭제</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in products" :key="product.id">
                    <td>{{ product.name }}</td>
                    <td style="width: 6rem;"><input @keydown="(ev) => { if (ev.key === 'Enter') ev.target.blur() }"
                            @blur="reorderProducts(product, $event.target.value)" type="text"
                            :value="product.display_order"></td>
                    <td>{{ product.retail_price }}</td>
                    <td>{{ product.sale_commission }}</td>
                    <td>{{ product.installation_commission }}</td>
                    <td>{{ product.company_profit }}</td>
                    <td>{{ product.category.name }}</td>
                    <td>{{ product.installation_type.name }}</td>
                    <td>{{ product.next_product?.name ?? '(없음)' }}</td>
                    <td><button style="width: 3rem;" class="small-button"
                            @click="openProductDialog('edit', product)">수정</button></td>
                    <td><button style="width: 3rem;" class="small-button danger-button" @click="deleteProduct(product.id)">삭제</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <Dialog v-model:visible="isProductDialogVisible" style="width: 25em;">
        <template #header>
            <h2 style="text-align: center;width: 100%;">{{ productDialogMode === 'add' ? '제품 추가' : '제품 수정' }}</h2>
        </template>
        <form id="add-product-form">
            <label for="name">제품명</label>
            <input v-model="name" type="text" id="name" name="name" required>
            <label for="retail_price">판매가</label>
            <input v-model="retailPrice" type="text" pattern="[0-9]+" id="retail_price" name="retail_price" required>
            <label for="company_profit">회사이익</label>
            <input v-model="company_profit" type="text" pattern="[0-9]+" id="company_profit" name="company_profit"
                required>
            <label for="category">분류</label>
            <select v-model="category" id="category" required>
                <option v-for="category in categories" :value="category.id">{{ category.name }}</option>
            </select>
            <label for="installation_type">설치 유형</label>
            <select v-model="installationTypeId" id="installation_type" required>
                <option v-for="installationType in installationTypes" :value="installationType.id">
                    {{ installationType.name }}
                </option>
            </select>
            <label for="sale_commission">영업 수당</label>
            <input v-model="saleCommission" type="text" pattern="[0-9]+" id="sale_commission" name="sale_commission"
                required>
            <label for="installation_commission"> 설치 수당</label>
            <input v-model="installationCommission" type="text" pattern="[0-9]+" id="installation_commission"
                name="installation_commission" required>
            <label for="previous_product"> 이전 단계 상품</label>
            <select v-model="previousProductId" id="previous_product" @change="fillRelatedProductInfo(parseInt($event.target.value))">
                <option :value="null">(없음)</option>
                <option v-for="product in products.filter(product => product.id !== editProductId)" :value="product.id">
                    {{ product.name }}
                </option>
            </select>
            <label for="next_product"> 다음 단계 상품</label>
            <select v-model="nextProductId" id="next_product" @change="fillRelatedProductInfo(parseInt($event.target.value))">
                <option :value="null">(없음)</option>
                <option v-for="product in products.filter(product => product.id !== editProductId)" :value="product.id">
                    {{ product.name }}
                </option>
            </select>
        </form>
        <template #footer>
            <button class="basic-button"
                @click="if (validateProductForm()) productDialogMode === 'add' ? addProduct() : editProduct(editProductId);">{{
                    productDialogMode === 'add' ? '추가' : '수정' }}</button>
        </template>
    </Dialog>

    <Dialog v-model:visible="isInstallationTypeDialogVisible">
        <template #header>
            <h2 style="text-align: center;width: 100%;">설치 유형 관리</h2>
        </template>
        <table>
            <thead>
                <th>이름</th>
                <th>삭제/저장</th>
            </thead>
            <tbody>
                <tr v-for="installationType in installationTypes" :key="installationType.id">
                    <td>{{ installationType.name }}</td>
                    <td>
                        <button class="small-button danger-button" @click="deleteInstallationType(installationType.id)">삭제</button>
                    </td>
                </tr>
                <tr>
                    <td><input type="text" v-model="installationTypeName" id="installation-type-name" required></td>
                    <td><button class="small-button" @click="addInstallationType">저장</button></td>
                </tr>
            </tbody>
        </table>
        <template #footer>
            <button class="basic-button" @click="isInstallationTypeDialogVisible = false">닫기</button>
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
    position: absolute;
    display: flex;
    right: 2%;
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

input:invalid,
select:invalid {
    border-color: red;
}

input[type="checkbox"] {
    width: auto;
}

input#is_active {
    margin-left: 1rem;
}
</style>