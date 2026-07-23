import type { HomeChatPreference, HomeChatType } from '@extension/storage';
import { homeChatPreferenceStorage } from '@extension/storage';
import { t } from '@extension/i18n';

const HOME_CHAT_CONTAINER_SELECTOR =
  "[role='region'] [role='list'] > span[id^='space/'], [role='region'] [role='list'] > span[id^='dm/']";
const MENTION_CHAT_CONTAINER_SELECTOR =
  "[role='region'] > [role='link']:has([data-group-id^='space/'], [data-group-id^='dm/'])";
const CHAT_CONTAINER_SELECTOR = `${HOME_CHAT_CONTAINER_SELECTOR}, ${MENTION_CHAT_CONTAINER_SELECTOR}`;
const CHAT_GROUP_ID_SELECTOR = "[data-group-id^='space/'], [data-group-id^='dm/']";
const PAD_ELEMENT_ID = 'chat-scroll-pad';

const getChats = () => Array.from(document.querySelectorAll<HTMLElement>(CHAT_CONTAINER_SELECTOR));

const applyChatPreference = (preference: HomeChatPreference) => {
  const chats = getChats();
  chats.forEach(chat => {
    processChat(chat, preference);
  });
};

const processChat = (chat: HTMLElement, preference: HomeChatPreference) => {
  const type = classifyChat(chat);
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
const FOLLOWING_MATERIAL_ICON_NAMES = new Set(['spool', 'spool_unread']);

const hasExactLeafText = (chat: HTMLElement, text: string) =>
  Array.from(chat.querySelectorAll<HTMLElement>('span')).some(
    element => element.children.length === 0 && element.textContent?.trim() === text,
  );

const hasFollowingMarker = (chat: HTMLElement) =>
  chat.hasAttribute('data-topic-id') ||
  Boolean(chat.querySelector('[data-topic-id]')) ||
  (hasExactLeafText(chat, 'Latest reply') && hasExactLeafText(chat, 'Message')) ||
  Boolean(chat.querySelector(FOLLOWING_SELECTOR)) ||
  Array.from(chat.querySelectorAll<HTMLElement>('[aria-hidden="true"]')).some(element =>
    FOLLOWING_MATERIAL_ICON_NAMES.has(element.textContent?.trim() ?? ''),
  );

const hasAllMention = (chat: HTMLElement) =>
  Boolean(chat.querySelector('[data-display-name="@all"], [aria-label="@all"]')) ||
  /(^|[^\w])@all\b/i.test(chat.textContent ?? '');

const getChatIdentifier = (chat: HTMLElement) =>
  chat.id ||
  chat.getAttribute('data-group-id') ||
  chat.querySelector(CHAT_GROUP_ID_SELECTOR)?.getAttribute('data-group-id') ||
  '';

const classifyChat = (chat: HTMLElement): HomeChatType => {
  const chatIdentifier = getChatIdentifier(chat);

  // DMs
  if (chatIdentifier.startsWith('dm/')) {
    return 'dmSingle';
  }
  if (chat.querySelectorAll('img').length > 1) {
    return 'dmGroup';
  }
  // Spaces
  if (hasAllMention(chat)) {
    return 'spaceAllMention';
  }
  if (hasFollowingMarker(chat)) {
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

const getAffectedChats = (node: Node) => {
  const element = node instanceof Element ? node : node.parentElement;
  if (!element) return [];

  const chats = new Set<HTMLElement>();
  const containingChat = element.closest<HTMLElement>(CHAT_CONTAINER_SELECTOR);
  if (containingChat) chats.add(containingChat);
  element.querySelectorAll<HTMLElement>(CHAT_CONTAINER_SELECTOR).forEach(chat => chats.add(chat));
  return Array.from(chats);
};

const getScrollContainer = (chatList: HTMLElement) => {
  let element: HTMLElement | null = chatList;
  while (element) {
    const overflowY = window.getComputedStyle(element).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && element.clientHeight > 0) return element;
    element = element.parentElement;
  }
  return null;
};

const getChatLayout = (chats: HTMLElement[]) => {
  const chatList = chats[0]?.parentElement;
  if (!chatList) return null;

  const scrollContainer = getScrollContainer(chatList);
  if (!scrollContainer) return null;

  const spacerParent = scrollContainer === chatList ? chatList : chatList.parentElement;
  if (!spacerParent) return null;

  return { chatList, scrollContainer, spacerParent };
};

const getVisibleChatContentHeight = (chats: HTMLElement[], scrollContainer: HTMLElement) => {
  const lastVisibleChat = chats.findLast(chat => window.getComputedStyle(chat).display !== 'none');
  if (!lastVisibleChat) return 0;

  const scrollContainerTop = scrollContainer.getBoundingClientRect().top;
  return lastVisibleChat.getBoundingClientRect().bottom - scrollContainerTop + scrollContainer.scrollTop;
};

const removeScrollPad = () => {
  document.getElementById(PAD_ELEMENT_ID)?.remove();
};

const showScrollPad = (chats: HTMLElement[]) => {
  removeScrollPad();
  const layout = getChatLayout(chats);
  if (!layout) return;

  const chatContentHeight = getVisibleChatContentHeight(chats, layout.scrollContainer);
  if (chatContentHeight >= layout.scrollContainer.clientHeight) return;

  const padElement = document.createElement('div');
  padElement.id = PAD_ELEMENT_ID;
  padElement.textContent = t('homeChatScrollPad');
  padElement.style.boxSizing = 'border-box';
  padElement.style.height = `${Math.ceil(layout.scrollContainer.clientHeight + 100 - chatContentHeight)}px`;
  padElement.style.flexShrink = '0';
  padElement.style.padding = '16px';
  padElement.style.textAlign = 'center';
  padElement.style.backgroundColor = '#eeeeee';
  padElement.style.color = '#666666';
  layout.spacerParent.appendChild(padElement);
};

const initialize = async () => {
  if (!isSupportedChatContext()) return;

  let preference = await homeChatPreferenceStorage.get();

  applyChatPreference(preference);
  showScrollPad(getChats());

  const observer = new MutationObserver(mutations => {
    const affectedChats = new Set<HTMLElement>();
    mutations.forEach(mutation => {
      const affectedNodes = mutation.type === 'childList' ? mutation.addedNodes : [mutation.target];
      affectedNodes.forEach(node => {
        getAffectedChats(node).forEach(chat => affectedChats.add(chat));
      });
    });

    if (!affectedChats.size) return;
    affectedChats.forEach(chat => processChat(chat, preference));
    showScrollPad(getChats());
  });
  observer.observe(document.body, {
    attributeFilter: ['aria-label', 'data-display-name', 'data-topic-id'],
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });

  homeChatPreferenceStorage.subscribe(async () => {
    preference = await homeChatPreferenceStorage.get();
    applyChatPreference(preference);
    showScrollPad(getChats());
  });
};

initialize();
