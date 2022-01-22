import React, { useState, useEffect } from 'react';
import { Avatar, Button, Card, Title, Paragraph } from 'react-native-paper';
import { StyleSheet, Text, View } from 'react-native';
import AudioRecorderPlayer, { 
  AVEncoderAudioQualityIOSType,
  AVEncodingOption, 
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType, 
 } from 'react-native-audio-recorder-player';

import Styles from './Styles';

export default function Content() {

  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const [recordSecs, setRecordSecs] = useState(0);
  const [audioRecorderPlayer, setAudioRecorderPlayer] = useState(new AudioRecorderPlayer());

  async function startRecord() {
    const path = 'hello.m4a';
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };
    console.log('audioSet', audioSet);
    const uri = await audioRecorderPlayer.startRecorder(path, audioSet);
    audioRecorderPlayer.addRecordBackListener((e) => {
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.current_position)));
      setRecordSecs(e.current_position);
    });
    console.log(`uri: ${uri}`);
    console.log("more testing");
    setIsRecording(true);
  }

  async function stopRecord() {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setRecordSecs(0);
    console.log(result);
    setIsRecording(false);
  }

  function displayButton() {
    if (!isRecording) {
      return (
        <Button style={Styles.button} mode="contained" icon="record" onPress={startRecord}>
        RECORD
        </Button>
      )
    }
    else {
      return (
        <Button style={Styles.button} icon="stop" mode="outlined" onPress={stopRecord}>
          STOP
        </Button>
      )
    }
  }
  return (
    <Card style={Styles.card}>
      <Title style={Styles.title}>{recordTime}</Title>
      {displayButton()}
    </Card>
  )
}