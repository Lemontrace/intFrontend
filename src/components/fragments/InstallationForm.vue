<script setup>

import { ref } from 'vue';
import router from '@/router';

const props = defineProps(['type', 'id']);

const data = ref({});

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
        res.json().then((sale) => {
            data.value = sale;
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
                    <td>{{ data.customer_name }}</td>
                    <td>고객번호</td>
                    <td>{{ data.display_id }}</td>
                    <td>사원</td>
                    <td>{{ data.seller?.name }}</td>
                </tr>
                <tr>
                    <td>전화번호</td>
                    <td>{{ data.customer_phone }}</td>
                    <td>주소</td>
                    <td colspan="3">{{ data.customer_address }}</td>
                </tr>
                <tr>
                    <td>비고</td>
                    <td colspan="5">{{ data.memo }}</td>
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
                    <tr v-for="product_sale in data.sold_product?.filter((product) => !product.is_complete)">
                        <td>{{ product_sale.product.name }}</td>
                        <td>{{ product_sale.product.installation_type.name }}</td>
                        <td>{{ product_sale.count }}</td>
                        <td>{{ product_sale.total_amount }}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr style="height: auto;"></tr>
                </tbody>
            </table>
            <table id="table3" v-if="data.measurement?.length ?? 0 > 0">
                <tr v-for="i in Math.floor((data.measurement.length - 1) / 3) + 1">
                    <template v-for="j in 3">
                        <template v-if="data.measurement[(i - 1) * 3 + j - 1]">
                            <td width="16.66%">{{ data.measurement[(i - 1) * 3 + j - 1].measurement_type.name }}</td>
                            <td width="16.66%">{{ data.measurement[(i - 1) * 3 + j - 1].width + 'x' +
                                data.measurement[(i - 1) * 3 +
                                    j - 1].height + 'x' + data.measurement[(i - 1) * 3 + j - 1].thickness }}</td>
                        </template>
                    </template>
                </tr>
            </table>
            <table id="table4">
                <tr>
                    <td style="width: 25%;">설치비고</td>
                    <td></td>
                </tr>
            </table>
            <div class="desc-wrap">
                <div class="desc">
                    1. 설치/배송/케어 서비스 완료 후 이상 없음을 확인해주세요. <br>
                    2. 새 상품의 무상 A/S 기간은 1년 입니다.<br>
                    3. 리퍼/케어상품의 무상 A/S 기간은 리퍼(6개월)/케어(2개월)입니다.<br>
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
    border-collapse: collapse;
}

#table1 {

    tr,
    td {
        height: 16px;
    }
}

#table2 {
    flex-grow: 1;

    td,
    tr,
    th {
        height: 16px
    }
}

#table3 {

    tr,
    td {
        height: 16px;
    }
}

#table4 {

    tr,
    td {
        height: 64px;
    }
}

tr,
th,
td {
    text-align: center;
    font-size: 1rem;
}

table,
td,
th {
    border-collapse: collapse;
    border: 1px solid #000;
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