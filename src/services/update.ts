import { Linking, Platform } from 'react-native';
import appConfig from '../../app.json';

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  downloadUrl: string;
  htmlUrl: string;
  altStoreUrl: string;
}

const GITHUB_REPO = 'geky0/water-app';
export const CURRENT_VERSION = appConfig.expo.version || '1.0.0';

export const UpdateService = {
  async checkForUpdate(): Promise<UpdateInfo> {
    const defaultInfo: UpdateInfo = {
      hasUpdate: false,
      currentVersion: CURRENT_VERSION,
      latestVersion: CURRENT_VERSION,
      releaseName: '',
      releaseNotes: '',
      publishedAt: '',
      downloadUrl: `https://github.com/${GITHUB_REPO}/releases/latest/download/HydroDark.ipa`,
      htmlUrl: `https://github.com/${GITHUB_REPO}/releases/latest`,
      altStoreUrl: `altstore://install?url=https://github.com/${GITHUB_REPO}/releases/latest/download/HydroDark.ipa`,
    };

    try {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'HydroDark-App',
        },
      });

      if (!response.ok) {
        return defaultInfo;
      }

      const data = await response.json();
      const tagName = (data.tag_name || '').replace(/^v/, '');
      const ipaAsset = (data.assets || []).find((a: any) =>
        a.name && a.name.toLowerCase().endsWith('.ipa')
      );

      const downloadUrl = ipaAsset
        ? ipaAsset.browser_download_url
        : `https://github.com/${GITHUB_REPO}/releases/latest/download/HydroDark.ipa`;

      const hasUpdate = this.compareVersions(tagName, CURRENT_VERSION) > 0;

      return {
        hasUpdate,
        currentVersion: CURRENT_VERSION,
        latestVersion: tagName || CURRENT_VERSION,
        releaseName: data.name || `Version ${tagName}`,
        releaseNotes: data.body || 'New enhancements and bug fixes.',
        publishedAt: data.published_at || '',
        downloadUrl,
        htmlUrl: data.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`,
        altStoreUrl: `altstore://install?url=${encodeURIComponent(downloadUrl)}`,
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return defaultInfo;
    }
  },

  compareVersions(v1: string, v2: string): number {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    const len = Math.max(p1.length, p2.length);

    for (let i = 0; i < len; i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  },

  async openUpdate(updateInfo: UpdateInfo, preferAltStore = false): Promise<void> {
    try {
      if (preferAltStore) {
        const canAltStore = await Linking.canOpenURL('altstore://');
        if (canAltStore) {
          await Linking.openURL(updateInfo.altStoreUrl);
          return;
        }
      }
      await Linking.openURL(updateInfo.downloadUrl);
    } catch (e) {
      console.error('Error opening update link:', e);
      // Fallback to release page
      await Linking.openURL(updateInfo.htmlUrl);
    }
  },

  async openReleasesPage(): Promise<void> {
    try {
      await Linking.openURL(`https://github.com/${GITHUB_REPO}/releases`);
    } catch (e) {
      console.error('Error opening releases page:', e);
    }
  },
};
