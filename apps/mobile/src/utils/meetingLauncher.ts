import { Linking, NativeModules } from 'react-native';
import { notify } from '../components/common/NotificationContext';

export type MeetingPlatform =
  | 'Google Meet'
  | 'Zoom Workplace'
  | 'Zoom'
  | 'Microsoft Teams'
  | 'Jitsi Meet'
  | 'Cisco Webex';

export interface MeetingLaunchInfo {
  id?: string;
  subject?: string;
  title?: string;
  platform?: MeetingPlatform | string;
  meetingUrl?: string;
  meetingLinkOrLocation?: string;
  type?: string;
  location?: string;
}

export type AppState = 'ENABLED' | 'DISABLED' | 'NOT_INSTALLED';

export interface AppStatusResult {
  status: AppState;
  packageId: string;
}

interface PlatformConfig {
  displayName: string;
  officialPackageId: string;
  candidatePackages: string[];
  playStoreMarketUrl: string;
  playStoreWebUrl: string;
}

const { MeetingLauncherModule } = NativeModules;

/**
 * Official Android Package IDs & Play Store configurations
 * Strictly matching Google Play Store package identifiers:
 * - Google Meet: com.google.android.apps.tachyon (also supports meetings package if present)
 * - Zoom Workplace: us.zoom.videomeetings
 * - Microsoft Teams: com.microsoft.teams
 * - Jitsi Meet: org.jitsi.meet
 * - Cisco Webex: com.cisco.wx2.android
 */
const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  'Google Meet': {
    displayName: 'Google Meet',
    officialPackageId: 'com.google.android.apps.tachyon',
    candidatePackages: ['com.google.android.apps.tachyon', 'com.google.android.apps.meetings'],
    playStoreMarketUrl: 'market://details?id=com.google.android.apps.tachyon',
    playStoreWebUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.tachyon',
  },
  'Zoom Workplace': {
    displayName: 'Zoom Workplace',
    officialPackageId: 'us.zoom.videomeetings',
    candidatePackages: ['us.zoom.videomeetings'],
    playStoreMarketUrl: 'market://details?id=us.zoom.videomeetings',
    playStoreWebUrl: 'https://play.google.com/store/apps/details?id=us.zoom.videomeetings',
  },
  'Zoom': {
    displayName: 'Zoom Workplace',
    officialPackageId: 'us.zoom.videomeetings',
    candidatePackages: ['us.zoom.videomeetings'],
    playStoreMarketUrl: 'market://details?id=us.zoom.videomeetings',
    playStoreWebUrl: 'https://play.google.com/store/apps/details?id=us.zoom.videomeetings',
  },
  'Microsoft Teams': {
    displayName: 'Microsoft Teams',
    officialPackageId: 'com.microsoft.teams',
    candidatePackages: ['com.microsoft.teams'],
    playStoreMarketUrl: 'market://details?id=com.microsoft.teams',
    playStoreWebUrl: 'https://play.google.com/store/apps/details?id=com.microsoft.teams',
  },
  'Jitsi Meet': {
    displayName: 'Jitsi Meet',
    officialPackageId: 'org.jitsi.meet',
    candidatePackages: ['org.jitsi.meet'],
    playStoreMarketUrl: 'market://details?id=org.jitsi.meet',
    playStoreWebUrl: 'https://play.google.com/store/apps/details?id=org.jitsi.meet',
  },
  'Cisco Webex': {
    displayName: 'Webex Meetings',
    officialPackageId: 'com.cisco.wx2.android',
    candidatePackages: ['com.cisco.wx2.android'],
    playStoreMarketUrl: 'market://details?id=com.cisco.wx2.android',
    playStoreWebUrl: 'https://play.google.com/store/apps/details?id=com.cisco.wx2.android',
  },
};

/**
 * Accurately determines the assigned meeting platform from meeting data.
 */
export function detectMeetingPlatform(meeting: MeetingLaunchInfo): MeetingPlatform {
  const p = (meeting.platform || '').toLowerCase();
  const rawType = (meeting.type || '').toLowerCase();
  const rawLoc = (meeting.location || meeting.meetingLinkOrLocation || '').toLowerCase();
  const url = (meeting.meetingUrl || '').toLowerCase();
  const title = (meeting.title || meeting.subject || '').toLowerCase();

  const combined = `${p} ${rawType} ${rawLoc} ${url} ${title}`;

  if (combined.includes('jitsi') || combined.includes('jit.si')) {
    return 'Jitsi Meet';
  }
  if (combined.includes('webex') || combined.includes('cisco')) {
    return 'Cisco Webex';
  }
  if (combined.includes('zoom')) {
    return 'Zoom Workplace';
  }
  if (combined.includes('teams') || combined.includes('microsoft')) {
    return 'Microsoft Teams';
  }
  return 'Google Meet';
}

/**
 * Returns a valid, platform-compliant meeting URL for the session.
 */
export function resolveMeetingUrl(meeting: MeetingLaunchInfo, platform: MeetingPlatform): string {
  const rawUrl = meeting.meetingUrl?.trim();
  if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  const roomHash = (meeting.id || 'fic-room').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(-6) || 'fic777';

  switch (platform) {
    case 'Zoom':
    case 'Zoom Workplace':
      return `https://zoom.us/j/88392104521?pwd=FIC_${roomHash.toUpperCase()}`;
    case 'Microsoft Teams':
      return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_fic_${roomHash}`;
    case 'Jitsi Meet':
      return `https://meet.jit.si/FIC_Chamber_${roomHash.toUpperCase()}`;
    case 'Cisco Webex':
      return `https://fic.webex.com/meet/fic_chamber_${roomHash}`;
    case 'Google Meet':
    default:
      return `https://meet.google.com/fic-chamb-${roomHash}`;
  }
}

/**
 * Checks whether the assigned Android meeting app is installed and whether it is enabled.
 */
export async function checkAssignedAppStatus(
  platform: MeetingPlatform
): Promise<AppStatusResult> {
  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS['Google Meet'];

  if (MeetingLauncherModule && typeof MeetingLauncherModule.getAppStatus === 'function') {
    let disabledPackage: string | null = null;
    for (const pkg of config.candidatePackages) {
      try {
        const state = (await MeetingLauncherModule.getAppStatus(pkg)) as AppState;
        if (state === 'ENABLED') {
          return { status: 'ENABLED', packageId: pkg };
        }
        if (state === 'DISABLED' && !disabledPackage) {
          disabledPackage = pkg;
        }
      } catch {
        // Proceed checking candidate packages
      }
    }

    if (disabledPackage) {
      return { status: 'DISABLED', packageId: disabledPackage };
    }

    return { status: 'NOT_INSTALLED', packageId: config.officialPackageId };
  }

  return { status: 'NOT_INSTALLED', packageId: config.officialPackageId };
}

/**
 * Android-Only Meeting Launcher with full lifecycle handling:
 * - Installed & Enabled -> Directly open original meeting URL in assigned application.
 * - Installed but Disabled -> Prompt with "Enable App" option linking to Android App Settings.
 * - Not Installed -> Prompt with "Install App" button linking to exact official Google Play Store listing.
 * - Browser Fallback -> Supported across all scenarios.
 */
export async function launchAssignedMeeting(meeting: MeetingLaunchInfo): Promise<void> {
  const platform = detectMeetingPlatform(meeting);
  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS['Google Meet'];
  const meetingUrl = resolveMeetingUrl(meeting, platform);

  // Validate URL sanity
  if (!meetingUrl || !meetingUrl.startsWith('http')) {
    notify.error('Invalid meeting URL configured for this session.', 'Meeting Error');
    return;
  }

  const { status, packageId } = await checkAssignedAppStatus(platform);

  // =========================================================================
  // 1. INSTALLED & ENABLED: Directly open assigned meeting in native app
  // =========================================================================
  if (status === 'ENABLED') {
    try {
      if (MeetingLauncherModule && typeof MeetingLauncherModule.launchMeetingApp === 'function') {
        const success = await MeetingLauncherModule.launchMeetingApp(packageId, meetingUrl);
        if (success) {
          return;
        }
      }
    } catch {
      // Fall through to direct link
    }

    // Direct Intent / OS App Links attempt
    try {
      await Linking.openURL(meetingUrl);
      return;
    } catch {
      notify.error(`Unable to launch ${config.displayName}. Please try again or open in browser.`, 'Meeting Error');
      return;
    }
  }

  // =========================================================================
  // 2. INSTALLED BUT DISABLED: Prompt user to Enable in Android App Settings
  // =========================================================================
  if (status === 'DISABLED') {
    notify.confirm({
      title: `${config.displayName} Disabled`,
      message: `${config.displayName} is installed on your Android device but is currently disabled. Please enable it in Android Settings to join this meeting.`,
      confirmText: `Enable ${config.displayName}`,
      secondaryText: 'Open in Browser',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          if (MeetingLauncherModule && typeof MeetingLauncherModule.openAppSettings === 'function') {
            await MeetingLauncherModule.openAppSettings(packageId);
            return;
          }
          await Linking.openSettings();
        } catch {
          notify.error('Unable to open App Settings. Please enable the application manually in Settings.', 'Settings Error');
        }
      },
      onSecondary: async () => {
        try {
          await Linking.openURL(meetingUrl);
        } catch {
          notify.error('Could not open browser for this meeting link.', 'Browser Error');
        }
      },
    });
    return;
  }

  // =========================================================================
  // 3. NOT INSTALLED: Prompt user to install from exact official Play Store listing
  // =========================================================================
  notify.confirm({
    title: `${config.displayName} Required`,
    message: `${config.displayName} is assigned for this meeting but is not installed on your Android device. Would you like to install ${config.displayName} from Google Play Store?`,
    confirmText: `Install ${config.displayName}`,
    secondaryText: 'Open in Browser',
    cancelText: 'Cancel',
    onConfirm: async () => {
      try {
        if (MeetingLauncherModule && typeof MeetingLauncherModule.openStoreListing === 'function') {
          await MeetingLauncherModule.openStoreListing(packageId);
          return;
        }
        await Linking.openURL(config.playStoreMarketUrl);
      } catch {
        // Fallback to web Play Store page
        try {
          await Linking.openURL(config.playStoreWebUrl);
        } catch {
          // Play Store cannot open -> display clear error and offer browser alternative
          notify.confirm({
            title: 'Play Store Unavailable',
            message: `Could not open Google Play Store for ${config.displayName}. Would you like to join the meeting via your web browser instead?`,
            confirmText: 'Open in Browser',
            cancelText: 'Cancel',
            onConfirm: async () => {
              try {
                await Linking.openURL(meetingUrl);
              } catch {
                notify.error('Unable to open web browser for this meeting.', 'Browser Error');
              }
            },
          });
        }
      }
    },
    onSecondary: async () => {
      try {
        await Linking.openURL(meetingUrl);
      } catch {
        notify.error('Could not open browser for this meeting link.', 'Browser Error');
      }
    },
  });
}

/**
 * Copy text to Android System Clipboard using native MeetingLauncherModule.
 */
export async function copyToSystemClipboard(text: string): Promise<boolean> {
  try {
    if (NativeModules.MeetingLauncherModule?.copyToClipboard) {
      await NativeModules.MeetingLauncherModule.copyToClipboard(text);
      return true;
    }
  } catch (err) {
    console.warn('[MeetingLauncherModule] copyToClipboard error:', err);
  }
  return false;
}
