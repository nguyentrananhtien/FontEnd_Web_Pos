import { Stack } from "expo-router";
import "./global.css";
import { CartProvider } from "@/providers/cart-provider";
import { AuthProvider } from "@/providers/auth-provider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="order-confirmation" />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}

