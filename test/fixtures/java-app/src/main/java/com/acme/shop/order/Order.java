package com.acme.shop.order;

import java.math.BigDecimal;
import java.util.*;

/** An order of a customer. */
public class Order implements Comparable<Order> {
    public static final int MAX_LINES = 50;
    public final String id;
    public List<Line> lines = new ArrayList<>();
    protected Status status;
    String note;

    public Order(String id) { this.id = id; }
    public Order(String id, Line... lines) { this(id); }

    public BigDecimal total() { return BigDecimal.ZERO; }
    public BigDecimal total(String currency) { return total(); }
    public <T extends Comparable<? super T>> T max(Collection<? extends T> items) { return null; }
    public int[] quantities() { return new int[0]; }

    @Override
    public int compareTo(Order other) { return id.compareTo(other.id); }

    /** One line of an order. */
    public record Line(String sku, int quantity) {
        public Line {
            if (quantity < 1) throw new IllegalArgumentException();
        }
        public boolean isBulk() { return quantity > 10; }
    }

    static class Draft {}
}

/** Not public: not part of the API. */
class OrderHelper {
    public static void help() {}
}
