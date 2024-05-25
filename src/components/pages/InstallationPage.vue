<script setup>
import { ref } from 'vue';
fetch('/api/installation').then(async (res) => {
    if (!res.ok) {
        alert('설치 정보를 가져오는데 실패했습니다.\nReason : ' + await res.text());
    } else {
        res.json().then((data) => {
            installations.value = data;
        });
    }
});
</script>