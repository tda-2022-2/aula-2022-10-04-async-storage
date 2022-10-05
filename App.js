import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// poucas perguntas, carregando memória
import array from './perguntas.json';

const Quiz = ({ navigation }) => {
  const responder = pergunta => navigation
    .navigate('Responder', { pergunta }); // params

  const [perguntas, setPerguntas] = useState([]);
  const [respostas, setRespostas] = useState({});

  // FIXME: needs improvement
  useFocusEffect(React.useCallback(() => {
      (async () => {
        setPerguntas(array);
        const respostas = await AsyncStorage.getItem('respostas') || '{}';
        setRespostas(JSON.parse(respostas));
        console.log(respostas);
      })();
    }, [array])
  );

  
  return (
    <>
      {perguntas.map(pergunta => (
          <View key={pergunta.id} style={{height: 40, margin: 10}}>
            <Text>{pergunta.enunciado}</Text>
            <Pressable onPress={() => responder(pergunta)}
              style={[
                styles.button, 
                respostas[pergunta.id] && { backgroundColor: 'green' }]}>
              <Text style={styles.text}>Responder</Text>
            </Pressable>
          </View>
        ))}
    </>
  )
};

const Responder = ({ navigation, route }) => {
  const resposta = async (id, estaCorreta) => {
    const str = await AsyncStorage.getItem('respostas');
    const respostas = (str && JSON.parse(str)) || {};
    respostas[`${id}`] = estaCorreta;
    AsyncStorage.setItem('respostas', JSON.stringify(respostas));
    navigation.goBack();
  };
  
  const pergunta = route.params.pergunta;

  return (
    <View style={{ margin: 10 }}>
      <Text>{pergunta.enunciado}</Text>
      <View>
        {pergunta.respostas.map(resp => (
          <View key={resp.texto} style={{ margin: 20 }}>
            <Button title={resp.texto} onPress={() => resposta(pergunta.id, resp.correta)} />
          </View>
        ))}
      </View>
    </View>
  )
};

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Quiz: Lista de Perguntas */}
        <Stack.Screen name="Quiz" component={Quiz} />
        {/* Responder: Tela para responder */}
        <Stack.Screen name="Responder" component={Responder} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});