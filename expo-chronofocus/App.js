import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri: 'https://gemini-internship.vercel.app/focus-timer/' }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
