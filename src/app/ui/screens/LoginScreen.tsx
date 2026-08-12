import React, { useState, useCallback, useMemo, memo } from "react";
import { View, TextInput, StyleSheet, Alert, Text, Pressable } from "react-native";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginThunk } from "../../store/slices/auth.slice";
import { selectThemeMode } from "../../store/slices/theme.slice";
import { getTheme } from "../../config/theme";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ThemedButton from "../components/ThemedButton";

type AuthStackNavigationProp = NativeStackNavigationProp<any>;

const LoginScreen = memo(function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const navigation = useNavigation<AuthStackNavigationProp>();
  const themeMode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);
  const dynamicStyles = useMemo(() => createDynamicStyles(theme), [theme]);

  const onLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      await dispatch(loginThunk({ email: email.trim(), password })).unwrap();
    } catch (error: any) {
      Alert.alert("Login failed", error?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }, [email, password, dispatch]);

  const handleSignup = useCallback(() => {
    navigation.navigate("Signup");
  }, [navigation]);

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Task Manager</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={dynamicStyles.input}
        editable={!loading}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={dynamicStyles.input}
        editable={!loading}
      />

      <ThemedButton
        title={loading ? "Logging in..." : "Login"}
        onPress={onLogin}
        disabled={loading}
        variant="primary"
      />

      <View style={dynamicStyles.signupLinkContainer}>
        <Text style={dynamicStyles.signupText}>Don't have an account? </Text>
        <Pressable onPress={handleSignup} disabled={loading}>
          <Text style={dynamicStyles.signupLink}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
});

const createDynamicStyles = (theme: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 16,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
      textAlign: "center",
      marginBottom: 32,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 12,
      padding: 12,
      borderRadius: 6,
      color: theme.text,
      backgroundColor: theme.surface,
    },
    signupLinkContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 16,
    },
    signupText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    signupLink: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: "600",
    },
  });

export default LoginScreen;
