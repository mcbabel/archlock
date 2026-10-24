package com.acme.shop.billing;

/** Creates invoices. */
public interface BillingService extends AutoCloseable {
    int RETRIES = 3;

    Invoice bill(String orderId) throws BillingException;

    default boolean enabled() { return true; }

    static BillingService create() { return orderId -> null; }

    private void log() {}

    @Override
    void close();
}
