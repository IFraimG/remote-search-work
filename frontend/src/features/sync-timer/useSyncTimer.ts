import { ref, computed, onMounted, onUnmounted } from 'vue';
import { fetchStatus, triggerRefresh } from '@/shared/api/client.js';
import { StatusResponse } from '@/shared/types/index.js';

export function useSyncTimer() {
  const statusData = ref<StatusResponse | null>(null);
  const secondsRemaining = ref<number>(600); // 10 minutes default
  const isRefreshing = ref<boolean>(false);
  const error = ref<string | null>(null);
  let timerId: number | null = null;
  let pollId: number | null = null;

  const loadStatus = async () => {
    try {
      const data = await fetchStatus();
      statusData.value = data;
      error.value = null;

      if (data.meta.nextSyncAt) {
        const nextTime = new Date(data.meta.nextSyncAt).getTime();
        const diffSeconds = Math.max(0, Math.floor((nextTime - Date.now()) / 1000));
        secondsRemaining.value = diffSeconds;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка соединения с сервером';
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing.value) return;
    isRefreshing.value = true;
    try {
      await triggerRefresh();
      // wait 2 seconds then reload status
      setTimeout(async () => {
        await loadStatus();
        isRefreshing.value = false;
      }, 2000);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось запустить обновление';
      isRefreshing.value = false;
    }
  };

  const formattedCountdown = computed(() => {
    const mins = Math.floor(secondsRemaining.value / 60);
    const secs = secondsRemaining.value % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  });

  onMounted(() => {
    loadStatus();

    // Tick countdown every second
    timerId = window.setInterval(() => {
      if (secondsRemaining.value > 0) {
        secondsRemaining.value--;
      } else {
        // When timer hits 0, trigger status reload
        loadStatus();
      }
    }, 1000);

    // Refresh status check every 30 seconds
    pollId = window.setInterval(loadStatus, 30000);
  });

  onUnmounted(() => {
    if (timerId) clearInterval(timerId);
    if (pollId) clearInterval(pollId);
  });

  return {
    statusData,
    secondsRemaining,
    formattedCountdown,
    isRefreshing,
    error,
    loadStatus,
    handleRefresh,
  };
}
