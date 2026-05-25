import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const INJECTION_REMINDER_TAG = 'injection-reminder';

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleInjectionReminder(nextDateMs: number): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(INJECTION_REMINDER_TAG);

  if (nextDateMs <= Date.now()) return;

  const date = new Date(nextDateMs);
  date.setHours(9, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    identifier: INJECTION_REMINDER_TAG,
    content: {
      title: '💉 Dia de injeção',
      body: 'Está na hora da tua dose semanal',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}

export async function cancelInjectionReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(INJECTION_REMINDER_TAG);
}
