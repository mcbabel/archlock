package com.acme.shop.order;

import static java.util.Objects.requireNonNull;

import com.acme.shop.billing.*;
import org.slf4j.Logger;

/** Places orders and bills them. */
public class OrderService {
    private final BillingService billing;

    public OrderService(BillingService billing) { this.billing = requireNonNull(billing); }

    public void placeAll(String... ids) {}

    public Invoice place(Order order) throws BillingException { return billing.bill(order.id); }
}
