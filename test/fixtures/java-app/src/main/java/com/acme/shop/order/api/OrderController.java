package com.acme.shop.order.api;

import com.acme.shop.order.Order;
import com.acme.shop.order.OrderService;

/** HTTP endpoints for orders. */
public abstract class OrderController {
    public abstract Status get(String id);

    protected OrderService service;
}
