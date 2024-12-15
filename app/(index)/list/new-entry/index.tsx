import React, { useState } from "react";
import { randomUUID } from "expo-crypto";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/text-input";
import { useAddShoppingListEntryCallback } from "@/stores/ShoppingListStore";

export default function CreateItemScreen() {
  const { listId } = useLocalSearchParams() as { listId: string };
  const [name, setName] = useState("");

  const router = useRouter();
  const addShoppingListEntry = useAddShoppingListEntryCallback(listId);

  const handleCreateEntry = () => {
    if (!name) {
      return;
    }

    const id = randomUUID();
    addShoppingListEntry(id, name);

    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitle: false,
          headerTitle: "New entry",
        }}
      />
      <BodyScrollView
        contentContainerStyle={{
          padding: 16,
        }}
      >
        <TextInput
          label="Entry name"
          placeholder="Potatoes"
          value={name}
          onChangeText={setName}
        />
        <Button onPress={handleCreateEntry} disabled={!name}>
          Create entry
        </Button>
      </BodyScrollView>
    </>
  );
}
