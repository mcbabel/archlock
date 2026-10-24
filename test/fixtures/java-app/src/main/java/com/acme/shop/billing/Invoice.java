package com.acme.shop.billing;

import java.time.Instant;

/** A bill for an order. */
public sealed interface Invoice permits Invoice.Paid, Invoice.Open {
    String orderId();

    /** A paid invoice. */
    record Paid(String orderId, Instant at) implements Invoice {}

    /** An open invoice. */
    final class Open implements Invoice {
        public String orderId() { return ""; }
    }
}
