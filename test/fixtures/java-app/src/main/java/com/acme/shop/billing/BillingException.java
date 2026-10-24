package com.acme.shop.billing;

/** Billing failed. */
public class BillingException extends Exception {
    public BillingException(String message, Throwable cause) { super(message, cause); }
}
