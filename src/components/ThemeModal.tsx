import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { X, Check, Droplet, Flame, Zap, GlassWater, Shield, Sparkles, RefreshCw, Download, ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { Themes, ThemeId } from '../theme/themes';
import { UpdateService, UpdateInfo, CURRENT_VERSION } from '../services/update';

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
}

const APP_ICONS = [
  {
    id: 'Stealth',
    name: 'Stealth',
    subtitle: 'All Black & Gray',
    source: require('../../assets/icon-stealth.png'),
    recommendedFor: 'monochrome',
  },
  {
    id: 'Crimson',
    name: 'Crimson',
    subtitle: 'Neon Red & Black',
    source: require('../../assets/icon-crimson.png'),
    recommendedFor: 'crimson',
  },
  {
    id: 'Frost',
    name: 'Frost',
    subtitle: 'Ice Cyan & Black',
    source: require('../../assets/icon-frost.png'),
    recommendedFor: 'frost',
  },
  {
    id: 'Slate',
    name: 'Slate',
    subtitle: 'Titanium Graphite',
    source: require('../../assets/icon-slate.png'),
    recommendedFor: null,
  },
];

const GAUGE_ICONS = [
  { id: 'droplet', label: 'Droplet', icon: Droplet },
  { id: 'flame', label: 'Flame', icon: Flame },
  { id: 'zap', label: 'Energy', icon: Zap },
  { id: 'glass', label: 'Glass', icon: GlassWater },
  { id: 'shield', label: 'Defense', icon: Shield },
];

export const ThemeModal: React.FC<ThemeModalProps> = ({ visible, onClose }) => {
  const {
    theme,
    themeId,
    colors,
    setThemeId,
    ringIcon,
    setRingIcon,
    appIcon,
    setAppIcon,
    canChangeAppIcon,
  } = useTheme();

  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updateChecked, setUpdateChecked] = useState(false);

  const handleCheckUpdate = async () => {
    try {
      setCheckingUpdate(true);
      const info = await UpdateService.checkForUpdate();
      setUpdateInfo(info);
      setUpdateChecked(true);
      if (info.hasUpdate) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleSelectTheme = async (id: ThemeId) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await setThemeId(id);
  };

  const handleSelectRingIcon = async (iconId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await setRingIcon(iconId);
  };

  const handleSelectAppIcon = async (iconId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    const success = await setAppIcon(iconId);
    if (!success && !canChangeAppIcon) {
      Alert.alert(
        'App Icon Saved',
        `Preference set to "${iconId}". Note: Switching home screen icons requires iOS device deployment.`
      );
    }
  };

  const themeList = Object.values(Themes);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.surfaceBorder }]}>
            <View style={styles.titleRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.cardBadgeBg }]}>
                <Sparkles size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  APPEARANCE & ICONS
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Select theme & personalize your icons
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section 1: Color Themes */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  APP COLOR THEME
                </Text>
                <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                  Active: {theme.name}
                </Text>
              </View>

              <View style={styles.themeList}>
                {themeList.map((item) => {
                  const isSelected = item.id === themeId;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.themeCard,
                        {
                          backgroundColor: item.colors.surfaceLight,
                          borderColor: isSelected ? item.colors.primary : colors.surfaceBorder,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleSelectTheme(item.id)}
                    >
                      <View style={styles.themeCardTop}>
                        <View style={styles.themeColorPills}>
                          <View
                            style={[
                              styles.colorPill,
                              { backgroundColor: item.colors.background, borderColor: '#444', borderWidth: 1 },
                            ]}
                          />
                          <View
                            style={[
                              styles.colorPill,
                              { backgroundColor: item.previewSecondary },
                            ]}
                          />
                          <View
                            style={[
                              styles.colorPill,
                              { backgroundColor: item.previewPrimary },
                            ]}
                          />
                        </View>
                        {item.tag && (
                          <View
                            style={[
                              styles.themeBadge,
                              {
                                backgroundColor: isSelected
                                  ? item.colors.cardBadgeBg
                                  : 'rgba(255,255,255,0.06)',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.themeBadgeText,
                                {
                                  color: isSelected
                                    ? item.colors.primary
                                    : colors.textMuted,
                                },
                              ]}
                            >
                              {item.tag}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.themeInfoRow}>
                        <View style={styles.themeInfoText}>
                          <Text style={[styles.themeName, { color: colors.textPrimary }]}>
                            {item.name}
                          </Text>
                          <Text style={[styles.themeDesc, { color: colors.textMuted }]}>
                            {item.subtitle}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.radioCircle,
                            {
                              borderColor: isSelected ? item.colors.primary : colors.textMuted,
                              backgroundColor: isSelected ? item.colors.primary : 'transparent',
                            },
                          ]}
                        >
                          {isSelected && <Check size={14} color="#000000" strokeWidth={3} />}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 2: Alternate App Launcher Icons */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  APP LAUNCHER ICON
                </Text>
                <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                  Home Screen
                </Text>
              </View>

              <View style={styles.iconGrid}>
                {APP_ICONS.map((icon) => {
                  const isSelected =
                    appIcon === icon.id ||
                    (icon.id === 'Crimson' && appIcon === 'Default');

                  return (
                    <TouchableOpacity
                      key={icon.id}
                      style={[
                        styles.iconCard,
                        {
                          backgroundColor: colors.surfaceLight,
                          borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleSelectAppIcon(icon.id)}
                    >
                      <Image source={icon.source} style={styles.iconPreview} />
                      <Text style={[styles.iconName, { color: colors.textPrimary }]}>
                        {icon.name}
                      </Text>
                      <Text style={[styles.iconSubtitle, { color: colors.textMuted }]}>
                        {icon.subtitle}
                      </Text>

                      {isSelected ? (
                        <View style={[styles.activeIconPill, { backgroundColor: colors.primary }]}>
                          <Check size={12} color="#000000" strokeWidth={3} />
                          <Text style={styles.activeIconPillText}>ACTIVE</Text>
                        </View>
                      ) : (
                        <View style={[styles.inactiveIconPill, { borderColor: colors.surfaceBorder }]}>
                          <Text style={[styles.inactiveIconPillText, { color: colors.textMuted }]}>
                            SET
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 3: Hydration Gauge Center Icon */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  RING CENTER ICON
                </Text>
                <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                  Gauge Symbol
                </Text>
              </View>

              <View style={styles.gaugeIconRow}>
                {GAUGE_ICONS.map((g) => {
                  const Icon = g.icon;
                  const isSelected = ringIcon === g.id;
                  return (
                    <TouchableOpacity
                      key={g.id}
                      style={[
                        styles.gaugeIconBtn,
                        {
                          backgroundColor: isSelected ? colors.cardBadgeBg : colors.surfaceLight,
                          borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => handleSelectRingIcon(g.id)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        size={22}
                        color={isSelected ? colors.primary : colors.textSecondary}
                        fill={isSelected && g.id === 'droplet' ? colors.primary : 'none'}
                      />
                      <Text
                        style={[
                          styles.gaugeIconLabel,
                          {
                            color: isSelected ? colors.primary : colors.textMuted,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 4: Version & Updates */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  APP UPDATES & DOWNLOADS
                </Text>
                <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                  v{CURRENT_VERSION}
                </Text>
              </View>

              <View
                style={[
                  styles.updateCard,
                  {
                    backgroundColor: colors.surfaceLight,
                    borderColor: colors.surfaceBorder,
                  },
                ]}
              >
                <View style={styles.updateCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.updateCardTitle, { color: colors.textPrimary }]}>
                      HydroDark iOS
                    </Text>
                    <Text style={[styles.updateCardSubtitle, { color: colors.textMuted }]}>
                      Installed Version: v{CURRENT_VERSION}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.checkUpdateBtn,
                      {
                        backgroundColor: colors.cardBadgeBg,
                        borderColor: colors.cardBadgeBorder,
                      },
                    ]}
                    onPress={handleCheckUpdate}
                    disabled={checkingUpdate}
                    activeOpacity={0.7}
                  >
                    <RefreshCw size={13} color={colors.primary} />
                    <Text style={[styles.checkUpdateText, { color: colors.primary }]}>
                      {checkingUpdate ? 'Checking...' : 'Check'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Status Notice */}
                {updateChecked && updateInfo ? (
                  updateInfo.hasUpdate ? (
                    <View
                      style={[
                        styles.updateAlertBox,
                        {
                          backgroundColor: colors.cardBadgeBg,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <Text style={[styles.updateAlertTitle, { color: colors.primary }]}>
                        🎉 Update Available: v{updateInfo.latestVersion}
                      </Text>
                      <Text style={[styles.updateAlertDesc, { color: colors.textSecondary }]}>
                        {updateInfo.releaseName || 'A new build has been published.'}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.upToDateBox,
                        { borderColor: colors.surfaceBorder, backgroundColor: colors.surface },
                      ]}
                    >
                      <Check size={15} color={colors.success} />
                      <Text style={[styles.upToDateText, { color: colors.textSecondary }]}>
                        Up to date! Latest release matches v{CURRENT_VERSION}.
                      </Text>
                    </View>
                  )
                ) : null}

                {/* Always-accessible Quick Links to download newest version */}
                <View style={styles.updateActionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.sourceBtn,
                      {
                        borderColor: colors.primary,
                        backgroundColor: colors.cardBadgeBg,
                      },
                    ]}
                    onPress={() => UpdateService.openAltStoreSource()}
                    activeOpacity={0.8}
                  >
                    <Sparkles size={14} color={colors.primary} />
                    <Text style={[styles.sourceBtnText, { color: colors.primary }]}>
                      + Add AltStore Source (Auto-Updates)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.downloadIpaBtn, { backgroundColor: colors.primary }]}
                    onPress={() => UpdateService.openUpdate(updateInfo || {
                      hasUpdate: false,
                      currentVersion: CURRENT_VERSION,
                      latestVersion: CURRENT_VERSION,
                      releaseName: '',
                      releaseNotes: '',
                      publishedAt: '',
                      downloadUrl: 'https://github.com/geky0/water-app/releases/latest/download/HydroDark.ipa',
                      htmlUrl: 'https://github.com/geky0/water-app/releases/latest',
                      altStoreUrl: 'altstore://install?url=https%3A%2F%2Fgithub.com%2Fgeky0%2Fwater-app%2Freleases%2Flatest%2Fdownload%2FHydroDark.ipa',
                    }, false)}
                    activeOpacity={0.8}
                  >
                    <Download size={15} color="#000000" />
                    <Text style={styles.downloadIpaText}>Download Newest IPA</Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryLinkRow}>
                    <TouchableOpacity
                      style={[
                        styles.altStoreBtn,
                        {
                          flex: 1,
                          borderColor: colors.surfaceBorder,
                          backgroundColor: colors.surface,
                        },
                      ]}
                      onPress={() => UpdateService.openUpdate(updateInfo || {
                        hasUpdate: false,
                        currentVersion: CURRENT_VERSION,
                        latestVersion: CURRENT_VERSION,
                        releaseName: '',
                        releaseNotes: '',
                        publishedAt: '',
                        downloadUrl: 'https://github.com/geky0/water-app/releases/latest/download/HydroDark.ipa',
                        htmlUrl: 'https://github.com/geky0/water-app/releases/latest',
                        altStoreUrl: 'altstore://install?url=https%3A%2F%2Fgithub.com%2Fgeky0%2Fwater-app%2Freleases%2Flatest%2Fdownload%2FHydroDark.ipa',
                      }, true)}
                      activeOpacity={0.7}
                    >
                      <ExternalLink size={13} color={colors.textSecondary} />
                      <Text style={[styles.altStoreText, { color: colors.textSecondary }]}>
                        AltStore Install
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.altStoreBtn,
                        {
                          flex: 1,
                          borderColor: colors.surfaceBorder,
                          backgroundColor: colors.surface,
                        },
                      ]}
                      onPress={() => UpdateService.openReleasesPage()}
                      activeOpacity={0.7}
                    >
                      <ExternalLink size={13} color={colors.textSecondary} />
                      <Text style={[styles.altStoreText, { color: colors.textSecondary }]}>
                        GitHub Release
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Done Button */}
          <View style={[styles.footer, { borderTopColor: colors.surfaceBorder }]}>
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollArea: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingVertical: 18,
    gap: 22,
  },
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sectionHint: {
    fontSize: 12,
  },
  themeList: {
    gap: 10,
  },
  themeCard: {
    borderRadius: 16,
    padding: 14,
  },
  themeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  themeColorPills: {
    flexDirection: 'row',
    gap: 6,
  },
  colorPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  themeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  themeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  themeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeInfoText: {
    flex: 1,
  },
  themeName: {
    fontSize: 15,
    fontWeight: '700',
  },
  themeDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconCard: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  iconPreview: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginBottom: 8,
  },
  iconName: {
    fontSize: 14,
    fontWeight: '700',
  },
  iconSubtitle: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 8,
  },
  activeIconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeIconPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  inactiveIconPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  inactiveIconPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  gaugeIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  gaugeIconBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 14,
    gap: 6,
  },
  gaugeIconLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  doneButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  updateCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  updateCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  updateCardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  checkUpdateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  checkUpdateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  updateResult: {
    marginTop: 4,
  },
  updateAlertBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  updateAlertTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  updateAlertDesc: {
    fontSize: 12,
  },
  updateActionButtons: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 4,
  },
  sourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  sourceBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  downloadIpaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
  },
  downloadIpaText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  secondaryLinkRow: {
    flexDirection: 'row',
    gap: 8,
  },
  altStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  altStoreText: {
    fontSize: 11,
    fontWeight: '600',
  },
  upToDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  upToDateText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
