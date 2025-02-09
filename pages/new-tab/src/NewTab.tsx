import '@src/NewTab.css';
import '@src/NewTab.scss';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { t } from '@extension/i18n';

const NewTab = () => {
  return <></>;
};

export default withErrorBoundary(withSuspense(NewTab, <div>{t('loading')}</div>), <div> Error Occur </div>);
