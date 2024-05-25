<script setup>
import { ref } from 'vue';
import Dialog from 'primevue/dialog';

let 환풍기Locations = ref([]);
let 전열교환기Locations = ref([]);
let 후드Locations = ref([]);

function fetchLocations() {
    fetch('/api/install_location', {
        method: 'GET'
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 위치 정보를 가져오는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            res.json().then((data) => {
                환풍기Locations.value = data.filter((location) => location.category === '환풍기').map((location) => location.name);
                전열교환기Locations.value = data.filter((location) => location.category === '전열교환기').map((location) => location.name);
                후드Locations.value = data.filter((location) => location.category === '후드').map((location) => location.name);
            });
        }
    });
}
fetchLocations();

let isAddLocationDialogVisible = ref(false);
let selectedCategory = ref('');
let newLocation = ref('');
function onAddLocationClick(category) {
    selectedCategory.value = category;
    isAddLocationDialogVisible.value = true;
    newLocation.value = '';
}

function addLocation() {
    if (newLocation.value === '') {
        alert('설치 장소 이름을 입력해주세요.');
        return;
    }

    fetch('/api/install_location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            category: selectedCategory.value,
            name: newLocation.value,
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 위치 추가에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchLocations();
            isAddLocationDialogVisible.value = false;
        }
    });
}

</script>

<template>
    <h1>카테고리 관리</h1>
    <div class="content">
        <h2>환풍기</h2>
        <div class="category">
            <button @click="onAddLocationClick('환풍기')" class="add-button">추가</button>
            <div v-for="(location, index) in 환풍기Locations" :key="index" class="location">
                {{ location }}
            </div>
        </div>
        <h2>전열교환기</h2>
        <div class="category">
            <button @click="onAddLocationClick('전열교환기')" class="add-button">추가</button>
            <div v-for="(location, index) in 전열교환기Locations" :key="index" class="location">
                {{ location }}
            </div>
        </div>
        <h2>후드</h2>
        <div class="category">
            <button @click="onAddLocationClick('후드')" class="add-button">추가</button>
            <div v-for="(location, index) in 후드Locations" :key="index" class="location">
                {{ location }}
            </div>
        </div>
    </div>

    <Dialog header="설치 장소 추가" v-model:visible="isAddLocationDialogVisible" style="width: 25rem;">
        <div>
            <p>카테고리 : {{ selectedCategory }}</p>
            <label for="location">장소 이름 : &#32;</label>
            <input type="text" v-model="newLocation">
        </div>
        <template #footer>
            <button @click="addLocation">추가</button>
            <button @click="isAddLocationDialogVisible = false">취소</button>
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

h2 {
    margin-bottom: 1rem;
}

.content {
    width: 96%;
    padding: 1rem;
    margin-left: 2%;
}

.category {
    margin-bottom: 1rem;
    border: 1px solid #ddd;
}

.location {
    padding: 1rem;
    border-bottom: 1px solid #ddd;
}

button {
    padding: 10px;
    border: none;
    border-radius: 0.25rem;
    background-color: var(--color-primary);
    color: white;
}

.add-button {
    margin: 1rem;
}


</style>