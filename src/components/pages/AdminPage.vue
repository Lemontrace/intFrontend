<script setup>
</script>

<template>
    <div style="position:fixed;display: flex; width: 100%; height: 100%;">
        <div class="sidebar">
                <router-link to="/admin/users">사용자 관리</router-link>
                <router-link to="/admin/products">제품 관리</router-link>
                <router-link to="/admin/afterservices">A/S 관리</router-link>
                <router-link to="/admin/categories">카테고리 관리</router-link>
                <router-link to="/admin/sales">영업 목록</router-link>
                <router-link to="/admin/installations">설치 목록</router-link>
        </div>
        <div class="content">
            <router-view></router-view>
        </div>
    </div>
</template>

<style scoped>
.sidebar {
    width: 200px;
    background-color: #f0f0f0;
    padding: 1rem;
    padding-top: 200px;
}

.sidebar a {
    display: block;
    margin-bottom: 1rem;
    text-decoration: none;
    color: black;
}

.content {
    width: calc(100% - 200px);
}

</style>