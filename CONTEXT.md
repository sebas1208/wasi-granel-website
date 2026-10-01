# Wasi Granel Domain

The core e-commerce and catalog context for Wasi Granel, an online storefront and order management system for dried fruits, nuts, seeds, and natural food products.

## Language

### Catalog & Products

**Product**:
An item available in the store catalog, categorized into bulk or packaged goods.
_Avoid_: Item, commodity

**Bulk Product (Producto a Granel)**:
A product sold by weight rather than discreet packages, selected via predefined Weight Tiers.
_Avoid_: Loose food, raw product

**Packaged Product (Producto Envasado)**:
A product sold as a single packaged unit (e.g. jars, bottles, snack packs).
_Avoid_: Unit item

**Weight Tier (Fracción de Peso)**:
A fixed allowable weight option for purchasing a Bulk Product (100g, 250g, 500g, 1000g).
_Avoid_: Gram input, custom quantity

### Cart & Orders

**Cart (Carrito)**:
The customer's active collection of selected products, weight tiers, and quantities.
_Avoid_: Basket, trolley

**Order (Pedido)**:
A recorded intent to purchase that is assigned a unique identifier, saved in the system, and dispatched to WhatsApp for fulfillment and payment coordination.
_Avoid_: Sale, transaction, checkout submission

**Lead / Abandoned Order (Pedido Pendiente / Lead)**:
An order registered in the system where the customer was redirected to WhatsApp but the store hasn't confirmed payment or delivery.
_Avoid_: Lost sale, drop-off

**Fulfillment Method (Modalidad de Entrega)**:
How the customer receives their order: either Store Pickup ("Recojo en Tienda") or Home Delivery ("Envío a Domicilio").
_Avoid_: Shipping type, delivery method

### Pricing & Payments

**Currency**:
United States Dollar (USD `$`).

**Payment Coordination (Coordinación de Pago)**:
Payment finalized via chat/in-person through cash (*Efectivo*), bank transfer (*Transferencia Bancaria*), or mobile app (*DeUna*).
_Avoid_: Payment gateway, card transaction

### Views & Navigation

**Catalog Card (Tarjeta de Producto)**:
The summary component shown in the store grid featuring quick weight-tier chips and an immediate add-to-cart action.
_Avoid_: Tile, product snippet

**Product Detail Page (Ficha de Producto)**:
The dedicated view for a product featuring high-resolution photography, origin details, nutritional profile, and usage suggestions.
_Avoid_: Item page, profile

## Example Dialogue

> **Dev**: When the customer clicks "Enviar por WhatsApp", does that count as a sale immediately?
> **Owner**: No, that creates an **Order**. We save the order details first in case they never message us on WhatsApp—that way it's a **Lead** we can follow up with. Once we confirm delivery details and receive payment in the chat, the **Order** is confirmed.
> **Dev**: And how do they pick how much granola or almonds they want?
> **Owner**: They choose a **Weight Tier** like 250g or 500g for that **Bulk Product**, rather than typing random numbers.
