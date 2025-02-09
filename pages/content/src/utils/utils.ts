export const waitQuerySelectorAll = <T extends Element>(selector: string): Promise<NodeListOf<T>> => {
  return new Promise(resolve => {
    const elements = document.querySelectorAll<T>(selector);
    if (elements.length) {
      return resolve(elements);
    }

    const observer = new MutationObserver(() => {
      const elements = document.querySelectorAll<T>(selector);
      if (elements.length) {
        observer.disconnect();
        return resolve(elements);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};
