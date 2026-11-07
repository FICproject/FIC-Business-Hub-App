/**
 * FIC Business Hub - FCM Push Notification Sender Example
 *
 * Requirements:
 *   1. Download your Service Account JSON from Firebase Console:
 *      Project Settings -> Service Accounts -> "Generate new private key"
 *   2. Save it in this directory as `service-account.json`
 *   3. Run: node send_fcm_example.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.log('================================================================');
  console.log('FIC Business Hub - Real FCM Notification Trigger');
  console.log('================================================================');
  console.log('To send push notifications directly from Node.js:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/fic-business-hub/settings/serviceaccounts/adminsdk');
  console.log('2. Click "Generate new private key" and download the JSON file.');
  console.log('3. Save it as "scripts/service-account.json" and run this script again.');
  console.log('\nAlternatively, you can test INSTANTLY from the Firebase Console:');
  console.log('1. Go to: https://console.firebase.google.com/project/fic-business-hub/notification');
  console.log('2. Click "New campaign" -> "Notifications".');
  console.log('3. Click "Send test message" and paste one of the live device tokens:');
  console.log('   - Emulator Token:');
  console.log('     evdV6rthSc2xrQS1VqO1QV:APA91bENVf079qnM6_JMMVb6rLEA2XYyfC-3BtrSdxOylBxijcU7Pvi_2AXF6noPV2XTNIw_-L8VDhgsRz82kZzLiWtLZBHOvGVpTOlystdJIUj-iPcf9jQ');
  console.log('   - Physical Samsung Device Token:');
  console.log('     cCKSKS6yShCNrk-ykpo7nV:APA91bGNYzvccfMkLsecMTHGGdulk2H229FI49V2R4XpEOon_DQca5lEdb9xcT5T8JPM38rabGf_kaNaDaOU5G1CCy_YAphTN8rmSyuhrnpyrroSGsLo2sc');
  console.log('================================================================');
  process.exit(0);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function sendTestNotification(deviceToken, title, body, targetScreen = 'Meetings') {
  const message = {
    token: deviceToken,
    notification: {
      title,
      body,
    },
    data: {
      screen: targetScreen, // 'Meetings', 'Requests', 'Marketplace', 'Courses', 'Profile'
      timestamp: new Date().toISOString(),
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'fic_high_importance_channel',
        sound: 'default',
        icon: 'ic_launcher',
        color: '#2563EB',
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully dispatched FCM push notification:', response);
  } catch (error) {
    console.error('Failed to send FCM push notification:', error);
  }
}

// Example usage:
const sampleToken = 'evdV6rthSc2xrQS1VqO1QV:APA91bENVf079qnM6_JMMVb6rLEA2XYyfC-3BtrSdxOylBxijcU7Pvi_2AXF6noPV2XTNIw_-L8VDhgsRz82kZzLiWtLZBHOvGVpTOlystdJIUj-iPcf9jQ';
sendTestNotification(sampleToken, 'FIC Hub Consultation Update 📅', 'Your mentor session has been confirmed!', 'Meetings');

