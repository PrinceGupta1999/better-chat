import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

export const homeChatTypes = ['dmSingle', 'dmGroup', 'spaceFollowing', 'spaceAllMention', 'spaceOther'] as const;
export type HomeChatType = (typeof homeChatTypes)[number];

export type HomeChatPreference = Record<HomeChatType, boolean>;

type HomeChatPreferenceStorage = BaseStorage<HomeChatPreference> & {
  toggle: (homeChatType: HomeChatType) => Promise<void>;
};

const storage = createStorage<HomeChatPreference>(
  'homeChatPreference',
  {
    dmGroup: true,
    dmSingle: true,
    spaceAllMention: true,
    spaceFollowing: true,
    spaceOther: false,
  },
  {
    storageEnum: StorageEnum.Sync,
    liveUpdate: true,
  },
);

// You can extend it with your own methods
export const homeChatPreferenceStorage: HomeChatPreferenceStorage = {
  ...storage,
  toggle: async (homeChatType: HomeChatType) => {
    await storage.set(preference => {
      return {
        ...preference,
        [homeChatType]: !preference[homeChatType],
      };
    });
  },
};
