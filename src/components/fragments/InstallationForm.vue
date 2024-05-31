<script setup>

import { ref } from 'vue';
import router from '@/router';

const props = defineProps(['id']);

const sale = ref({});

fetch(`/api/sale/${props.id}`, {
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
            sale.value = data;
        })
    }
})
</script>

<template>
    <div class="outer">
        <h1>설치 및 케어 확인서</h1>
        <div class="inner">
            <table id="table1">
                <tr>
                    <td>고객명</td>
                    <td>{{ sale.customer_name }}</td>
                    <td>고객번호</td>
                    <td>{{ sale.display_id }}</td>
                    <td>사원명</td>
                    <td>{{ sale.seller ? sale.seller.name : "" }}</td>
                </tr>
                <tr>
                    <td>전화번호</td>
                    <td>{{ sale.customer_phone }}</td>
                    <td>주소</td>
                    <td colspan="3">{{ sale.customer_address }}</td>
                </tr>
                <tr>
                    <td>메모</td>
                    <td colspan="5">{{ sale.memo }}</td>
                </tr>

            </table>
            <table id="table2">
                <thead>
                    <tr>
                        <th>품명</th>
                        <th>유형</th>
                        <th>수량</th>
                        <th>금액</th>
                        <th>처리결과</th>
                        <th>결제유형</th>
                        <th>비고</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product_sale in (sale.sold_product ?? []).filter((product) => !product.is_complete)">
                        <td>{{ product_sale.product.name }}</td>
                        <td>{{ product_sale.installation_type.name }}</td>
                        <td>{{ product_sale.count }}</td>
                        <td>{{ product_sale.total_amount }}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr style="height: auto;"></tr>
                </tbody>
            </table>
            <table id="table3" v-if="sale.measurement?.length ?? 0 > 0">
                <tr v-for="i in Math.floor(sale.measurement.length / 3) + 1">
                    <template v-for="j in 3">
                        <template v-if="sale.measurement[(i - 1) * 3 + j - 1]">
                            <td width="16.66%">{{ sale.measurement[(i - 1) * 3 + j - 1].measurement_type.name }}</td>
                            <td width="16.66%">{{ sale.measurement[(i - 1) * 3 + j - 1].width + 'x' + sale.measurement[(i - 1) * 3 +
                                j - 1].height + 'x' + sale.measurement[(i - 1) * 3 + j - 1].thickness }}</td>
                        </template>
                        <template v-else>
                            <td width="33.33%"></td>
                        </template>
                    </template>
                </tr>
                <tr style="height:auto"></tr>
            </table>
            <table id="table4" :style="(sale.measurement?.length ?? 0 > 0) ? {height: '10%'} : {height: '20%'}">
                <tr>
                    <td style="width: 128px;">메모</td>
                    <td>{{ sale.memo }}</td>
                </tr>
            </table>
            <div class="desc-wrap">
                <div class="desc">
                    1. 설치/배송/케어 서비스 완료 후 이상 없음을 확인해주세요. <br>
                    2. 새 상품의 무상 A/S 기간은 1년 입니다.<br>
                    3. 리퍼/케어 상품의 무상 A/S 기간은 1개월 입니다.<br>
                    4. 제품 및 A/S 내용을 꼭 확인 후 서명해주세요.
                </div>
                <div style="text-align: center; margin-bottom: 10px;">
                    20&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;년
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;월
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;일
                </div>
                <div style="text-align: right; margin-bottom: 10px;">
                    <span>설치기사</span>
                    <span
                        class="underlined">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span>고객명</span>
                    <span
                        class="underlined">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.outer {
    height: 100vh;
    width: 72vh;
    align-content: center;
}

h1 {
    font-size: 3rem;
    font-weight: lighter;
    margin-top: 1rem;
    margin-bottom: 1rem;
    text-align: center;
    height: 64px;
}

.inner {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid #000;
    margin: 5%;
    height: calc(90% - 64px);
    width: 90%;
    border-collapse: collapse;
}

table {
    width: 100%;
    border: none;
    border-collapse: collapse;
}

#table1 {
    height: 10%;
}

#table2 {
    height: 35%;

    td,
    tr,
    th {
        height: 16px
    }
}

#table3 {
    height: 10%;
    tr,td {
        height: 16px;
    }
}

tr,
th,
td {
    border: 1px solid #000;
    text-align: center;
    font-size: 1rem;
    height: auto;
}

.desc-wrap {
    align-content: center;
    border: 1px solid #000;
    width: 100%;
    height: 35%;
}

.desc {
    padding: 1rem;
    font-size: 1rem;
    margin: auto;
    width: fit-content;
    text-align: start;
    line-height: 2rem;
}

span {
    font-size: 1rem;
    margin: 10px;
}

.underlined {
    text-decoration: underline;
}
</style>