import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../ui/screens/LoginScreen";
import SignupScreen from "../ui/screens/SignupScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}
