package org.demo.core;

/** Builds greetings. */
public interface Greeter {
    String greet(String name);

    static Greeter polite() {
        return name -> "Hello, " + name;
    }
}
