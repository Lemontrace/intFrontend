<script setup>
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import router from '@/router';
let users = ref([]);
function fetchUsers() {
    fetch('/api/user', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
    }).then(async (res) => {
        if (!res.ok) {
            if (res.status === 401) {
                alert('로그인이 필요합니다.');
                router.push('/');
                return
            }
            alert('사용자 정보를 가져오는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            res.json().then((data) => {
                users.value = data;
            });
        }
    });
}
fetchUsers();

let isUserDialogVisible = ref(false);
let userDialogMode = ref('add');
let editUserId = ref('');

let login_id = ref('');
let name = ref('');
let user_rank = ref(null);
let password = ref('');
let password_confirm = ref('');

function clearUserForm() {
    login_id.value = '';
    name.value = '';
    user_rank.value = null;
    password.value = '';
    password_confirm.value = '';
}

function showUserDialog(mode) {
    userDialogMode.value = mode;
    if (mode === 'add') {
        clearUserForm();
    } else {
        let selectedUser = users.value.find((user) => user.id === editUserId.value);
        login_id.value = selectedUser.login_id;
        name.value = selectedUser.name;
        user_rank.value = selectedUser.user_rank_id;
        password.value = password_confirm.value = '';
    }
    isUserDialogVisible.value = true;
}

function addUser() {
    if (password.value !== password_confirm.value) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    return fetch('/api/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            login_id: login_id.value,
            name: name.value,
            user_rank_id: user_rank.value,
            password: password.value,
        }),
    }).then(async (res) => {
        isUserDialogVisible.value = false;
        if (!res.ok) {
            if (res.status === 401) {
                alert('로그인이 필요합니다.');
                router.push('/');
            }
            alert('사용자 추가에 실패했습니다.\nReason : ' + await res.text());
        } else {
            alert('사용자 추가에 성공했습니다.');
            fetchUsers();
        }
    });
}

function editUser() {
    if (password.value !== password_confirm.value) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    fetch('/api/user/' + editUserId.value, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            login_id: login_id.value,
            name: name.value,
            user_rank_id: user_rank.value,
            password: password.value,
        }),
    }).then(async (res) => {
        isUserDialogVisible.value = false;
        if (!res.ok) {
            if (res.status === 401) {
                alert('로그인이 필요합니다.');
                router.push('/');
            }
            alert('사용자 수정에 실패했습니다.\nReason : ' + await res.text());
        } else {
            alert('사용자 수정에 성공했습니다.');
            fetchUsers();
        }
    });
}

function onUserFormSubmit() {
    let isValid = document.getElementById('add-user-form').checkValidity();
    if (!isValid) {
        alert('입력값을 확인해주세요.');
        return;
    }
    if (userDialogMode.value === 'add')
        addUser();
    else
        editUser();
}

let userRanks = ref([]);

function fetchUserRanks() {
    fetch("/api/user_rank", {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
    }).then(async (res) => {
        if (!res.ok) {
            if (res.status === 401) {
                alert('로그인이 필요합니다.');
                router.push('/');
                return;
            }
            alert('사용자 등급 정보를 가져오는데 실패했습니다.\nReason : ' + await res.text());
        } else {
            res.json().then((data) => {
                userRanks.value = data;
            });
        }
    });
}

fetchUserRanks();

let userRankName = ref('');
let userRankRate = ref(1);


function addUserRank() {
    fetch("/api/user_rank", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        },
        body: JSON.stringify({
            name: userRankName.value,
            commission_rate: userRankRate.value,
        }),
    }).then(async (res) => {
        if (!res.ok) {
            alert('사용자 등급 추가에 실패했습니다.\nReason : ' + await res.text());
        } else {
            alert('사용자 등급 추가에 성공했습니다.');
            fetchUserRanks();
            userRankName.value = '';
            userRankRate.value = 1;
        }
    });
}

let isUserRankDialogVisible = ref(false);

</script>

<template>
    <div style="display: flex;align-items: center;">
        <h1>사용자 관리</h1>
        <div class="button-div">
            <button @click="isUserRankDialogVisible = true" class="basic-button">사용자 등급 관리</button>
            <div style="width: 16px;"></div>
            <button @click="showUserDialog('add')" class="basic-button">사용자 추가</button>
        </div>
    </div>
    <table>
        <thead>
            <tr>
                <th>아이디</th>
                <th>이름</th>
                <th>등급</th>
                <th>권한</th>
                <th>수정</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="user in users" :key="user.id">
                <td>{{ user.login_id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.user_rank?.name }}</td>
                <td>{{ user.is_admin ? "관리자" : "유저" }}</td>
                <td><button @click="editUserId = user.id; showUserDialog('edit')"
                        class="basic-button reset-password">수정</button></td>
            </tr>
        </tbody>
    </table>

    <Dialog v-model:visible="isUserDialogVisible" style="width: 25rem;">
        <template #header>
            <h2 style="text-align: center;width: 100%;">{{ userDialogMode === 'add' ? '사용자 추가' : '사용자 수정' }}</h2>
        </template>
        <form id="add-user-form">
            <div>
                <label for="login_id">아이디</label>
                <input v-model="login_id" type="text" id="login_id" name="login_id" required />
            </div>
            <div>
                <label for="name">이름</label>
                <input v-model="name" type="text" id="name" name="name" required />
            </div>
            <div>
                <label for="rank">등급</label>
                <select id="rank" name="rank" v-model="user_rank">
                    <option v-for="userRank in userRanks" :value="userRank.id">{{ userRank.name }}</option>
                </select>
            </div>
            <div>
                <label for="password">비밀번호</label>
                <input :placeholder="userDialogMode === 'add' ? '' : '(변경 안함)'" v-model="password" type="password"
                    id="password" name="password" :required="userDialogMode === 'add'" />
            </div>
            <div>
                <label for="password_confirm">비밀번호 확인</label>
                <input v-model="password_confirm" type="password" id="password_confirm" name="password_confirm"
                    :required="userDialogMode === 'add'" />
            </div>
        </form>
        <template #footer>
            <button @click="onUserFormSubmit()" class="basic-button">{{ userDialogMode === 'add' ? '추가' : '수정' }}</button>
        </template>
    </Dialog>

    <Dialog v-model:visible="isUserRankDialogVisible" style="width: auto;">
        <template #header>
            <h2 style="text-align: center;width: 100%;">사용자 등급 관리</h2>
        </template>
        <table>
            <thead>
                <th>이름</th>
                <th>수당비율</th>
                <th>삭제/저장</th>
            </thead>
            <tbody>
                <tr v-for="userRank in userRanks" :key="userRank.id">
                    <td>{{ userRank.name }}</td>
                    <td>{{ userRank.commission_rate }}</td>
                    <td><button @click="deleteUserRank(userRank.id)" class="small-button danger-button">삭제</button></td>
                </tr>
                <tr>
                    <td><input type="text" v-model="userRankName" id="installation-type-name" required></td>
                    <td><input type="text" v-model="userRankRate"></td>
                    <td> <button class="small-button" @click="addUserRank">저장</button></td>
                </tr>
            </tbody>
        </table>
        <template #footer>
            <button class="basic-button" @click="isUserRankDialogVisible = false">닫기</button>
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

.button-div {
    display: flex;
    position: absolute;
    right: 2%;
}

.reset-password {
    border-radius: 0.25rem;
    padding: 0.5rem 1rem;
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

input:invalid {
    border-color: red;
}

input[type="checkbox"] {
    width: auto;
    margin-left: 1rem;
}
</style>