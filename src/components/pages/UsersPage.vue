<script setup>
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import router from '@/router';
let users = ref([]);
function fetchUsers() {
    fetch('/api/user',{
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

let isAddUserDialogVisible = ref(false);

let login_id = ref('');
let name = ref('');
let password = ref('');
let password_confirm = ref('');

function clearAddUserForm() {
    login_id.value = '';
    name.value = '';
    password.value = '';
    password_confirm.value = '';
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
            password: password.value,
        }),
    }).then(async (res) => {
        isAddUserDialogVisible.value = false;
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

function onUserAddClick() {
    let isValid = document.getElementById('add-user-form').checkValidity();
    if (!isValid) {
        alert('입력값을 확인해주세요.');
        return;
    }
    addUser();
}
</script>

<template>
    <div style="display: flex;align-items: center;">
        <h1>사용자 관리</h1>
        <button @click="clearAddUserForm();isAddUserDialogVisible=true" class="basic-button" id="add-user">사용자 추가</button>
    </div>
    <table>
        <thead>
            <tr>
                <th>아이디</th>
                <th>이름</th>
                <th>권한</th>
                <th>비밀번호 재설정</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="user in users" :key="user.id">
                <td>{{ user.login_id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.is_admin ? "관리자" : "유저" }}</td>
                <td><button class="basic-button reset-password">비밀번호 재설정</button></td>
            </tr>
        </tbody>
    </table>

    <Dialog v-model:visible="isAddUserDialogVisible" style="width: 25rem;">
        <template #header>
            <h2 style="text-align: center;width: 100%;">사용자 추가</h2>
        </template>
        <form id="add-user-form">
            <div>
                <label for="login_id">아이디</label>
                <input v-model="login_id" type="text" id="login_id" name="login_id" required/>
            </div>
            <div>
                <label for="name">이름</label>
                <input v-model="name" type="text" id="name" name="name" required/>
            </div>
            <div>
                <label for="password">비밀번호</label>
                <input v-model="password" type="password" id="password" name="password" required/>
            </div>
            <div>
                <label for="password_confirm">비밀번호 확인</label>
                <input v-model="password_confirm" type="password" id="password_confirm" name="password_confirm" required/>
            </div>
        </form>
        <template #footer>
            <button @click="onUserAddClick()" class="basic-button">추가</button>
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
th, td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: center;
}

#add-user {
    position: absolute;
    right: 2%;
}

.reset-password {
    border-radius: 0.25rem;
    padding: 0.5rem 1rem;
}

input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    width: 100%;
}

input:invalid {
    border-color: red;
}

input[type="checkbox"] {
    width: auto;
    margin-left: 1rem;
}
</style>