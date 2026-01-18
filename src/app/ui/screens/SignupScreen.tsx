import React, { useState, useCallback, useMemo, memo } from "react";
import { View, TextInput, Button, StyleSheet, Alert, Text, Pressable } from "react-native";
import { signup } from "../../services/auth.service";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setUser } from "../../store/slices/auth.slice";
import { selectThemeMode } from "../../store/slices/theme.slice";
import { getTheme } from "../../config/theme";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type AuthStackNavigationProp = NativeStackNavigationProp<any>;

const SignupScreen = memo(function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const navigation = useNavigation<AuthStackNavigationProp>();
  const themeMode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);
  const dynamicStyles = useMemo(() => createDynamicStyles(theme), [theme]);

  const onSignup = useCallback(async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await signup(email.trim(), password);
      dispatch(setUser(res.user));
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("Tasks");
    } catch (error: any) {
      Alert.alert("Signup failed", error.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [email, password, dispatch, navigation]);

  const handleSignIn = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Create Account</Text>
      
      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
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

      <Button
        title={loading ? "Signing Up..." : "Sign Up"}
        onPress={onSignup}
        disabled={loading}
        color={theme.primary}
      />

      <View style={dynamicStyles.signinLinkContainer}>
        <Text style={dynamicStyles.signinText}>Already have an account? </Text>
        <Pressable onPress={handleSignIn} disabled={loading}>
          <Text style={dynamicStyles.signinLink}>Sign In</Text>
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
    signinLinkContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 16,
    },
    signinText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    signinLink: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: "600",
    },
  });

export default SignupScreen;
