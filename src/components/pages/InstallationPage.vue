<script setup>
import { ref } from 'vue';
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
                installed_products.value = data.sort((a, b) => a.status === '완료' ? -1 : 1);
                installed_products.value.forEach((installed_product) => {
                    const installType = installed_product.sold_product.installation_type
                    if (installed_product.status !== '완료') {
                        installed_product.payment_amount = 0;
                        installed_product.sale_commission = 0;
                        installed_product.installation_commission = 0;
                    } else if (installType.is_afterservice) {
                        installed_product.sale_commission = 0;
                        if (installed_product.commission_override) installed_product.installation_commission = installed_product.commission_override
                        else {
                            const baseCommission = installed_product.sold_product.product.installation_commission.find(ic => ic.installation_type_id === installType.id).amount;
                            installed_product.installation_commission = installType.is_free_for_customer ?
                                baseCommission * installed_product.installation.installer_rank.commission_rate : 0;
                        }
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
                            const originalInstallationCommission = commissionType.amount * (commissionType.is_afterservice && !commissionType.is_free_for_customer ? 1 : installed_product.installation.installer_rank.commission_rate);
                            const installationCommissionDeduction = installed_product.sold_product.total_amount - installed_product.payment_amount
                            installed_product.installation_commission = originalInstallationCommission - installationCommissionDeduction;
                        }
                    }

                    if (installType.is_afterservice) {
                        installed_product.profit = -installed_product.installation_commission;
                    } else {
                        installed_product.profit = installed_product.payment_amount - installed_product.sale_commission - installed_product.installation_commission;
                    }
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

function excelDownload() {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('설치 목록');
    worksheet.addRow([
        '순번', '고객번호', '고객명', '주소', '연락번호', '영업자', '품명', '유형', '수량', '영업금액', '영업메모',
        '설치자', '설치상태', '설치유형', '설치완료일', '결제유형', '결제금액', '회사입금일', '설치메모', '영업수당',
        '설치수당', '수당지급일', '회사이익'
    ]);
    installed_products.value.forEach((installed_product, index) => {
        worksheet.addRow([
            index + 1,
            installed_product.sold_product.sale.display_id,
            installed_product.sold_product.sale.customer_name,
            installed_product.sold_product.sale.customer_address,
            installed_product.sold_product.sale.customer_phone,
            installed_product.sold_product.sale.seller.name,
            installed_product.sold_product.product.name,
            installed_product.sold_product.product.category.name,
            installed_product.sold_product.count,
            installed_product.sold_product.total_amount,
            installed_product.sold_product.sale.memo,
            installed_product.installation.installer.name,
            installed_product.status,
            installed_product.sold_product.installation_type.name,
            installed_product.installation.date.split('T')[0],
            installed_product.payment_type,
            installed_product.payment_amount,
            installed_product.payment_arrival_date?.split('T')[0] ?? '',
            installed_product.installation.memo,
            installed_product.sale_commission,
            installed_product.installation_commission,
            installed_product.commission_payment_date?.split('T')[0] ?? '',
            installed_product.profit,
        ]);
    });
    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, '설치목록.xlsx');
    });
}
</script>

<template>
    <div class="page-header">
        <h1>설치 목록</h1>
        <button @click="excelDownload" class="basic-button" style="position: absolute;right: 2%;">엑셀 다운로드</button>
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