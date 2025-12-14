import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { MainTabs } from './MainTabs';
import { AddTicketScreen } from '../screens/AddTicketScreen';
import { TicketDetailScreen } from '../screens/TicketDetailScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen
      name="AddTicket"
      component={AddTicketScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom'
      }}
    />
    <Stack.Screen
      name="TicketDetail"
      component={TicketDetailScreen}
      options={{
        animation: 'slide_from_right'
      }}
    />
  </Stack.Navigator>
);

export const AppNavigator: React.FC = () => {
  // DESACTIVADO LOGIN PARA DESARROLLO
  // const { isAuthenticated, isLoading } = useAuth();

  // if (isLoading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#1a73e8" />
  //     </View>
  //   );
  // }

  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa'
  }
});
