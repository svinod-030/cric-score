import "./global.css";
import React, { useEffect, useState } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import './src/i18n';
import UpdateModal from './src/components/UpdateModal';
import { checkVersion, VersionCheckResult } from './src/utils/versionCheckService';

export default function App() {
  const [updateInfo, setUpdateInfo] = useState<VersionCheckResult | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    const performVersionCheck = async () => {
      const result = await checkVersion();
      if (result.isUpdateAvailable) {
        setUpdateInfo(result);
        setShowUpdateModal(true);
      }
    };

    performVersionCheck();
  }, []);

  return (
    <>
      <AppNavigator />
      {updateInfo && (
        <UpdateModal
          visible={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          latestVersion={updateInfo.latestVersion}
          storeUrl={updateInfo.storeUrl}
        />
      )}
    </>
  );
}
