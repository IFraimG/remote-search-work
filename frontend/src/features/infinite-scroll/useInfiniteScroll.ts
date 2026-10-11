import { ref, onMounted, onUnmounted, Ref } from 'vue';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void | Promise<void>;
  hasMore: Ref<boolean>;
  isLoading: Ref<boolean>;
  distance?: number;
}

export function useInfiniteScroll(
  sentinelRef: Ref<HTMLElement | null>,
  options: UseInfiniteScrollOptions
) {
  let observer: IntersectionObserver | null = null;
  const isTriggering = ref(false);

  const handleIntersect = async (entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    if (
      entry.isIntersecting &&
      options.hasMore.value &&
      !options.isLoading.value &&
      !isTriggering.value
    ) {
      isTriggering.value = true;
      try {
        await options.onLoadMore();
      } finally {
        isTriggering.value = false;
      }
    }
  };

  onMounted(() => {
    observer = new IntersectionObserver(handleIntersect, {
      rootMargin: `${options.distance || 250}px`,
      threshold: 0.1,
    });

    if (sentinelRef.value) {
      observer.observe(sentinelRef.value);
    }
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });

  const reobserve = () => {
    if (observer && sentinelRef.value) {
      observer.unobserve(sentinelRef.value);
      observer.observe(sentinelRef.value);
    }
  };

  return {
    reobserve,
  };
}
