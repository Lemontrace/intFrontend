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
let installationTypeIsAfterservice = ref(false);
let installationTypeIsFreeForCustomer = ref(false);

let isAddProductDialogVisible = ref(false);

function onAddProductClick() {
    let isValid = document.getElementById('add-product-form').checkValidity();
    if (!isValid) {
        alert('입력값을 확인해주세요.');
        return;
    }
    addProduct();
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
            name: installationTypeName.value,
            is_afterservice: installationTypeIsAfterservice.value,
            is_free_for_customer: installationTypeIsAfterservice.value ? installationTypeIsFreeForCustomer.value : undefined,
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 유형 추가에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchInstallationTypes();
            installationTypeName.value = '';
            installationTypeIsAfterservice.value = false;
            installationTypeIsFreeForCustomer.value = false;
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
let sales_commission = ref('');
let category = ref('');
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
            is_active: is_active.value
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

function onProductActivenessChange(event, id) {
    return fetch('/api/product/' + id, {
        method: 'PATCH',
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

let installationCommissions = ref([]);

let isCommissionDialogVisible = ref(false);

watch(isCommissionDialogVisible, (value) => {
    if (!value) {
        fetchProducts();
    }
});

let commission_type_id = ref(null);
let commission_amount = ref(null);

let productForCommissionDialog = ref(null);


function fetchInstallationCommissions(productId) {
    return fetch('/api/installation_commission?product_id=' + productId, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 수당 정보를 가져오는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            res.json().then((data) => {
                installationCommissions.value = data;
            });
        }
    });
}

function openCommissionDialog(product) {
    productForCommissionDialog.value = product;
    fetchInstallationCommissions(product.id);
    isCommissionDialogVisible.value = true;
}

function addInstallationCommission() {
    return fetch('/api/installation_commission', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            product_id: productForCommissionDialog.value.id,
            installation_type_id: commission_type_id.value,
            amount: commission_amount.value,
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 수당 추가에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchInstallationCommissions(productForCommissionDialog.value.id);
            commission_type_id.value = null;
            commission_amount.value = null;
        }
    });
}

function deleteInstallataionCommission(id) {
    return fetch('/api/installation_commission/' + id, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 수당 삭제에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchInstallationCommissions(productForCommissionDialog.value.id);
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
            <button @click="isAddProductDialogVisible = true" class="basic-button" id="add-product">제품 추가</button>
        </div>
    </div>
    <div class="page-content">
        <table id="table1">
            <thead style="position: sticky;">
                <tr>
                    <th>제품명</th>
                    <th>판매가</th>
                    <th>영업수당</th>
                    <th>분류</th>
                    <th>수당/수수료</th>
                    <th>수당관리</th>
                    <th>사용중</th>
                    <th>삭제</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in products" :key="product.id">
                    <td>{{ product.name }}</td>
                    <td>{{ product.retail_price }}</td>
                    <td>{{ product.sales_commission }}</td>
                    <td>{{ product.category.name }}</td>
                    <td>
                        {{ product.installation_commission.map(commission =>
                            (commission.installation_type.is_afterservice ? '(A/S)' : '') +
                            commission.installation_type.name +
                            (commission.installation_type.is_afterservice &&
                                commission.installation_type.is_free_for_customer ?
                                '수수료' : '수당') + ' : ' + commission.amount).join(', ') }}
                    </td>
                    <td>
                        <button style="width: 6em;" class="small-button" @click="openCommissionDialog(product)">수당 관리</button>
                    </td>
                    <td><input @change="onProductActivenessChange($event, product.id)" type="checkbox"
                            :checked="product.is_active"></td>
                    <td><button style="width: 3rem;" class="small-button" @click="deleteProduct(product.id)">삭제</button></td>
                </tr>
            </tbody>
        </table>
    </div>

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
            <input v-model="sales_commission" type="text" pattern="[0-9]+" id="sales_commission" name="sales_commission"
                required>
            <label for="category">분류</label>
            <select v-model="category" id="category" required>
                <option v-for="category in categories" :value="category.id">{{ category.name }}</option>
            </select>
            <label for="is_active">사용중</label>
            <input v-model="is_active" type="checkbox" id="is_active" name="is_active">
        </form>
        <template #footer>
            <button class="basic-button" @click="onAddProductClick">추가</button>
        </template>
    </Dialog>

    <Dialog v-model:visible="isInstallationTypeDialogVisible">
        <template #header>
            <h2 style="text-align: center;width: 100%;">설치 유형 관리</h2>
        </template>
        <table>
            <thead>
                <th>이름</th>
                <th>AS 여부</th>
                <th>무상 여부</th>
                <th>삭제/저장</th>
            </thead>
            <tbody>
                <tr v-for="installationType in installationTypes" :key="installationType.id">
                    <td>{{ installationType.name }}</td>
                    <td><input type="checkbox" :checked="installationType.is_afterservice" disabled></td>
                    <td><input type="checkbox" :checked="installationType.is_free_for_customer" disabled></td>
                    <td>
                        <button class="small-button" @click="deleteInstallationType(installationType.id)">삭제</button>
                    </td>
                </tr>
                <tr>
                    <td><input type="text" v-model="installationTypeName" id="installation-type-name" required></td>
                    <td><input type="checkbox" v-model="installationTypeIsAfterservice"></td>
                    <td><input type="checkbox" v-model="installationTypeIsFreeForCustomer"
                            :disabled="!installationTypeIsAfterservice"></td>
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
            <h2 style="display:block;text-align: center;width: 100%;">수당/수수료 관리(품목명 : {{ productForCommissionDialog.name
                }})</h2>
        </template>
        <table>
            <thead>
                <th>이름</th>
                <th>금액</th>
                <th>삭제/저장</th>
            </thead>
            <tbody>
                <tr v-for="commission in installationCommissions" :key="commission.id">
                    <td>{{ (commission.installation_type.is_afterservice ? '(A/S)' : '') +
                        commission.installation_type.name
                        +
                        (commission.installation_type.is_afterservice &&
                            commission.installation_type.is_free_for_customer ?
                            '수수료' : '수당') }}</td>
                    <td><input type="text" v-model="commission.amount" disabled></td>
                    <td>
                        <button class="small-button" @click="deleteInstallataionCommission(commission.id)">삭제</button>
                    </td>
                </tr>
                <tr
                    v-if="!installationTypes.every(t => installationCommissions.some(c => c.installation_type.id === t.id))">
                    <td>
                        <select v-model="commission_type_id">
                            <option
                                v-for="installationType in installationTypes.filter(t => !installationCommissions.some(c => c.installation_type_id == t.id))"
                                :value="installationType.id">
                                {{ (installationType.is_afterservice ? '(A/S)' : '') +
                                    installationType.name +
                                    (installationType.is_afterservice && installationType.is_free_for_customer ? '수수료' :
                                        '수당')
                                }}
                            </option>
                        </select>
                    </td>
                    <td><input type="text" v-model="commission_amount"></td>
                    <td><button class="small-button" @click="addInstallationCommission">저장</button></td>
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