<script setup>
import { ref } from 'vue';
import Dialog from 'primevue/dialog';

let categories = ref([]);

let locations = ref([]);
let measurementTypes = ref([]);

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
                categories.value = data
                    .sort((a, b) => a.display_order - b.display_order)
            });
        }
    });
}

function reorderCategories(category, value) {
    let putBehind = category.display_order < value;
    category.display_order = value;
    categories.value.sort((a, b) => {
        let value = a.display_order - b.display_order
        if (value === 0) {
            if (a.id === category.id || b.id === category.id)
                if (a.id === category.id) return putBehind ? 1 : -1;
                else return putBehind ? -1 : 1;
        }
        return value
    })
    .sort((a, b) => b.is_active - a.is_active);
    categories.value.forEach((category, index) => {
        category.display_order = index + 1;
    });
    fetch('/api/category/display_order', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify(categories.value.map(c => ({
            id: c.id,
            display_order: c.display_order
        })))
    }).then(async (res) => {
        if (!res.ok) {
            alert('카테고리 표시 순서 변경에 실패했습니다.\nReason : ' + await res.text());
        }
    });
}

function fetchLocations() {
    return fetch('/api/install_location', {
        method: 'GET'
    }).then(async (res) => {
        if (!res.ok) {
            alert('설치 위치 정보를 가져오는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            res.json().then((data) =>
                locations.value = data);
        }
    });
}

function fetchMeasurementTypes() {
    return fetch('/api/measurement_type', {
        method: 'GET'
    }).then(async (res) => {
        if (!res.ok) {
            alert('측정 유형 정보를 가져오는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            res.json().then((data) =>
                measurementTypes.value = data);
        }
    });

}

fetchCategories()
fetchLocations()
fetchMeasurementTypes()

let isAddCategoryDialogVisible = ref(false);
let newCategory = ref('');

let isAddLocationDialogVisible = ref(false);
let selectedType = ref(1);
let selectedCategoryId = ref('');
let newElementName = ref('');
function onAddLocationClick(category_id) {
    selectedCategoryId.value = category_id;
    isAddLocationDialogVisible.value = true;
    newElementName.value = '';
}

function addCategoryElement() {
    if (newElementName.value === '') {
        alert('설치 장소 이름을 입력해주세요.');
        return;
    }

    let url = selectedType.value === 1 ? '/api/install_location' : '/api/measurement_type';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            category_id: selectedCategoryId.value,
            name: newElementName.value,
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('카테고리 요소 추가에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchLocations();
            fetchMeasurementTypes();
            isAddLocationDialogVisible.value = false;
        }
    });
}

function deleteCategory(categoryId) {
    fetch('/api/category/' + categoryId, {
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        },
    }).then(async (res) => {
        if (!res.ok) {
            alert('카테고리 삭제에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchCategories();
        }
    });
}

function unDeleteCategory(categoryId) {
    fetch('/api/category/' + categoryId, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            is_active: true,
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('카테고리 복구에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchCategories();
        }
    });
}

function setCatoryElementActiveness(elementType, elementId, isActive) {
    let url = elementType === 1 ? '/api/install_location/' : '/api/measurement_type/';

    fetch(url + elementId, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            is_active: isActive,
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('카테고리 요소 삭제에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchLocations();
            fetchMeasurementTypes();
        }
    });
}

function addCategory() {
    if (newCategory.value === '') {
        alert('카테고리 이름을 입력해주세요.');
        return;
    }

    fetch('/api/category', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            name: newCategory.value,
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('카테고리 추가에 실패했습니다.\nReason : ' + await res.text());
        } else {
            fetchCategories();
            isAddCategoryDialogVisible.value = false;
        }
    });
}

</script>

<template>
    <div style="display: flex;align-items: center;">
        <h1>카테고리 관리</h1>
        <button @click="isAddCategoryDialogVisible = true" class="basic-button"
            style="position: absolute;right: 2%;">카테고리 추가</button>
    </div>
    <div class="content">
        <template v-for="category in categories" :key="category.id">
            <div>
                <h2>{{ category.name + (category.is_active ? '' : '(삭제됨)') }}</h2>
                <div class="category">
                    <input type="text" pattern="[0-9]*" :value="category.display_order"
                        @change="reorderCategories(category, $event.target.value)" style="width: 3rem;">
                    <button @click="onAddLocationClick(category.id)" class="small-button" style="margin:1rem;">카테고리 상품
                        추가</button>
                    <button @click="category.is_active ? deleteCategory(category.id) : unDeleteCategory(category.id)"
                        class="small-button">{{ '카테고리 ' + (category.is_active ?
                            '삭제' : '복구') }}</button>
                    <template v-if="category.is_active">
                        <h3 style="margin: 1rem;">
                            상품 이름 : &#32;
                        </h3>
                        <div v-for="location in locations.filter((location) => location.is_active && location.category_id === category.id)"
                            :key="location.id" class="location">
                            <p>{{ location.name }}</p>
                            <div style="margin:auto"></div>
                            <button @click="setCatoryElementActiveness(1, location.id, !location.is_active)"
                                class="small-button danger-button">삭제</button>
                        </div>
                        <h3 style="margin: 1rem;">
                            필터 사이즈 : &#32;
                        </h3>
                        <div v-for="measurement_type in measurementTypes.filter((type) => type.is_active && type.category_id === category.id)"
                            :key="measurement_type.id" class="location">
                            <p>{{ measurement_type.name }}</p>
                            <div style="margin:auto"></div>
                            <button
                                @click="setCatoryElementActiveness(2, measurement_type.id, !measurement_type.is_active)"
                                class="small-button danger-button">삭제</button>
                        </div>
                    </template>
                </div>
            </div>
        </template>
    </div>

    <Dialog header="카테고리 추가" v-model:visible="isAddCategoryDialogVisible" style="width: 25rem;">
        <div>
            <label for="category">카테고리 이름 : &#32;</label>
            <input type="text" v-model="newCategory" required>
        </div>
        <template #footer>
            <button class="small-button" @click="addCategory">추가</button>
            <button class="small-button" @click="isAddCategoryDialogVisible = false">취소</button>
        </template>
    </Dialog>

    <Dialog header="카테고리 상품 추가" v-model:visible="isAddLocationDialogVisible" style="width: 25rem;">
        <div>
            <p>카테고리 : {{ categories.find((category) => category.id == selectedCategoryId).name }}</p>
            <label for="type">유형 : </label>
            <select id="type" v-model="selectedType">
                <option value="1">상품 이름</option>
                <option value="2">필터 사이즈</option>
            </select>
            <label for="location">이름 : &#32;</label>
            <input type="text" v-model="newElementName" required>
        </div>
        <template #footer>
            <button class="small-button" @click="addCategoryElement">추가</button>
            <button class="small-button" @click="isAddLocationDialogVisible = false">취소</button>
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
    height: 85%;
    overflow-y: auto;
}

.category {
    margin-bottom: 1rem;
    border: 1px solid #ddd;
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

.location {
    margin: 1rem;
    margin-left: 2rem;
    display: flex;
}
</style>