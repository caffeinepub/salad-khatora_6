# Salad Khatora

## Current State
The Admin Orders page (`AdminOrders.tsx`) has a table with columns: Order ID, Customer, Items, Amount, Date, Rider, Status, and Actions. The Actions column contains a status selector, a Rider assignment button, and a View button. Order data is stored with `notes` (JSON-encoded delivery address, payment method, coupon code). The `parseOrderNotes` helper extracts delivery address, payment method, coupon code from the notes field.

## Requested Changes (Diff)

### Add
- A new standalone **"Receipt"** column in the Orders table (separate from Actions column).
- A **"Print Receipt"** button in that column for every order row.
- A **Receipt Modal/Dialog** that opens within the admin panel when Print Receipt is clicked.
- Receipt content formatted as a thermal POS receipt (80mm style):
  - Header: Salad Khatora, address, phone, GST number
  - Order ID, Date & Time
  - Customer name and phone (from delivery address stored in notes)
  - Itemised list: item name, qty, price per line
  - Subtotal, Discount (if coupon applied), Tax (GST), Total Amount
  - Amount Received (equals Total Amount)
  - Payment Mode (Cash on Delivery / UPI / Online)
  - Footer: "Thank You, Visit Again!"
- Two action buttons in the receipt modal: **Print Receipt** and **Download PDF** (both trigger `window.print()` with `@media print` CSS that hides admin UI and shows only the receipt).
- `@media print` CSS scoped to hide all admin UI elements and show only the receipt content.

### Modify
- `AdminOrders.tsx`: Add new `receiptModal` state, `openReceiptModal` function, the new Receipt table column header and cell, and the Receipt Dialog component.
- Table header row: add a new `<TableHead>` for "Receipt" between Status and Actions.
- Table body rows: add a new `<TableCell>` with the Print Receipt button.

### Remove
- Nothing removed.

## Implementation Plan
1. In `AdminOrders.tsx`, add `receiptModal` state (`{ open: boolean; orderId: bigint | null }`).
2. Add `openReceiptModal(orderId)` function.
3. Add a new `<TableHead>` column "Receipt" in the header row.
4. Add a new `<TableCell>` in each order row with a `<Button>` labelled "Print Receipt" (with a Printer icon) that calls `openReceiptModal(order.id)`.
5. Add a Receipt Dialog:
   - Uses `parseOrderNotes` to extract customer name, phone, delivery address, payment method, coupon code.
   - Calculates subtotal from items (`unitPrice × quantity`), derives discount if coupon present (totalAmount difference), derives tax from notes if available.
   - Renders receipt in a fixed ~80mm-width div with monospaced font inside the dialog.
   - Two buttons: "Print Receipt" and "Download PDF" — both call `window.print()`.
6. Add a `<style>` block (or inject via `useEffect`) with `@media print` CSS that:
   - Hides everything except the receipt div.
   - Removes dialog chrome, nav, sidebar.
   - Sets page width to 80mm.
7. Use `formatDateTime` for the receipt date/time.
8. Amount Received = Total Amount (no separate input needed).
