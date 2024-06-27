<script setup>
import { reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { saveAs } from 'file-saver';

import Dialog from 'primevue/dialog';
let sale = ref(null);

const $route = useRoute();

function fetchSale() {
    fetch('/api/sale/' + $route.params.saleId, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        sale.value = await res.json();
        saleEdit.customer_name = sale.value.customer_name;
        saleEdit.customer_phone = sale.value.customer_phone;
        saleEdit.customer_address = sale.value.customer_address;
        saleEdit.memo = sale.value.memo;
    }).catch((err) => {
        console.log(err);
    });
}

fetchSale();

const products = ref([]);
function fetchProducts() {
    fetch('/api/product', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        products.value = (await res.json()).filter((p) => p.is_active);
    }).catch((err) => {
        console.log(err);
    });
}
fetchProducts();

const installationDocumentList = ref([]);
async function fetchInstallationDocumentList() {
    const installations = await fetch('/api/sale/' + $route.params.saleId + '/installation', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(res => res.json())

    const promises = installations.map(async (installation) => {
        const documents = await fetch('/api/installation_document_list?installation_id='
            + encodeURIComponent(installation.id), {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            }
        }).then(res => res.json());
        return {
            installer_name: installation.installer.name,
            install_date: installation.date.split('T')[0],
            installation_document: documents
        }
    });

    installationDocumentList.value = await Promise.all(promises);
}
fetchInstallationDocumentList();

function editSale() {
    fetch('/api/sale/' + $route.params.saleId, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleEdit)
    }).then(async (res) => {
        if (!res.ok) {
            alert('영업 정보를 수정하는데 실패했습니다\nReason: ' + await res.text());
        } else {
            alert('수정되었습니다.');
            fetchSale();
        }
    }).catch((err) => {
        console.log(err);
    });
}

function editSoldProduct() {
    fetch('/api/sold_product/' + soldProductEdit.id, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(soldProductEdit)
    }).then(async (res) => {
        if (!res.ok) {
            alert('판매 상품을 수정하는데 실패했습니다\nReason: ' + await res.text());
        } else {
            alert('수정되었습니다.');
            fetchSale();
        }
    }).catch((err) => {
        console.log(err);
    });
}

function editMeasurement() {
    fetch('/api/measurement/' + measurementEdit.id, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            width: parseInt(measurementEdit.width),
            height: parseInt(measurementEdit.height),
            thickness: parseInt(measurementEdit.thickness)
        })
    }).then(async (res) => {
        if (!res.ok) {
            alert('필터 사이즈를 수정하는데 실패했습니다\nReason: ' + await res.text());
        } else {
            alert('수정되었습니다.');
            measurementEdit.id = undefined;
            measurementEdit.width = '';
            measurementEdit.height = '';
            measurementEdit.thickness = '';
            fetchSale();
        }
    }).catch((err) => {
        console.log(err);
    });
}

function deleteSoldProduct(id) {
    fetch('/api/sold_product/' + id, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        if (!res.ok) {
            alert('판매 상품을 삭제하는데 실패했습니다\nReason: ' + await res.text());
        } else {
            alert('삭제되었습니다.');
            fetchSale();
        }
    }).catch((err) => {
        console.log(err);
    });
}

function downloadInstallationDocument(installation_id, fileName) {
    fetch('/api/installation_document/' + installation_id + fileName, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 문서를 다운로드하는데 실패했습니다\nReason: ' + await res.text());
        } else {
            const blob = await res.blob();
            saveAs(blob, fileName);
            alert('다운로드 되었습니다.');
        }
    }).catch((err) => {
        console.log(err);
    });
}

const saleEdit = reactive({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    memo: '',
});

const measurementEdit = reactive({
    id: '',
    width: '',
    height: '',
    thickness: ''
});

const isSoldProductEditDialogVisible = ref(false);
const soldProductEdit = reactive({
    id: '',
    category_id: '',
    product_id: '',
    count: '',
    total_amount: ''
});

function openSoldProductEditDialog(soldProduct) {
    isSoldProductEditDialogVisible.value = true;
    soldProductEdit.product_id = soldProduct.product_id;
    soldProductEdit.count = soldProduct.count;
    soldProductEdit.total_amount = soldProduct.total_amount;

    soldProductEdit.id = soldProduct.id;
    soldProductEdit.category_id = soldProduct.product.category_id;
}

</script>

<template>
    <div class="page-header">
        <h1>영업상세</h1>
        <div class="button-div">
        </div>
    </div>
    <div class="page-content" style="margin-left: 2rem;">
        <div style="display: flex;">
            <div style="margin-left: 2rem; width: 30rem;">
                <h2>고객 정보</h2>
                <div>
                    <table style="width: 100%;">
                        <tr>
                            <td>고객번호 : </td>
                            <td>{{ sale?.display_id }}</td>
                        </tr>
                        <tr>
                            <td>고객명 : </td>
                            <td><input type="text" v-model="saleEdit.customer_name"></td>
                        </tr>
                        <tr>
                            <td>연락번호 : </td>
                            <td><input type="text" v-model="saleEdit.customer_phone"></td>
                        </tr>
                        <tr>
                            <td>고객주소 : </td>
                            <td><input type="text" v-model="saleEdit.customer_address"></td>
                        </tr>
                        <tr>
                            <td>메모 : </td>
                            <td><textarea style="resize: none; width:100%;height: 5rem;" v-model="saleEdit.memo"></textarea>
                            </td>
                        </tr>

                        <tr>
                            <td></td>
                            <td style="text-align: end;"><button class="small-button" @click="editSale()">수정</button>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            <div style="margin-left: 2rem;">
                <h2>상품 목록</h2>
                <div>
                    <table>
                        <tr>
                            <th>카테고리</th>
                            <th>상품명</th>
                            <th>제품명</th>
                            <th>수량</th>
                            <th>판매가</th>
                            <th>영업가</th>
                            <th>상태</th>
                            <th>수정</th>
                            <th>삭제</th>
                        </tr>
                        <tr v-for="item in sale?.sold_product">
                            <td>{{ item.product.category.name }}</td>
                            <td>{{ item.install_location.name }}</td>
                            <td>{{ item.product.name }}</td>
                            <td>{{ item.count }}</td>
                            <td>{{ item.product.retail_price * item.count }}</td>
                            <td>{{ item.total_amount }}</td>
                            <td>{{ item.is_new ? "신규" : item.is_complete ? "완료" : "진행중" }}</td>
                            <td><button class="small-button" @click="openSoldProductEditDialog(item)">수정</button></td>
                            <td><button class="small-button danger-button" @click="deleteSoldProduct(item.id)">삭제</button>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-if="sale?.measurement.length !== 0">
                    <h2>필터 사이즈 목록</h2>
                    <div>
                        <table>
                            <tr>
                                <th>카테고리</th>
                                <th>이름</th>
                                <th>사이즈</th>
                                <th>수정</th>
                            </tr>
                            <tr v-for="item in sale?.measurement">
                                <td>{{ item.measurement_type.category.name }}</td>
                                <td>{{ item.measurement_type.name }}</td>
                                <td>
                                    <template v-if="item.id === measurementEdit.id">
                                        <input class="small-input" pattern="[0-9]+" type="text"
                                            v-model="measurementEdit.width"> x
                                        <input class="small-input" pattern="[0-9]+" type="text"
                                            v-model="measurementEdit.height"> x
                                        <input class="small-input" pattern="[0-9]+" type="text"
                                            v-model="measurementEdit.thickness">
                                    </template>
                                    <template v-else>
                                        {{ item.width }} x {{ item.height }} x {{ item.thickness }}
                                    </template>
                                </td>
                                <td>
                                    <button class="small-button" v-if="item.id === measurementEdit.id"
                                        @click="editMeasurement()">
                                        저장
                                    </button>
                                    <button class="small-button" v-else
                                        @click="measurementEdit.id = item.id; measurementEdit.width = item.width; measurementEdit.height = item.height; measurementEdit.thickness = item.thickness;">
                                        수정
                                    </button>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <h2>설치 문서</h2>
            <table>
                <tr>
                    <th>설치자명</th>
                    <th>설치일</th>
                    <th>문서 수</th>
                    <th>다운로드</th>
                </tr>
                <tr v-for="item in installationDocumentList">
                    <td>{{ item.installer_name }}</td>
                    <td>{{ item.install_date }}</td>
                    <td>{{ item.installation_document.length }}</td>
                    <td><button class="small-button" @click="
                        item.installation_document.forEach((doc) => downloadInstallationDocument(item.id, doc))
                        ">다운로드</button></td>
                </tr>
            </table>
        </div>
    </div>

    <Dialog v-model:visible="isSoldProductEditDialogVisible">
        <template #header>
            <h2>
                영업 상품 수정
            </h2>
        </template>
        <table>
            <tr>
                <td>상품명</td>
                <td>
                    <select v-model="soldProductEdit.product_id"
                        @change="soldProductEdit.total_amount = soldProductEdit.count * products.find((p) => p.id === soldProductEdit.product_id).retail_price">
                        <option v-for="product in products.filter((p) => p.category_id === soldProductEdit.category_id)"
                            :value="product.id">{{ product.name }}</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>수량</td>
                <td><input type="text"
                        @input="soldProductEdit.total_amount = soldProductEdit.count * products.find((p) => p.id === soldProductEdit.product_id).retail_price;"
                        v-model="soldProductEdit.count"></td>
            </tr>
            <tr>
                <td>영업가</td>
                <td><input type="text" v-model="soldProductEdit.total_amount"></td>
            </tr>
        </table>
        <template #footer>
            <button class="small-button" @click="isSoldProductEditDialogVisible = false">취소</button>
            <button class="small-button" @click="isSoldProductEditDialogVisible = false; editSoldProduct()">수정</button>
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

td,
th {
    font-size: large;
    text-align: center;
    padding: 8px;
}

input[type="text"],
textarea {
    font-size: large;
}

input,
select,
textarea {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    width: 100%;
}

.small-input {
    width: 5rem;
}

select {
    background-color: white;
}</style>