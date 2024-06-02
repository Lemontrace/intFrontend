<script setup>
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import exceljs from 'exceljs';
import { saveAs } from 'file-saver';

const datepicker = ref();

const date = ref("");

const installed_products = ref([]);
const sale_commission_edit_state = ref([]);
const sale_commission_edit_value = ref([]);
const installation_commission_edit_state = ref([]);
const installation_commission_edit_value = ref([]);

const firstLoad = ref(true);
function fetchInstalledProducts() {
    fetch('/api/installed_product', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 정보를 가져오는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            res.json().then((data) => {
                installed_products.value = data.sort((a, b) => a.id - b.id)
                    .sort((a, b) => a.status === '완료' ? -1 : 1)
                    .sort((a, b) => b.display_id - a.display_id);
                installed_products.value.forEach((installed_product) => {
                    const installType = installed_product.sold_product.installation_type
                    if (installed_product.status !== '완료') {
                        installed_product.payment_amount = 0;
                        installed_product.sale_commission = 0;
                        installed_product.installation_commission = 0;
                    } else {
                        if (installed_product.sold_product.commission_override) installed_product.sale_commission = installed_product.sold_product.commission_override
                        else {
                            const originalSaleCommission = installed_product.sold_product.product.sales_commission * installed_product.sold_product.sale.seller_rank.commission_rate
                            const saleCommissionDeduction = installed_product.sold_product.product.retail_price * installed_product.sold_product.count - installed_product.sold_product.total_amount;
                            installed_product.sale_commission = originalSaleCommission - saleCommissionDeduction;
                        }

                        if (installed_product.commission_override) installed_product.installation_commission = installed_product.commission_override
                        else {
                            const commissionType = installed_product.sold_product.product.installation_commission
                                .find(
                                    (ic) => ic.installation_type_id === installType.id
                                )
                            const originalInstallationCommission = commissionType.amount * installed_product.installation.installer_rank.commission_rate;
                            const installationCommissionDeduction = installed_product.sold_product.total_amount - installed_product.payment_amount
                            installed_product.installation_commission = originalInstallationCommission - installationCommissionDeduction;
                        }
                    }

                    installed_product.pure_profit = installed_product.profit - installed_product.sale_commission - installed_product.installation_commission;
                });
                if (firstLoad.value) {
                    firstLoad.value = false;
                    sale_commission_edit_state.value = Array(installed_products.value.length).fill('view');
                    installation_commission_edit_state.value = Array(installed_products.value.length).fill('view');
                }
            });
        }
    });
}
fetchInstalledProducts();

function updateSaleCommissionOverride(soldProductId, saleCommission) {
    fetch('/api/sold_product/' + soldProductId, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            commission_override: parseInt(saleCommission),
        })
    }).then(async (res) => {
        if (!res.ok) {
            alert('영업 수당을 업데이트하는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchInstalledProducts();
        }
    });
}

function updateInstallationCommissionOverride(installedProductId, installationCommission) {
    fetch('/api/installed_product/' + installedProductId, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            commission_override: parseInt(installationCommission),
        })
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 수당을 업데이트하는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchInstalledProducts();
        }
    });
}

function updatePaymentArrivalDate(id, date) {
    fetch('/api/installed_product/' + id, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            payment_arrival_date: date,
        })
    }).then(async (res) => {
        if (!res.ok) {
            alert('결제일을 업데이트하는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchInstalledProducts();
        }
    });
}

function updateCommissionPaymentDate(id, date) {
    fetch('/api/installed_product/' + id, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            commission_payment_date: date,
        })
    }).then(async (res) => {
        if (!res.ok) {
            alert('수당 지급일을 업데이트하는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchInstalledProducts();
        }
    });
}

function onDeleteInstallation(id) {
    fetch('/api/installed_product/' + id, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 정보를 삭제하는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchInstalledProducts();
        }
    });
}

let onPickFunction
function openDatePicker(onPick) {
    datepicker.value.openMenu();
    onPickFunction = onPick;
}


const excelCommonRows = [
    { name: '고객번호', get: (installed_product) => installed_product.sold_product.sale.display_id },
    { name: '고객명', get: (installed_product) => installed_product.sold_product.sale.customer_name },
    { name: '주소', get: (installed_product) => installed_product.sold_product.sale.customer_address },
    { name: '연락번호', get: (installed_product) => installed_product.sold_product.sale.customer_phone },
    { name: '품명', get: (installed_product) => installed_product.sold_product.product.name },
    { name: '유형', get: (installed_product) => installed_product.sold_product.product.category.name },
    { name: '수량', get: (installed_product) => installed_product.sold_product.count },
    { name: '설치유형', get: (installed_product) => installed_product.sold_product.installation_type.name },
]
const excelSaleRows = [
    { name: '영업자', get: (installed_product) => installed_product.sold_product.sale.seller.name },
    { name: '영업금액', get: (installed_product) => installed_product.sold_product.total_amount },
    { name: '영업메모', get: (installed_product) => installed_product.sold_product.sale.memo },
    { name: '영업수당', get: (installed_product) => installed_product.sale_commission },
]
const excelInstallRows = [
    { name: '설치자', get: (installed_product) => installed_product.installation.installer.name },
    { name: '설치상태', get: (installed_product) => installed_product.status },
    { name: '보류/취소사유', get: (installed_product) => installed_product.status_reason },
    { name: '설치완료일', get: (installed_product) => installed_product.installation.date.split('T')[0] },
    { name: '결제유형', get: (installed_product) => installed_product.payment_type },
    { name: '결제금액', get: (installed_product) => installed_product.payment_amount },
    { name: '설치메모', get: (installed_product) => installed_product.installation.memo },
    { name: '설치수당', get: (installed_product) => installed_product.installation_commission },
]

const excelCommonRows2 = [
    { name: '수당지급일', get: (installed_product) => installed_product.commission_payment_date?.split('T')[0] ?? '' },
]

const excelAdminRows = [
    { name: '회사입금일', get: (installed_product) => installed_product.payment_arrival_date?.split('T')[0] ?? '' },
    { name: '회사이익', get: (installed_product) => installed_product.profit },
    { name: '순이익', get: (installed_product) => installed_product.pure_profit }
]

const isExcelDownloadDialogVisible = ref(false);

function excelDownload(type) {
    const workbook = new exceljs.Workbook();
    let worksheet
    if (type != '영업')
        worksheet = workbook.addWorksheet('설치 목록');
    else
        worksheet = workbook.addWorksheet('영업 목록');

    let rows = excelCommonRows.concat(excelSaleRows);
    if (type !== '영업') rows = rows.concat(excelInstallRows);
    rows = rows.concat(excelCommonRows2);
    if (type === '어드민') rows = rows.concat(excelAdminRows);

    const headers = ['순번'].concat(rows.map((row) => row.name));

    worksheet.addRow(headers);
    installed_products.value.forEach((installed_product, index) => {
        const row = [index + 1];
        rows.forEach((r) => row.push(r.get(installed_product)));
        worksheet.addRow(row);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, type != '영업' ? '설치목록.xlsx' : '영업목록.xlsx');
    });
}
</script>

<template>
    <div class="page-header">
        <h1>설치 목록</h1>
        <button @click="isExcelDownloadDialogVisible = true" class="basic-button"
            style="position: absolute;right: 2%;">엑셀 다운로드</button>
    </div>
    <div class="page-content table-wrapper">
        <table style="table-layout: fixed;">
            <thead>
                <tr>
                    <th>순번</th>
                    <th>고객번호</th>
                    <th>고객명</th>
                    <th>주소</th>
                    <th>연락번호</th>
                    <th>영업자</th>
                    <th>품명</th>
                    <th>유형</th>
                    <th>수량</th>
                    <th>영업금액</th>
                    <th>영업메모</th>
                    <th>설치자</th>
                    <th>설치상태</th>
                    <th>보류/취소사유</th>
                    <th>설치유형</th>
                    <th>설치완료일</th>
                    <th>결제유형</th>
                    <th>결제금액</th>
                    <th>회사입금일</th>
                    <th>설치메모</th>
                    <th style="width: 12em;">영업수당</th>
                    <th style="width: 12em;">설치수당</th>
                    <th>수당지급일</th>
                    <th>회사이익</th>
                    <th>순이익</th>
                    <th>삭제</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(installed_product, index) in installed_products">
                    <td>{{ index + 1 }}</td>
                    <td>{{ installed_product.sold_product.sale.display_id }}</td>
                    <td>{{ installed_product.sold_product.sale.customer_name }}</td>
                    <td>{{ installed_product.sold_product.sale.customer_address }}</td>
                    <td>{{ installed_product.sold_product.sale.customer_phone }}</td>
                    <td>{{ installed_product.sold_product.sale.seller.name }}</td>
                    <td>{{ installed_product.sold_product.product.name }}</td>
                    <td>{{ installed_product.sold_product.product.category.name }}</td>
                    <td>{{ installed_product.sold_product.count }}</td>
                    <td>{{ installed_product.sold_product.total_amount }}</td>
                    <td>{{ installed_product.sold_product.sale.memo }}</td>
                    <td>{{ installed_product.installation.installer.name }}</td>
                    <td>{{ installed_product.status }}</td>
                    <td>{{ installed_product.status_reason }}</td>
                    <td>{{ installed_product.sold_product.installation_type.name }}</td>
                    <td>{{ installed_product.installation.date.split('T')[0] }}</td>
                    <template v-if="installed_product.status === '완료'">
                        <td>{{ installed_product.payment_type }}</td>
                        <td>{{ installed_product.payment_amount }}</td>
                        <td>
                            <button class="small-button" @click="installed_product.payment_arrival_date ?
                                updatePaymentArrivalDate(installed_product.id, null)
                                : openDatePicker((date) => updatePaymentArrivalDate(installed_product.id, date))">
                                {{ installed_product.payment_arrival_date?.split('T')[0] ?? '선택' }}
                            </button>
                        </td>
                        <td>{{ installed_product.installation.memo }}</td>
                        <td>
                            <template v-if="sale_commission_edit_state[index] === 'view'">
                                {{ installed_product.sale_commission }}
                            </template>
                            <template v-else>
                                <input pattern="-{0,1}[0-9]+" style="width: 10em;" type="text"
                                    v-model="sale_commission_edit_value[index]">
                            </template>
                            <br>
                            <button class="small-button" @click="
                            if (installed_product.sold_product.commission_override !== null) {
                                updateSaleCommissionOverride(installed_product.sold_product.id, null)
                                sale_commission_edit_value[index] = '';
                            } else {
                                if (sale_commission_edit_state[index] === 'edit') {
                                    updateSaleCommissionOverride(installed_product.sold_product.id, sale_commission_edit_value[index]);
                                }
                                sale_commission_edit_state[index] = sale_commission_edit_state[index] === 'view' ? 'edit' : 'view';
                            }
                                ">
                                {{ installed_product.sold_product.commission_override !== null ? '초기화' :
                                    sale_commission_edit_state[index] ===
                                        'view' ? '수정' : '저장' }}
                            </button>
                        </td>
                        <td>
                            <template v-if="installation_commission_edit_state[index] === 'view'">
                                {{ installed_product.installation_commission }}
                            </template>
                            <template v-else>
                                <input pattern="-{0,1}[0-9]+" style="width: 10em;" type="text"
                                    v-model="installation_commission_edit_value[index]">
                            </template>
                            <br>
                            <button class="small-button" @click="
                            if (installed_product.commission_override !== null) {
                                updateInstallationCommissionOverride(installed_product.id, null)
                                installation_commission_edit_value[index] = '';
                            } else {
                                if (installation_commission_edit_state[index] === 'edit') {
                                    updateInstallationCommissionOverride(installed_product.id, installation_commission_edit_value[index]);
                                }
                                installation_commission_edit_state[index] = installation_commission_edit_state[index] === 'view' ? 'edit' : 'view';
                            }
                                ">
                                {{ installed_product.commission_override !== null ? '초기화' :
                                    installation_commission_edit_state[index] ===
                                        'view' ? '수정' : '저장' }}
                            </button>
                        </td>
                        <td>
                            <button class="small-button" @click="installed_product.commission_payment_date ?
                                updateCommissionPaymentDate(installed_product.id, null)
                                : openDatePicker((date) => updateCommissionPaymentDate(installed_product.id, date))">
                                {{ installed_product.commission_payment_date?.split('T')[0] ?? '선택' }}
                            </button>
                        </td>
                        <td>{{ installed_product.profit }}</td>
                        <td>{{ installed_product.pure_profit }}</td>
                    </template>
                    <template v-else>
                        <template v-for="i in 9">
                            <td>
                                <template v-if="i === 4">
                                    {{ installed_product.sold_product.sale.memo }}
                                </template>
                            </td>
                        </template>
                    </template>
                    <td><button class="small-button" @click="onDeleteInstallation(installed_product.id)">삭제</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div style="height: auto;"></div>
    </div>


    <VueDatePicker v-model="date" ref="datepicker" :teleport-center="true" select-text="선택" cancel-text="취소"
        :enable-time-picker="false" locale="ko-KR" @date-update="d => date = d.toISOString().split('T')[0]">
        <template #action-row>
            <div style="width: 100%;display:flex;justify-content: end;">
                <button class="small-button"
                    @click="datepicker.closeMenu(); onPickFunction(date); date = ''">선택</button>
            </div>
        </template>
    </VueDatePicker>

    <Dialog v-model:visible="isExcelDownloadDialogVisible">
        <template #header>
            <h2 style="text-align: center;width: 100%;">다운로드 유형 선택</h2>
        </template>
        <div style="display: flex;justify-content: center; gap: 10px">
            <button class="basic-button" @click="excelDownload('어드민')">전체 다운로드</button>
            <button class="basic-button" @click="excelDownload('영업')">영업자용 다운로드</button>
            <button class="basic-button" @click="excelDownload('설치')">설치자용 다운로드</button>
        </div>
    </Dialog>
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
    text-wrap: wrap;
    word-wrap: break-word;
}

th {
    width: 7rem;
}

div.table-wrapper {
    overflow-x: auto;
}

input:invalid {
    border-color: red;
}
</style>