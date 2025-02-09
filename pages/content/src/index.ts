import { waitQuerySelectorAll } from '@src/utils/utils';
import type { HomeChatPreference, HomeChatType } from '@extension/storage';
import { homeChatPreferenceStorage } from '@extension/storage';
import { t } from '@extension/i18n';

const HOME_CHAT_CONTAINER_SELECTOR = "span[id^='space/'], span[id^='dm/']";
const PAD_ELEMENT_ID = 'chat-scroll-pad';

const applyHomeChatPreference = async () => {
  const preference = await homeChatPreferenceStorage.get();
  const chats = await waitQuerySelectorAll<HTMLElement>(HOME_CHAT_CONTAINER_SELECTOR);
  chats.forEach(chat => {
    processHomeChat(chat, preference);
  });
  // setup observing for mutations
  const chatParentContainer = chats[0].parentElement!;
  const addScrollPadElement = () => {
    // Remove existing pad element if any
    const existingPad = document.getElementById(PAD_ELEMENT_ID);
    if (existingPad) {
      existingPad.remove();
    }

    // Calculate container and window heights
    const containerHeight = chatParentContainer.getBoundingClientRect().height;
    const windowHeight = window.innerHeight;

    // Only add pad if container is shorter than window
    if (containerHeight < windowHeight) {
      const padElement = document.createElement('div');
      padElement.id = PAD_ELEMENT_ID;
      // padElement.style.cssText =
      //   'background-color: #333; text-align: center; color: #666; padding: 20px; font-size: 14px;';
      padElement.textContent = t('homeChatScrollPad');
      padElement.style.height = `${windowHeight + 100 - containerHeight}px`;
      chatParentContainer.parentElement!.appendChild(padElement);
    }
  };

  // Check initial height
  addScrollPadElement();

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            processHomeChat(node as HTMLElement, preference);
          }
        });
        // Check height after processing new nodes
        addScrollPadElement();
      }
    });
  });
  observer.observe(chatParentContainer, {
    childList: true,
  });
  return observer;
};

const processHomeChat = (chat: HTMLElement, preference: HomeChatPreference) => {
  const type = classifyHomeChat(chat);
  chat.style.display = preference[type] ? 'block' : 'none';
};

const READ_FOLLOWING_SVG_PATH =
  'M200-120q-33 0-56.5-23.5T120-200q0-36 20.5-65.5T195-308l85-32v-252q0-12-7-22.5T254-630l-59-22q-34-13-54.5-42.5T120-760q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760q0 36-20.5 65.5T765-652l-85 32v252q0 12 7 22.5t19 15.5l59 22q34 13 54.5 42.5T840-200q0 33-23.5 56.5T760-120zm400-255L223-233q-11 4-17 13t-6 20h560q0-11-6-20t-17-14l-59-22q-35-14-56.5-44T600-368zm160-385H200q0 11 6 20t17 13l59 22q35 14 56.5 44.5T360-592v7l377-142q11-4 17-13t6-20M360-500v130l240-90v-130zm120 20';
const UNREAD_FOLLOWING_SVG_PATH =
  'M200-120q-33 0-56.5-23.5T120-200q0-36 20.5-65.5T195-308l85-32v-252q0-12-7-22.5T254-630l-59-22q-34-13-54.5-42.5T120-760q0-33 23.5-56.5T200-840h337q-8 18-12.5 38.5T520-760H200q0 11 6 20t17 13l59 22q35 14 56.5 44.5T360-592v7l189-71q11 17 24.5 32t30.5 27l-4 7-240 90v130l240-90v-130l4-7q15 11 36 20t40 13v196q0 12 7 22.5t19 15.5l59 22q34 13 54.5 42.5T840-200q0 33-23.5 56.5T760-120zm400-255L223-233q-11 4-17 13t-6 20h560q0-11-6-20t-17-14l-59-22q-35-14-56.5-44T600-368zm120-265q-50 0-85-35t-35-85 35-85 85-35 85 35 35 85-35 85-85 35';
const classifyHomeChat = (chat: HTMLElement): HomeChatType => {
  // DMs
  if (chat.id.startsWith('dm/')) {
    return 'dmSingle';
  }
  if (chat.querySelectorAll('img').length > 1) {
    return 'dmGroup';
  }
  // Spaces
  if (chat.querySelector('span[data-display-name="@all"]')) {
    return 'spaceAllMention';
  }
  if (chat.querySelector(`path[d="${READ_FOLLOWING_SVG_PATH}"], path[d="${UNREAD_FOLLOWING_SVG_PATH}"]`)) {
    return 'spaceFollowing';
  }
  return 'spaceOther';
};

const HOME_CHAT_IFRAME_URL_ID = 'timeline';
const HOME_CHAT_IFRAME_URL_HOSTNAME = 'chat.google.com';
const initialize = async () => {
  // not an iframe
  if (window.top === window) return;
  if (
    new URL(window.location.href).hostname !== HOME_CHAT_IFRAME_URL_HOSTNAME ||
    new URLSearchParams(window.location.hash).get('id') !== HOME_CHAT_IFRAME_URL_ID
  )
    return;
  let observer = await applyHomeChatPreference();
  homeChatPreferenceStorage.subscribe(async () => {
    observer.disconnect();
    observer = await applyHomeChatPreference();
  });
};

initialize();
