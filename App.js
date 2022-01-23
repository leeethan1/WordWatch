import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import Content from './Content'
import Styles from './Styles';

export default function App() {
  function recordVoice() {
    console.log("hello")
  }

  return (
    <PaperProvider>
      <Content/>
    </PaperProvider>
    // <View style={Styles.container}>
    //   <Content/>
    // </View>
  );
}
