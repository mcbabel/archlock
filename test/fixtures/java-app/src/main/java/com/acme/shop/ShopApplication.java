package com.acme.shop;

import com.acme.shop.order.OrderService;

/** Starts the shop. */
public final class ShopApplication {
    public static void main(String[] args) {
        new OrderService(com.acme.shop.billing.BillingService.create()).placeAll(args);
    }

    private ShopApplication() {}
}
