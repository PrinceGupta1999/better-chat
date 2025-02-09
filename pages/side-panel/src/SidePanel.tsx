import '@src/SidePanel.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';

const SidePanel = () => {
  return <></>;
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
