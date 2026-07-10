import type { HomeChatPreference, HomeChatType } from '@extension/storage';
import { homeChatPreferenceStorage } from '@extension/storage';
import { t } from '@extension/i18n';

const HOME_CHAT_CONTAINER_SELECTOR =
  "[role='region'] [role='list'] > span[id^='space/'], [role='region'] [role='list'] > span[id^='dm/']";
const AUTO_LOAD_SPACER_ID = 'chat-auto-load-spacer';
const PAD_ELEMENT_ID = 'chat-scroll-pad';
const AUTO_LOAD_MAX_ATTEMPTS = 3;
const AUTO_LOAD_SETTLE_MS = 500;
const AUTO_LOAD_TIMEOUT_MS = 1_200;

const getHomeChats = () => Array.from(document.querySelectorAll<HTMLElement>(HOME_CHAT_CONTAINER_SELECTOR));

const applyHomeChatPreference = (preference: HomeChatPreference) => {
  const chats = getHomeChats();
  chats.forEach(chat => {
    processHomeChat(chat, preference);
  });
};

const processHomeChat = (chat: HTMLElement, preference: HomeChatPreference) => {
  const type = classifyHomeChat(chat);
  if (preference[type]) {
    chat.style.removeProperty('display');
  } else {
    chat.style.display = 'none';
  }
};

const READ_FOLLOWING_SVG_PATH =
  'M200-120q-33 0-56.5-23.5T120-200q0-36 20.5-65.5T195-308l85-32v-252q0-12-7-22.5T254-630l-59-22q-34-13-54.5-42.5T120-760q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760q0 36-20.5 65.5T765-652l-85 32v252q0 12 7 22.5t19 15.5l59 22q34 13 54.5 42.5T840-200q0 33-23.5 56.5T760-120zm400-255L223-233q-11 4-17 13t-6 20h560q0-11-6-20t-17-14l-59-22q-35-14-56.5-44T600-368zm160-385H200q0 11 6 20t17 13l59 22q35 14 56.5 44.5T360-592v7l377-142q11-4 17-13t6-20M360-500v130l240-90v-130zm120 20';
const UNREAD_FOLLOWING_SVG_PATH =
  'M200-120q-33 0-56.5-23.5T120-200q0-36 20.5-65.5T195-308l85-32v-252q0-12-7-22.5T254-630l-59-22q-34-13-54.5-42.5T120-760q0-33 23.5-56.5T200-840h337q-8 18-12.5 38.5T520-760H200q0 11 6 20t17 13l59 22q35 14 56.5 44.5T360-592v7l189-71q11 17 24.5 32t30.5 27l-4 7-240 90v130l240-90v-130l4-7q15 11 36 20t40 13v196q0 12 7 22.5t19 15.5l59 22q34 13 54.5 42.5T840-200q0 33-23.5 56.5T760-120zm400-255L223-233q-11 4-17 13t-6 20h560q0-11-6-20t-17-14l-59-22q-35-14-56.5-44T600-368zm120-265q-50 0-85-35t-35-85 35-85 85-35 85 35 35 85-35 85-85 35';

const FOLLOWING_SELECTOR = [
  '[aria-label*="following" i]',
  '[data-tooltip*="following" i]',
  '[title*="following" i]',
  `path[d="${READ_FOLLOWING_SVG_PATH}"]`,
  `path[d="${UNREAD_FOLLOWING_SVG_PATH}"]`,
].join(', ');

const classifyHomeChat = (chat: HTMLElement): HomeChatType => {
  // DMs
  if (chat.id.startsWith('dm/')) {
    return 'dmSingle';
  }
  if (chat.querySelectorAll('img').length > 1) {
    return 'dmGroup';
  }
  // Spaces
  if (chat.querySelector('[data-display-name="@all"], [aria-label="@all"]')) {
    return 'spaceAllMention';
  }
  if (chat.querySelector(FOLLOWING_SELECTOR)) {
    return 'spaceFollowing';
  }
  return 'spaceOther';
};

const HOME_CHAT_IFRAME_URL_ID = 'timeline';
const HOME_CHAT_IFRAME_URL_HOSTNAME = 'chat.google.com';
const GMAIL_URL_HOSTNAME = 'mail.google.com';

const isSupportedChatContext = () => {
  const url = new URL(window.location.href);
  if (url.hostname !== HOME_CHAT_IFRAME_URL_HOSTNAME && url.hostname !== GMAIL_URL_HOSTNAME) return false;
  if (window.top === window) return true;

  return (
    url.hostname === HOME_CHAT_IFRAME_URL_HOSTNAME &&
    (url.pathname.startsWith('/app/') || new URLSearchParams(url.hash).get('id') === HOME_CHAT_IFRAME_URL_ID)
  );
};

const getAffectedHomeChats = (node: Node) => {
  if (!(node instanceof Element)) return [];

  const chats = new Set<HTMLElement>();
  const containingChat = node.closest<HTMLElement>(HOME_CHAT_CONTAINER_SELECTOR);
  if (containingChat) chats.add(containingChat);
  node.querySelectorAll<HTMLElement>(HOME_CHAT_CONTAINER_SELECTOR).forEach(chat => chats.add(chat));
  return Array.from(chats);
};

const getHomeScrollContainer = (chatList: HTMLElement) => {
  let element = chatList.parentElement;
  while (element) {
    const overflowY = window.getComputedStyle(element).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && element.clientHeight > 0) return element;
    element = element.parentElement;
  }
  return null;
};

const getHomeChatLayout = (chats: HTMLElement[]) => {
  const chatList = chats[0]?.parentElement;
  const spacerParent = chatList?.parentElement;
  if (!chatList || !spacerParent) return null;

  const scrollContainer = getHomeScrollContainer(chatList);
  if (!scrollContainer) return null;

  return { chatList, scrollContainer, spacerParent };
};

const isFirstFoldFilled = (chatList: HTMLElement, scrollContainer: HTMLElement) =>
  chatList.getBoundingClientRect().height >= scrollContainer.clientHeight;

const removeLoadingElements = () => {
  document.getElementById(AUTO_LOAD_SPACER_ID)?.remove();
  document.getElementById(PAD_ELEMENT_ID)?.remove();
};

const showScrollPad = (chats: HTMLElement[]) => {
  removeLoadingElements();
  const layout = getHomeChatLayout(chats);
  if (!layout || isFirstFoldFilled(layout.chatList, layout.scrollContainer)) return;

  const chatListHeight = layout.chatList.getBoundingClientRect().height;
  const padElement = document.createElement('div');
  padElement.id = PAD_ELEMENT_ID;
  padElement.textContent = t('homeChatScrollPad');
  padElement.style.height = `${window.innerHeight + 100 - chatListHeight}px`;
  layout.spacerParent.appendChild(padElement);
};

const waitForAnimationFrame = () => new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()));
const waitForTimeout = (timeoutMs: number) => new Promise<void>(resolve => window.setTimeout(resolve, timeoutMs));

const waitForMoreHomeChats = (previousCount: number) =>
  new Promise<boolean>(resolve => {
    const observer = new MutationObserver(() => {
      if (getHomeChats().length > previousCount) finish(true);
    });
    const timeoutId = window.setTimeout(() => finish(false), AUTO_LOAD_TIMEOUT_MS);

    function finish(didLoad: boolean) {
      window.clearTimeout(timeoutId);
      observer.disconnect();
      resolve(didLoad);
    }

    observer.observe(document.body, { childList: true, subtree: true });
  });

const attemptAutomaticLoad = async (chats: HTMLElement[]) => {
  const layout = getHomeChatLayout(chats);
  if (!layout) return false;

  removeLoadingElements();
  const spacer = document.createElement('div');
  spacer.id = AUTO_LOAD_SPACER_ID;
  spacer.setAttribute('aria-hidden', 'true');
  spacer.style.height = `${layout.scrollContainer.clientHeight}px`;
  spacer.style.pointerEvents = 'none';

  const previousScrollTop = layout.scrollContainer.scrollTop;
  const previousScrollBehavior = layout.scrollContainer.style.scrollBehavior;
  const moreChatsPromise = waitForMoreHomeChats(chats.length);

  try {
    layout.spacerParent.appendChild(spacer);
    await waitForAnimationFrame();
    layout.scrollContainer.style.scrollBehavior = 'auto';
    layout.scrollContainer.scrollTop = layout.scrollContainer.scrollHeight;
    return await moreChatsPromise;
  } finally {
    spacer.remove();
    layout.scrollContainer.scrollTop = previousScrollTop;
    layout.scrollContainer.style.scrollBehavior = previousScrollBehavior;
  }
};

const fillHomeFirstFold = async (getPreference: () => HomeChatPreference) => {
  await waitForTimeout(AUTO_LOAD_SETTLE_MS);

  for (let attempt = 0; attempt < AUTO_LOAD_MAX_ATTEMPTS; attempt += 1) {
    const chats = getHomeChats();
    const layout = getHomeChatLayout(chats);
    if (!layout) return;

    chats.forEach(chat => processHomeChat(chat, getPreference()));
    if (isFirstFoldFilled(layout.chatList, layout.scrollContainer)) {
      removeLoadingElements();
      return;
    }

    if (!(await attemptAutomaticLoad(chats))) break;
  }

  const chats = getHomeChats();
  chats.forEach(chat => processHomeChat(chat, getPreference()));
  showScrollPad(chats);
};

const initialize = async () => {
  if (!isSupportedChatContext()) return;

  let preference = await homeChatPreferenceStorage.get();
  let autoFillPromise: Promise<void> | null = null;
  let autoFillQueued = false;
  let lastAutoFillList: HTMLElement | null = null;
  const scheduleAutoFill = () => {
    autoFillQueued = true;
    if (autoFillPromise) return;

    autoFillPromise = (async () => {
      while (autoFillQueued) {
        autoFillQueued = false;
        lastAutoFillList = getHomeChats()[0]?.parentElement ?? null;
        await fillHomeFirstFold(() => preference);
      }
    })().finally(() => {
      autoFillPromise = null;
    });
  };

  applyHomeChatPreference(preference);
  if (getHomeChats().length) scheduleAutoFill();

  const observer = new MutationObserver(mutations => {
    const affectedChats = new Set<HTMLElement>();
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        getAffectedHomeChats(node).forEach(chat => affectedChats.add(chat));
      });
    });

    if (!affectedChats.size) return;
    affectedChats.forEach(chat => processHomeChat(chat, preference));
    const chats = getHomeChats();
    const chatList = chats[0]?.parentElement ?? null;
    if (chatList && chatList !== lastAutoFillList) {
      scheduleAutoFill();
    } else {
      showScrollPad(chats);
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  homeChatPreferenceStorage.subscribe(async () => {
    preference = await homeChatPreferenceStorage.get();
    applyHomeChatPreference(preference);
    if (getHomeChats().length) scheduleAutoFill();
  });
};

initialize();
