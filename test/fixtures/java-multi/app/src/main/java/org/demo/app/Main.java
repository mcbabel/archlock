package org.demo.app;

import org.demo.core.Greeter;

public class Main {
    public static void main(String[] args) {
        System.out.println(Greeter.polite().greet(args.length > 0 ? args[0] : "world"));
    }
}
