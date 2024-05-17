<script setup>
  import { ref } from 'vue';
  import {useRouter} from 'vue-router';

  let router = useRouter();
  let userId = ref('');
  let password = ref('');
  function login() {
    fetch(`/api/getSession`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userId.value,
        password: password.value,
      })
    })
    .then((res) => {
      if (!res.ok) {
        alert('로그인에 실패했습니다.');
      } else {
        res.text().then((data) => {
          localStorage.setItem('authToken', data);
          router.push('/admin');
        });
      }
    })
    .catch((err) => {
      console.error('로그인 중 에러 발생:', err);
      alert('통신에 실패했습니다.');
    });
  }
</script>

<template>
  <div class="center">
    <h1>관리자 로그인</h1>
    <div>
        <div>
          <label for="userid">아이디</label>
          <input v-model="userId" type="text" id="userid" name="userid" />
        </div>

        <div>
          <label for="password">비밀번호</label>
          <input v-model="password" type="password" id="password" name="password" />
        </div>
        <button class="basic-button" v-on:click="login" type="submit">로그인</button>
      </div>
  </div>
</template>

<style scoped>
h1 {
  margin-bottom: 1rem;
  font-size: 3rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.center {
  display: inline-block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  width: 100%;
}

button {
  margin-top: 1rem;
  position: relative;
  left: 50%;
  translate: -50%;
}
</style>