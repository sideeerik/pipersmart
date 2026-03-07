import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { BACKEND_URL } from 'react-native-dotenv';
import { getToken } from '../Components/utils/helpers';

/**
 * Export activities as PDF or Word
 * @param {string} format - 'pdf' or 'word'
 * @param {object} filters - { startDate, endDate, types, sort, notes }
 */
export const exportActivities = async (format = 'pdf', filters = {}) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.sort) queryParams.append('sort', filters.sort);
    if (filters.notes) queryParams.append('notes', filters.notes);
    if (Array.isArray(filters.types) && filters.types.length > 0) {
      filters.types.forEach((type) => queryParams.append('types', type));
    }

    const queryString = queryParams.toString();
    const endpoint = `${BACKEND_URL}/api/v1/export/${format}${queryString ? `?${queryString}` : ''}`;

    const extension = format === 'pdf' ? 'pdf' : 'doc';
    const mimeType = format === 'pdf' ? 'application/pdf' : 'application/msword';
    const fileName = `PiperSmart_Activities_${Date.now()}.${extension}`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;

    const downloadResult = await FileSystem.downloadAsync(endpoint, filePath, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: mimeType,
      },
    });

    if (downloadResult.status < 200 || downloadResult.status >= 300) {
      let serverMessage = `Export failed (status ${downloadResult.status}).`;

      try {
        const errorText = await FileSystem.readAsStringAsync(downloadResult.uri);
        const errorJson = JSON.parse(errorText);
        serverMessage = errorJson.message || errorJson.error || serverMessage;
      } catch (_) {
        // Keep generic fallback message
      }

      await FileSystem.deleteAsync(downloadResult.uri, { idempotent: true });
      throw new Error(serverMessage);
    }

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(downloadResult.uri, {
        mimeType,
        dialogTitle: `PiperSmart - Recent Activities Report (${format.toUpperCase()})`,
      });
    } else {
      Alert.alert('Info', `File saved to ${downloadResult.uri}. Sharing is not available on this device.`);
    }

    return { success: true, filePath: downloadResult.uri, fileName };
  } catch (error) {
    console.error(`Export error (${format}):`, error);
    const errorMessage = getErrorMessage(error);
    Alert.alert('Export Failed', errorMessage);
    throw error;
  }
};

/**
 * Export activities as PDF
 */
export const exportAsPDF = (filters) => exportActivities('pdf', filters);

/**
 * Export activities as Word
 */
export const exportAsWord = (filters) => exportActivities('word', filters);

/**
 * Prepare filters for export
 */
export const prepareFilters = (filterSort, activityFilter, dateRange) => {
  const filters = {};

  if (dateRange?.startDate && dateRange?.endDate) {
    filters.startDate = dateRange.startDate.toISOString();
    filters.endDate = dateRange.endDate.toISOString();
  }

  if (activityFilter && activityFilter !== 'all') {
    filters.types = [activityFilter];
  }

  if (filterSort) {
    filters.sort = filterSort;
  }

  return filters;
};

/**
 * Get user-friendly error message
 */
function getErrorMessage(error) {
  const message = error?.message || '';

  if (message.toLowerCase().includes('network')) {
    return 'Network error. Please check your internet connection.';
  }

  if (message.toLowerCase().includes('unauthorized') || message.includes('401')) {
    return 'Unauthorized. Please log in again.';
  }

  if (message.includes('404')) {
    return 'Activity data not found.';
  }

  if (message.includes('500')) {
    return 'Server error. Please try again later.';
  }

  return message || 'Unknown error occurred';
}

export default {
  exportActivities,
  exportAsPDF,
  exportAsWord,
  prepareFilters,
};
