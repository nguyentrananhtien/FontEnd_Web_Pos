// import { Stack } from "expo-router";
// import "./global.css";
// import { CartProvider } from "@/providers/cart-provider";
// import { AuthProvider } from "@/providers/auth-provider";
//
// export default function RootLayout() {
//   return (
//     <AuthProvider>
//       <CartProvider>
//         <Stack
//           screenOptions={{
//             headerShown: false,
//           }}
//         >
//           <Stack.Screen name="index" />
//           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//           <Stack.Screen name="order-confirmation" />
//         </Stack>
//       </CartProvider>
//     </AuthProvider>
//   );
// }


import { Stack } from "expo-router";
import "./global.css";
import { CartProvider } from "@/providers/cart-provider";
import { AuthProvider } from "@/providers/auth-provider";

export default function RootLayout() {
    return (
        <AuthProvider>
            <CartProvider>
                <Stack
                    // Để test, bạn có thể thêm initialRouteName="profile"
                    // để App vừa mở lên là vào thẳng trang Profile
                    initialRouteName="profile"
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="profile" options={{ headerShown: true, title: 'Hồ sơ cá nhân' }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="order-confirmation" />
                </Stack>
            </CartProvider>
        </AuthProvider>
    );
}