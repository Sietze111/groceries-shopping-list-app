import ShoppingListItem from "@/components/ShoppingListItem";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Link, Stack } from "expo-router";
import Animated from "react-native-reanimated";
import { useSortedRowIds } from "tinybase/ui-react";

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href="/new-list">
              <IconSymbol size={24} name="plus" color={"#007AFF"} />
            </Link>
          ),
          headerLeft: () => (
            <Link href="/profile">
              <IconSymbol size={22} name="person" color={"#007AFF"} />
            </Link>
          ),
        }}
      />
      <BodyScrollView contentContainerStyle={{}}>
        <Animated.FlatList
          data={useSortedRowIds("shoppingLists", "createdAt")}
          renderItem={({ item }) => {
            return <ShoppingListItem id={item} />;
          }}
          contentContainerStyle={{
            paddingTop: 8,
          }}
        />
      </BodyScrollView>
    </>
  );
}
