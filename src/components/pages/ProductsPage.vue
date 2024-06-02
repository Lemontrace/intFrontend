<script setup>
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';

let products = ref([]);
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
                products.value = data.filter(p => p.is_active);
                productForCommissionDialog.value = products.value.find(p => p.id === productForCommissionDialog.value?.id)
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
        retail_price.value = '';
        category.value = '';
        company_profit.value = '';
    } else {
        name.value = product.name;
        retail_price.value = product.retail_price;
        category.value = product.category_id;
        company_profit.value = product.company_profit;
    }
    isProductDialogVisible.value = true;
    editProductId.value = product ? product.id : null;
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
let retail_price = ref('');
let category = ref('');
let company_profit = ref('');


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
            category_id: category.value
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
            retail_price: parseInt(retail_price.value),
            category_id: category.value,
            company_profit: parseInt(company_profit.value)
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

let isCommissionDialogVisible = ref(false);

let commission_type_id = ref(null);
let commission_installation_amount = ref(null);
let commission_sale_amount = ref(null);

let productForCommissionDialog = ref(null);


function openCommissionDialog(product) {
    productForCommissionDialog.value = product;
    isCommissionDialogVisible.value = true;
}

function addCommission() {
    return fetch(`/api/product/${productForCommissionDialog.value.id}/commission/${commission_type_id.value}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            sale_commission: parseInt(commission_sale_amount.value),
            installation_commission: parseInt(commission_installation_amount.value),
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('수당 추가에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchProducts();
            commission_type_id.value = null;
            commission_sale_amount.value = null;
            commission_installation_amount.value = null;
        }
    });
}

function editCommission(productId, installationTypeId, saleCommission, installationCommission) {
    return fetch(`/api/product/${productId}/commission/${installationTypeId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            sale_commission: saleCommission,
            installation_commission: installationCommission,
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('수당 수정에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchProducts();
        }
    });
}

function deleteCommission(productId, installationTypeId) {
    return fetch(`/api/product/${productId}/commission/${installationTypeId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        if (!res.ok) {
            alert('수당 삭제에 실패했습니다.\nReason : ' + await res.text());
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
            <button @click="isInstallationTypeDialogVisible=true" class="basic-button" id="add-installation-type">설치
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
                    <th>순서</th>
                    <th>판매가</th>
                    <th>회사이익</th>
                    <th>분류</th>
                    <th>수당관리</th>
                    <th>수정</th>
                    <th>삭제</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in products" :key="product.id">
                    <td>{{ product.name }}</td>
                    <td>{{ product.display_order }}</td>
                    <td>{{ product.retail_price }}</td>
                    <td>{{ product.company_profit }}</td>
                    <td>{{ product.category.name }}</td>
                    <td>
                        <button style="width: 6em;" class="small-button" @click="openCommissionDialog(product)">수당
                            관리</button>
                    </td>
                    <td><button style="width: 3rem;" class="small-button"
                            @click="openProductDialog('edit', product)">수정</button></td>
                    <td><button style="width: 3rem;" class="small-button" @click="deleteProduct(product.id)">삭제</button>
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
            <input v-model="retail_price" type="text" pattern="[0-9]+" id="retail_price" name="retail_price" required>
            <label for="company_profit">회사이익</label>
            <input v-model="company_profit" type="text" pattern="[0-9]+" id="company_profit" name="company_profit" required>
            <label for="category">분류</label>
            <select v-model="category" id="category" required>
                <option v-for="category in categories" :value="category.id">{{ category.name }}</option>
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
                        <button class="small-button" @click="deleteInstallationType(installationType.id)">삭제</button>
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

    <Dialog v-model:visible="isCommissionDialogVisible">
        <template #header>
            <h2 style="display:block;text-align: center;width: 100%;">수당 관리(품목명 : {{ productForCommissionDialog.name
                }})</h2>
        </template>
        <table>
            <thead>
                <th>유형</th>
                <th>영업수당</th>
                <th>설치수당</th>
                <th>삭제/저장</th>
            </thead>
            <tbody>
                <tr v-for="(installationCommission, index) in productForCommissionDialog.installation_commission.filter(ic => ic.is_active)"
                    :key="index">
                    <td>{{ installationCommission.installation_type.name }}</td>
                    <td><input type="text" :value="productForCommissionDialog.sale_commission[index]?.amount" disabled>
                    </td>
                    <td><input type="text" :value="installationCommission.amount" disabled></td>
                    <td>
                        <button class="small-button"
                            @click="deleteCommission(productForCommissionDialog.id, installationCommission.installation_type.id)">삭제</button>
                    </td>
                </tr>
                <tr>
                    <td>
                        <select v-model="commission_type_id">
                            <option v-for="installationType in installationTypes" :value="installationType.id">
                                {{ installationType.name }}
                            </option>
                        </select>
                    </td>
                    <td><input type="text" v-model="commission_sale_amount"></td>
                    <td><input type="text" v-model="commission_installation_amount"></td>
                    <td><button class="small-button" @click="addCommission">저장</button></td>
                </tr>
            </tbody>
        </table>
        <template #footer>
            <button class="basic-button" @click="isCommissionDialogVisible = false">닫기</button>
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