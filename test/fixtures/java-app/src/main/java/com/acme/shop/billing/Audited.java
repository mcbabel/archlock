package com.acme.shop.billing;

import java.lang.annotation.*;

/** Marks audited operations. */
@Retention(RetentionPolicy.RUNTIME)
public @interface Audited {
    String value() default "";
    int level() default 1;
}
