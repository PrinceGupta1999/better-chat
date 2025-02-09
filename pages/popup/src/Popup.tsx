import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { homeChatPreferenceStorage, type HomeChatType } from '@extension/storage';
import { Switch, Typography } from '@extension/ui';
import { t } from '@extension/i18n';

const Popup = () => {
  const homeChatPreference = useStorage(homeChatPreferenceStorage);

  return (
    <div className="p-4 space-y-2">
      <Typography variant="h5">{t('homeChatPreferences')}</Typography>

      <div className="space-y-1">
        <Typography variant="h6">{t('directMessages')}</Typography>
        <div>
          {(['dmSingle', 'dmGroup'] satisfies HomeChatType[]).map(type => (
            <div className="flex items-center justify-between" key={type}>
              <Typography>{t(type)}</Typography>
              <Switch
                size="sm"
                checked={homeChatPreference[type]}
                onCheckedChange={() => homeChatPreferenceStorage.toggle(type)}
              />
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <Typography variant="h6">{t('directMessages')}</Typography>
          <div>
            {(['spaceFollowing', 'spaceAllMention', 'spaceOther'] satisfies HomeChatType[]).map(type => (
              <div className="flex items-center justify-between" key={type}>
                <Typography>{t(type)}</Typography>
                <Switch
                  size="sm"
                  checked={homeChatPreference[type]}
                  onCheckedChange={() => homeChatPreferenceStorage.toggle(type)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>{t('loading')}</div>), <div>{t('error')}</div>);
