package com.acme.shop.order;

/** Where an order is. */
public enum Status implements java.io.Serializable {
    NEW, PAID("paid"), SHIPPED;

    private final String label;

    Status() { this("new"); }
    Status(String label) { this.label = label; }

    public String label() { return label; }
    public static Status parse(String text) { return valueOf(text); }
}
