import React from "react";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import ShoppingListProductItem from "@/components/ShoppingListProductItem";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  useShoppingListProductIds,
  useShoppingListValue,
} from "@/stores/ShoppingListStore";
import { ThemedText } from "@/components/ThemedText";

export default function ListScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams() as { listId: string };
  const [name] = useShoppingListValue(listId, "name");
  const [emoji] = useShoppingListValue(listId, "emoji");
  const [color] = useShoppingListValue(listId, "color");
  const [description] = useShoppingListValue(listId, "description");
  const newProductHref = {
    pathname: "/list/[listId]/product/new",
    params: { listId },
  } as const;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: emoji + " " + name,
          headerRight: () => (
            <>
              <Link
                href={{ pathname: "/list/[listId]/edit", params: { listId } }}
                style={{ marginRight: 8 }}
              >
                <IconSymbol
                  size={24}
                  name="pencil.and.list.clipboard"
                  color={"#007AFF"}
                />
              </Link>
              <Link href={newProductHref}>
                <IconSymbol size={24} name="plus" color={"#007AFF"} />
              </Link>
            </>
          ),
        }}
      />
      <Animated.FlatList
        data={useShoppingListProductIds(listId)}
        renderItem={({ item: productId }) => (
          <ShoppingListProductItem listId={listId} productId={productId} />
        )}
        contentContainerStyle={{
          paddingTop: 12,
        }}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={() =>
          description ? (
            <ThemedText
              style={{ paddingHorizontal: 16, fontSize: 14, color: "gray" }}
            >
              {description}
            </ThemedText>
          ) : null
        }
        ListEmptyComponent={() => (
          <BodyScrollView
            contentContainerStyle={{
              alignItems: "center",
              gap: 8,
              paddingTop: 100,
            }}
          >
            <Button onPress={() => router.push(newProductHref)} variant="ghost">
              Add the first product to this list
            </Button>
          </BodyScrollView>
        )}
      />
    </>
  );
}
