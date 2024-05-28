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
                    <th>고객명</th>
                    <td>{{ sale.customer_name }}</td>
                    <th>영업처</th>
                    <td>{{ sale.seller ? sale.seller.name : "" }}</td>
                </tr>
                <tr>
                    <th>전화번호</th>
                    <td>{{ sale.customer_phone }}</td>
                    <th>고객번호</th>
                    <td>{{ sale.display_id }}</td>
                </tr>
                <tr>
                    <th>주소</th>
                    <td colspan="3">{{ sale.customer_address }}</td>
                </tr>
            </table>
            <table id="table2">
                <tr v-for="product_sale in sale.sold_product">
                    <th style="width: 15%;">품명</th>
                    <td>{{ product_sale.product.name }}</td>
                    <th style="width: 15%;">유형</th>
                    <td>{{ product_sale.installation_type }}</td>
                    <th>수량</th>
                    <td>{{ product_sale.count }}</td>
                    <th>금액</th>
                    <td>{{ product_sale.product.retail_price }}</td>
                </tr>
                <tr style="height: auto;">
                    <th style="height: auto;">메모</th>
                    <td style="height: auto;" colspan="7">{{ sale.memo }}</td>
                </tr>
            </table>
            <div class="desc-wrap">
                <div class="desc">
                    상기 제품을 설치 및 케어 서비스 완료하였음을 <br>
                    확인하여 주시기 바랍니다. <br>
                    상기 제품의 배송/케어 서비스 완료 후 <br>
                    이상 없음을 확인합니다. <br>
                    제품을 꼭 확인 후 서명 해 주세요. <br>
                </div>
                <div style="text-align: center; margin-bottom: 10px;">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;년
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;월
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;일
                </div>
                <div style="text-align: right; margin-bottom: 10px;">
                    <span>고객명</span>
                    <span
                        class="underlined">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

                    <span>설치기사</span>
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
    height: 20%;

    th {
        width: 15%;
    }

    td {
        width: 35%;
    }
}

#table2 {
    height: 40%;
    td,tr,th {
        height: 10%;
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
    height: 40%;
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