import { useCallback } from "react";
import { randomUUID } from "expo-crypto";
import * as UiReact from "tinybase/ui-react/with-schemas";
import { Cell, createMergeableStore, Value } from "tinybase/with-schemas";
import { useUserIdAndNickname } from "@/hooks/useNickname";
import { useCreateClientPersisterAndStart } from "@/stores/persistence/useCreateClientPersisterAndStart";
import { useCreateServerSynchronizerAndStart } from "./synchronization/useCreateServerSynchronizerAndStart";

const STORE_ID_PREFIX = "shoppingListStore-";

const VALUES_SCHEMA = {
  listId: { type: "string" },
  name: { type: "string" },
  description: { type: "string" },
  emoji: { type: "string" },
  color: { type: "string" },
  createdAt: { type: "string" },
  updatedAt: { type: "string" },
} as const;
const TABLES_SCHEMA = {
  products: {
    id: { type: "string" },
    name: { type: "string" },
    quantity: { type: "number" },
    units: { type: "string" },
    isPurchased: { type: "boolean", default: false },
    category: { type: "string", default: "" },
    notes: { type: "string" },
    createdBy: { type: "string" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
  collaborators: {
    nickname: { type: "string" },
  },
} as const;

type Schemas = [typeof TABLES_SCHEMA, typeof VALUES_SCHEMA];
type ShoppingListValueId = keyof typeof VALUES_SCHEMA;
type ShoppingListProductCellId = keyof (typeof TABLES_SCHEMA)["products"];

const {
  useCell,
  useCreateMergeableStore,
  useProvideStore,
  useRowCount,
  useSetCellCallback,
  useSortedRowIds,
  useDelRowCallback,
  useSetValueCallback,
  useStore,
  useTable,
  useValue,
} = UiReact as UiReact.WithSchemas<Schemas>;

const useStoreId = (listId: string) => STORE_ID_PREFIX + listId;

// Returns a callback that adds a new product to the shopping list.
export const useAddShoppingListProductCallback = (listId: string) => {
  const store = useStore(useStoreId(listId));
  const [userId, nickname] = useUserIdAndNickname();
  return useCallback(
    (name: string, quantity: number, units: string, notes: string) => {
      const id = randomUUID();
      store.setRow("products", id, {
        id,
        name,
        quantity,
        units,
        notes,
        createdBy: nickname,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return id;
    },
    [store, listId]
  );
};

// Returns a callback that deletes a product from the shopping list.
export const useDelShoppingListProductCallback = (
  listId: string,
  productId: string
) => useDelRowCallback("products", productId, useStoreId(listId));

// Returns a pair of 1) a property of the shopping list, 2) a callback that
// updates it, similar to the React useState pattern.
export const useShoppingListValue = <ValueId extends ShoppingListValueId>(
  listId: string,
  valueId: ValueId
): [
  Value<Schemas[1], ValueId>,
  (value: Value<Schemas[1], ValueId>) => void
] => [
  useValue(valueId, useStoreId(listId)),
  useSetValueCallback(
    valueId,
    (value: Value<Schemas[1], ValueId>) => value,
    [],
    useStoreId(listId)
  ),
];

// Returns the product IDs of the shopping list, sorted by the specified cell.
export const useShoppingListProductIds = (
  listId: string,
  cellId: ShoppingListProductCellId = "createdAt",
  descending?: boolean,
  offset?: number,
  limit?: number
) =>
  useSortedRowIds(
    "products",
    cellId,
    descending,
    offset,
    limit,
    useStoreId(listId)
  );

// Returns the number of products in the shopping list.
export const useShoppingListProductCount = (listId: string) =>
  useRowCount("products", useStoreId(listId));

// Returns a pair of 1) a property of a product in the shopping list, 2) a
// callback that updates it, similar to the React useState pattern.
export const useShoppingListProductCell = <
  CellId extends ShoppingListProductCellId
>(
  listId: string,
  productId: string,
  cellId: CellId
): [
  Cell<Schemas[0], "products", CellId>,
  (cell: Cell<Schemas[0], "products", CellId>) => void
] => [
  useCell("products", productId, cellId, useStoreId(listId)),
  useSetCellCallback(
    "products",
    productId,
    cellId,
    (cell: Cell<Schemas[0], "products", CellId>) => cell,
    [],
    useStoreId(listId)
  ),
];

// Returns the nicknames of people involved in this shopping list.
export const useShoppingListUserNicknames = (listId: string) =>
  Object.entries(useTable("collaborators", useStoreId(listId))).map(
    ([, { nickname }]) => nickname
  );

// Create, persist, and sync a store containing the shopping list and products.
export default function ShoppingListStore({
  listId,
  initialContentJson,
}: {
  listId: string;
  initialContentJson: string;
}) {
  const storeId = useStoreId(listId);
  const [userId, nickname] = useUserIdAndNickname();
  const store = useCreateMergeableStore(() =>
    createMergeableStore().setSchema(TABLES_SCHEMA, VALUES_SCHEMA)
  );
  // Persist store (with initial content if it hasn't been saved before), then
  // ensure the current user is added as a collaborator.
  useCreateClientPersisterAndStart(storeId, store, initialContentJson, () =>
    store.setRow("collaborators", userId, { nickname })
  );
  useCreateServerSynchronizerAndStart(storeId, store);
  useProvideStore(storeId, store);

  return null;
}
